import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '/lib/supabase';
import { imagekit } from '../utils/imageKitService';

const useDeleteAccount = () => {
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async (session, router) => {
        setLoading(true);
        const toastId = toast.loading("Please wait...");

        if (!session) {
            toast.update(toastId, { render: "You must be logged in to delete your account.", type: "error", isLoading: false });
            setLoading(false);
            return;
        }

        try {
            const { user } = session;
            if (!user) {
                toast.update(toastId, { render: "No user data found. Please log in again.", type: "error", isLoading: false });
                setLoading(false);
                return;
            }

            // Fetch user profile data
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('profile_image_id, email, name')
                .eq('id', user.id)
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
                    // Log the error but continue with account deletion
                    console.warn(`⚠ Failed to delete profile image: ${imageDeleteError.message}`);
                    // Only show toast if it's not a 404 (image already deleted)
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
                // Continue with deletion even if email fails
            }

            // Delete user from database
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id);

            if (deleteError) {
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
                // Continue even if sign out has issues
            }

            toast.update(toastId, {
                render: "Your account has been deleted successfully.",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });

            // Short delay before redirect to ensure toast is seen
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
