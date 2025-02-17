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

            // Delete image from ImageKit
            const { profile_image_id: imageId } = userData;
            if (imageId) {
                try {
                    await imagekit.deleteFile(imageId);
                    console.log(`Image with ID ${imageId} deleted successfully.`);
                } catch (imageDeleteError) {
                    toast.update(toastId, { render: `Error deleting image: ${imageDeleteError.message}`, type: "error", isLoading: false });
                    setLoading(false);
                    return;
                }
            }

            // Send email about account deletion
            await fetch('/api/sendDeleteAccountEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email, name: userData.name }),
            });

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

            // Sign out user
            await supabase.auth.signOut();
            localStorage.removeItem('supabase_session');
            localStorage.removeItem('token');

            toast.update(toastId, { render: "Your account has been deleted successfully.", type: "success", isLoading: false });
            router.push('/'); // Redirect to login page
        } catch (error) {
            console.error("Account deletion error:", error);
            toast.update(toastId, { render: "There was an issue deleting your account. Please try again.", type: "error", isLoading: false });
            setLoading(false);
        }
    };

    return {
        loading,
        handleDeleteAccount,
    };
};

export default useDeleteAccount;
