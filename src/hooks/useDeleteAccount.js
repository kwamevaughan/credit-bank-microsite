import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '/lib/supabase';
import { imagekit } from '../utils/imageKitService';
import { useUser } from '@/context/UserContext';

const useDeleteAccount = () => {
    const [loading, setLoading] = useState(false);
    const { user: contextUser, token } = useUser();

    const handleDeleteAccount = async (router) => {
        setLoading(true);
        const toastId = toast.loading("Please wait...");

        if (!contextUser) {
            toast.update(toastId, { render: "You must be logged in to delete your account.", type: "error", isLoading: false });
            setLoading(false);
            return;
        }

        try {
            // First, delete related records in account_opening table
            const { error: accountOpeningError } = await supabase
                .from('account_opening')
                .delete()
                .eq('user_id', contextUser.id);

            if (accountOpeningError) {
                console.error('Error deleting account opening records:', accountOpeningError);
                toast.update(toastId, {
                    render: `Error deleting account data: ${accountOpeningError.message}`,
                    type: "error",
                    isLoading: false
                });
                setLoading(false);
                return;
            }

            // Second, delete related records in user_activities table
            const { error: userActivitiesError } = await supabase
                .from('user_activities')
                .delete()
                .eq('user_id', contextUser.id);

            if (userActivitiesError) {
                console.error('Error deleting user activities:', userActivitiesError);
                toast.update(toastId, {
                    render: `Error deleting user activities: ${userActivitiesError.message}`,
                    type: "error",
                    isLoading: false
                });
                setLoading(false);
                return;
            }

            // Third, delete related records in user_quiz_progress table
            const { error: quizProgressError } = await supabase
                .from('user_quiz_progress')
                .delete()
                .eq('user_id', contextUser.id);

            if (quizProgressError) {
                console.error('Error deleting quiz progress records:', quizProgressError);
                toast.update(toastId, {
                    render: `Error deleting quiz progress data: ${quizProgressError.message}`,
                    type: "error",
                    isLoading: false
                });
                setLoading(false);
                return;
            }

            // Get user data for image and email
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('profile_image_id, email, name')
                .eq('id', contextUser.id)
                .single();

            if (profileError) {
                toast.update(toastId, { render: `Error fetching user profile: ${profileError.message}`, type: "error", isLoading: false });
                setLoading(false);
                return;
            }

            // Delete image from ImageKit if it exists
            if (userData.profile_image_id) {
                try {
                    console.log(`Attempting to delete image with ID: ${userData.profile_image_id}`);
                    await imagekit.deleteFile(userData.profile_image_id);
                    console.log('✓ Successfully deleted user profile image');
                } catch (imageDeleteError) {
                    console.warn(`⚠ Failed to delete profile image: ${imageDeleteError.message}`);
                    if (!imageDeleteError.message?.includes('does not exist')) {
                        toast.warn(`Note: Could not delete profile image, but proceeding with account deletion.`);
                    }
                }
            }

            // Send email about account deletion
            try {
                await fetch('/api/sendDeleteAccountEmail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userData.email, name: userData.name }),
                });
                console.log('✓ Account deletion email sent successfully');
            } catch (emailError) {
                console.warn('⚠ Failed to send deletion email:', emailError);
            }

            // Now delete the user
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', contextUser.id);

            if (deleteError) {
                console.error('Error deleting user:', deleteError);
                toast.update(toastId, { render: `Error deleting user data: ${deleteError.message}`, type: "error", isLoading: false });
                setLoading(false);
                return;
            }

            console.log('✓ User data deleted from database');

            // Sign out user and clear local storage
            try {
                await supabase.auth.signOut();
                localStorage.removeItem('supabase_session');
                localStorage.removeItem('token');
                console.log('✓ User signed out and local storage cleared');
            } catch (signOutError) {
                console.warn('⚠ Error during sign out:', signOutError);
            }

            toast.update(toastId, {
                render: "Your account has been deleted successfully.",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            setTimeout(() => {
                router.push('/');
            }, 1000);

        } catch (error) {
            console.error("Account deletion error:", error);
            toast.update(toastId, {
                render: "There was an issue deleting your account. Please try again.",
                type: "error",
                isLoading: false
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        handleDeleteAccount,
    };
};

export default useDeleteAccount;
