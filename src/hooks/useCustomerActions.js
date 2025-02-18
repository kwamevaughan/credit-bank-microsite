// hooks/useCustomerActions.js
import { useState, useCallback } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';

const useCustomerActions = ({ setCustomers, notify, refetchCustomers }) => {
    const [actionLoading, setActionLoading] = useState(false);

    const toggleStatus = useCallback(async (id) => {
        setActionLoading(true);
        try {
            // Fetch customer data
            const { data: customerData, error: customerError } = await supabase
                .from('account_opening')
                .select('*')
                .eq('id', id)
                .single();

            if (customerError) {
                console.error("Error fetching customer:", customerError.message);
                notify("Error fetching customer data.", "error");
                return;
            }

            if (!customerData) {
                console.error("Customer not found in database");
                notify("Customer not found.", "error");
                return;
            }

            const { account_type, status, user_id, referral_code } = customerData;

            // Double check user_id exists
            if (!user_id) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('name', customerData.name)
                    .single();

                if (userError || !userData) {
                    console.error("Could not find user_id for customer:", customerData.name);
                    notify("Could not find associated user account.", "error");
                    return;
                }

                const { error: updateError } = await supabase
                    .from('account_opening')
                    .update({ user_id: userData.id })
                    .eq('id', id);

                if (updateError) {
                    console.error("Error updating user_id:", updateError.message);
                    notify("Error updating customer data.", "error");
                    return;
                }

                customerData.user_id = userData.id;
            }

            const newStatus = status === "Approved" ? 'Pending' : 'Approved';
            const POINTS_FOR_APPROVAL = 200;
            const pointsChange = newStatus === 'Approved' ? POINTS_FOR_APPROVAL : -POINTS_FOR_APPROVAL;

            // Fetch current user data including actions_completed and referral_count
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, points, actions_completed, referral_count')
                .eq('id', customerData.user_id)
                .single();

            if (userError) {
                console.error("Error fetching user:", userError.message);
                notify("Error fetching user data.", "error");
                return;
            }

            const currentPoints = userData.points || 0;
            const currentActions = userData.actions_completed || 0;

            const updatedPoints = currentPoints + pointsChange;
            const updatedActions = newStatus === 'Approved'
                ? currentActions + 1
                : Math.max(currentActions - 1, 0);

            // Update user points and actions_completed
            const { error: updateErrorUser } = await supabase
                .from('users')
                .update({
                    points: updatedPoints,
                    actions_completed: updatedActions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', customerData.user_id);

            if (updateErrorUser) {
                console.error("Error updating user data:", updateErrorUser.message);
                notify("Error updating user data.", "error");
                return;
            }

            // Log the activity for the customer (referee)
            if (newStatus === 'Approved') {
                const { error: activityError } = await supabase
                    .from('user_activities')
                    .insert([
                        {
                            user_id: customerData.user_id,
                            points: POINTS_FOR_APPROVAL,
                            activity_type: `Opened a ${account_type} account`,
                            platform_url: window.location.href,
                            created_at: new Date().toISOString(),
                        }
                    ]);

                if (activityError) {
                    console.error("Error logging activity:", activityError.message);
                }
            } else {
                // Remove the activity for the referee when status is changed to Pending
                const { error: deleteActivityError } = await supabase
                    .from('user_activities')
                    .delete()
                    .match({
                        user_id: customerData.user_id,
                        activity_type: `Opened a ${account_type} account`
                    });

                if (deleteActivityError) {
                    console.error("Error removing activity log:", deleteActivityError.message);
                }
            }

            // Handle referrer logic (points addition and deduction)
            if (newStatus === 'Approved' && referral_code) {
                const { data: referrerData, error: referrerError } = await supabase
                    .from('users')
                    .select('id, points, referral_count, actions_completed, name')
                    .eq('referral_code', referral_code)
                    .single();

                if (referrerError || !referrerData) {
                    console.error("Error finding referrer:", referrerError ? referrerError.message : "No referrer found.");
                } else {
                    const referrerPoints = referrerData.points || 0;
                    const updatedReferrerPoints = referrerPoints + 50; // Add 50 points when approved
                    const updatedReferralCount = referrerData.referral_count + 1;
                    const updatedReferrerActions = referrerData.actions_completed + 1;

                    // Update referrer points, referral_count, and actions_completed
                    const { error: updateReferrerError } = await supabase
                        .from('users')
                        .update({
                            points: updatedReferrerPoints,
                            referral_count: updatedReferralCount,
                            actions_completed: updatedReferrerActions
                        })
                        .eq('id', referrerData.id);

                    if (updateReferrerError) {
                        console.error("Error updating referrer points:", updateReferrerError.message);
                    } else {
                        // Log referrer activity
                        const { error: activityError } = await supabase
                            .from('user_activities')
                            .insert([
                                {
                                    user_id: referrerData.id,
                                    points: 50,
                                    activity_type: `Referred ${customerData.name} to open a ${account_type} account`,
                                    platform_url: window.location.href,
                                    created_at: new Date().toISOString(),
                                }
                            ]);

                        if (activityError) {
                            console.error("Error logging referrer activity:", activityError.message);
                        } else {
                            notify(`50 points assigned to referrer, ${referrerData.name}`, "success");
                        }
                    }
                }
            }

            // Update account opening status and points in account_opening table
            const { error: statusError } = await supabase
                .from('account_opening')
                .update({
                    status: newStatus,
                    points: pointsChange,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (statusError) {
                console.error("Error updating status and points:", statusError.message);
                notify("Error updating status and points.", "error");
                return;
            }

            // Handle removal logic when toggling back to Pending (deduct points from referrer)
            if (newStatus === 'Pending' && referral_code) {
                const { data: referrerData, error: referrerError } = await supabase
                    .from('users')
                    .select('id, points, referral_count, actions_completed, name')
                    .eq('referral_code', referral_code)
                    .single();

                if (referrerError || !referrerData) {
                    console.error("Error finding referrer:", referrerError ? referrerError.message : "No referrer found.");
                } else {
                    const referrerPoints = referrerData.points || 0;
                    const updatedReferrerPoints = Math.max(referrerPoints - 50, 0); // Deduct 50, ensure it doesn't go negative
                    const updatedReferralCount = referrerData.referral_count - 1;
                    const updatedReferrerActions = Math.max(referrerData.actions_completed - 1, 0);

                    // Update referrer points, referral_count, and actions_completed
                    const { error: updateReferrerError } = await supabase
                        .from('users')
                        .update({
                            points: updatedReferrerPoints,
                            referral_count: updatedReferralCount,
                            actions_completed: updatedReferrerActions
                        })
                        .eq('id', referrerData.id);

                    if (updateReferrerError) {
                        console.error("Error updating referrer points:", updateReferrerError.message);
                    } else {
                        // Remove referrer activity log
                        const { error: deleteActivityError } = await supabase
                            .from('user_activities')
                            .delete()
                            .match({
                                user_id: referrerData.id,
                                activity_type: `Referred ${customerData.name} to open a ${account_type} account`
                            });

                        if (deleteActivityError) {
                            console.error("Error removing referrer activity log:", deleteActivityError.message);
                        } else {
                            notify(`50 points have been removed from referrer, ${referrerData.name}`, "error");
                        }
                    }
                }
            }

            refetchCustomers();

            // Notify the customer
            notify(`${newStatus === 'Approved' ? 'Assigned' : 'Removed'} ${POINTS_FOR_APPROVAL} points for ${customerData.name}`, "success");

        } catch (error) {
            console.error("Unexpected error occurred:", error);
            notify("An unexpected error occurred.", "error");
        } finally {
            setActionLoading(false);
        }
    }, [setCustomers, notify, refetchCustomers]);


    const handleDelete = useCallback(async (id) => {
        setActionLoading(true);
        try {
            // Fetch customer data
            const { data: customerData, error: customerError } = await supabase
                .from('account_opening')
                .select('*')
                .eq('id', id)
                .single();

            if (customerError) {
                console.error("Error fetching customer:", customerError.message);
                notify("Error fetching customer data.", "error");
                return;
            }

            if (!customerData) {
                console.error("Customer not found in database");
                notify("Customer not found.", "error");
                return;
            }

            const { account_type, points, user_id, referral_code } = customerData;

            // Reverse the points from user account
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, points, referral_count, actions_completed')
                .eq('id', user_id)
                .single();

            if (userError || !userData) {
                console.error("Error fetching user:", userError ? userError.message : "User not found");
                notify("Error fetching user data.", "error");
                return;
            }

            const updatedPoints = userData.points - points;
            const updatedActions = Math.max(userData.actions_completed - 1, 0);

            // Update user points and actions
            const { error: updateUserError } = await supabase
                .from('users')
                .update({
                    points: updatedPoints,
                    actions_completed: updatedActions,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user_id);

            if (updateUserError) {
                console.error("Error updating user data:", updateUserError.message);
                notify("Error updating user data.", "error");
                return;
            }

            // If the customer has a referral code, reverse the referrer points and actions
            if (referral_code) {
                const { data: referrerData, error: referrerError } = await supabase
                    .from('users')
                    .select('id, points, referral_count, actions_completed')
                    .eq('referral_code', referral_code)
                    .single();

                if (referrerError || !referrerData) {
                    console.error("Error finding referrer:", referrerError ? referrerError.message : "No referrer found.");
                } else {
                    const updatedReferrerPoints = referrerData.points - 50;
                    const updatedReferralCount = Math.max(referrerData.referral_count - 1, 0);
                    const updatedReferrerActions = Math.max(referrerData.actions_completed - 1, 0);

                    // Update referrer points, referral_count, and actions
                    const { error: updateReferrerError } = await supabase
                        .from('users')
                        .update({
                            points: updatedReferrerPoints,
                            referral_count: updatedReferralCount,
                            actions_completed: updatedReferrerActions
                        })
                        .eq('id', referrerData.id);

                    if (updateReferrerError) {
                        console.error("Error updating referrer data:", updateReferrerError.message);
                    } else {
                        // Remove activity log for referrer (reverse the referral)
                        const { error: deleteActivityError } = await supabase
                            .from('user_activities')
                            .delete()
                            .match({
                                user_id: referrerData.id,
                                activity_type: `Referred ${customerData.name} to open a ${account_type} account`
                            });

                        if (deleteActivityError) {
                            console.error("Error removing referrer activity log:", deleteActivityError.message);
                        }
                    }
                }
            }

            // Remove activity log for customer
            const { error: deleteActivityError } = await supabase
                .from('user_activities')
                .delete()
                .match({
                    user_id: user_id,
                    activity_type: `Account opening: ${account_type}`
                });

            if (deleteActivityError) {
                console.error("Error removing customer activity log:", deleteActivityError.message);
            }

            // Delete customer record
            const { error: deleteCustomerError } = await supabase
                .from('account_opening')
                .delete()
                .eq('id', id);

            if (deleteCustomerError) {
                console.error("Error deleting customer:", deleteCustomerError.message);
                notify("Error deleting customer.", "error");
            } else {
                setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
                notify("Customer transaction details deleted successfully.", "success");
            }

        } catch (error) {
            console.error("Unexpected error occurred:", error);
            notify("An unexpected error occurred.", "error");
        } finally {
            setActionLoading(false);
        }
    }, [setCustomers, notify]);

    return { toggleStatus, handleDelete, actionLoading };
};

export default useCustomerActions;
