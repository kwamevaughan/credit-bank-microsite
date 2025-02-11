import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import useUserData from '../hooks/useUserData'; // Correctly imported as default
import useUserActivities from '../hooks/useUserActivities'; // Correctly imported as default
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import UserInfo from "@/components/userInfo";
import DashboardOverview from "@/components/dashboardOverview";
import LeaderboardTable from "@/components/leaderboardTable";
import MyActivity from "@/components/myActivity";
import Referral from "@/components/referFriend";
import { ArrowRightOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import DeleteAccountModal from "@/components/DeleteAccountModal"; // Import your DeleteAccountModal
import AppDownloadModal from "@/components/AppDownloadModal";
import VerificationModal from "@/components/VerificationModal";
import { imagekit } from '../utils/imageKitService';


const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false); // Manage modal visibility

    const notify = (message) => toast(message);
    const userData = useUserData(token);
    const activities = useUserActivities(token);

    // Check if user is logged in (update for v2.x)
    useEffect(() => {
        const fetchSession = () => {
            const session = JSON.parse(localStorage.getItem('supabase_session'));
            if (session) {
                setToken(session.access_token);
            } else {
                router.push('/');
            }
        };

        fetchSession();

        // You may want to add an event listener here if tokens are updated:
        window.addEventListener('storage', fetchSession);

        return () => {
            window.removeEventListener('storage', fetchSession);
        };
    }, [router]);

    // Ensure userData is properly loaded and update as needed
    useEffect(() => {
        console.log("User Data in Dashboard:", userData); // Log to track updates
    }, [userData]);

    const handleDownloadApp = (message) => notify(message, 'success');

    // Check if user is logged in (update for v2.x)
    useEffect(() => {
        try {
            const session = JSON.parse(localStorage.getItem('supabase_session'));
            if (session) {
                setToken(session.access_token);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Error parsing session', error);
            router.push('/');
        }
    }, [router]);



    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);

    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('supabase_session');  // Remove session now
        localStorage.removeItem('loginEmail');        // Clear email
        localStorage.removeItem('loginReferralCode'); // Clear referral code
        notify("You have been signed out successfully.");
        router.push('/'); // Redirect to login page
    };

    const handleDeleteAccount = async () => {
        // Start a loading toast
        const toastId = toast.loading("Please wait...");

        const session = JSON.parse(localStorage.getItem('supabase_session'));
        if (!session) {
            return toast.update(toastId, { render: "You must be logged in to delete your account.", type: "error", isLoading: false });
        }

        try {
            const { user } = session;
            if (!user) {
                return toast.update(toastId, { render: "No user data found. Please log in again.", type: "error", isLoading: false });
            }

            // Fetch user profile data including image ID
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('profile_image_id, email, name')
                .eq('id', user.id)
                .single();

            if (profileError) {
                return toast.update(toastId, { render: `Error fetching user profile: ${profileError.message}`, type: "error", isLoading: false });
            }

            // Check if an image exists and delete it
            const { profile_image_id: imageId } = userData;
            if (imageId) {
                try {
                    await imagekit.deleteFile(imageId);
                    console.log(`Image with ID ${imageId} deleted successfully.`);
                } catch (imageDeleteError) {
                    return toast.update(toastId, { render: `Error deleting image: ${imageDeleteError.message}`, type: "error", isLoading: false });
                }
            }

            // Send email about account deletion
            await fetch('/api/sendDeleteAccountEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email, name: userData.name }),
            });

            // Delete user from the database
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', user.id);

            if (deleteError) {
                return toast.update(toastId, { render: `Error deleting user data: ${deleteError.message}`, type: "error", isLoading: false });
            }

            // Sign out and clear session
            await supabase.auth.signOut();
            localStorage.removeItem('supabase_session');
            localStorage.removeItem('token');

            // Successfully deleted the account
            toast.update(toastId, { render: "Your account has been deleted successfully.", type: "success", isLoading: false });
            router.push('/'); // Redirect to login page
        } catch (error) {
            console.error("Account deletion error:", error);
            toast.update(toastId, { render: "There was an issue deleting your account. Please try again.", type: "error", isLoading: false });
        }
    };

    const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

    const openModal = () => {
        setIsAppDownloadModalOpen(true);
    };

    const closeModal = () => {
        setIsAppDownloadModalOpen(false);
    };

    const openVerificationModal = () => {
        setIsVerificationModalOpen(true);
    };

    const closeVerificationModal = () => {
        setIsVerificationModalOpen(false);
    };


    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                onLogout={handleSignOut}
                toggleMode={toggleMode}
                toggleFullScreen={toggleFullScreen}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={handleSignOut}
                    openModal={openModal}
                    openVerificationModal={openVerificationModal}
                    toggleMode={toggleMode}
                    toggleFullScreen={toggleFullScreen}

                />

                <main className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}>
                    <div className="space-y-6">
                        <UserInfo
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            userData={userData}
                        />

                        <DashboardOverview
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            userData={userData}
                        />

                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg hover:shadow-md transition-all duration-300 ease-in-out`}>
                                    <MyActivity
                                        mode={mode}
                                        toggleMode={toggleMode}
                                        token={token}
                                        notify={notify}
                                    />
                                </div>
                                <div
                                    className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#0CB4AB] text-black'} rounded-lg hover:shadow-md transition-all duration-300 ease-in-out`}>
                                    <Referral
                                        mode={mode}
                                        toggleMode={toggleMode}
                                        token={token}
                                        notify={notify}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-12">
                            <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center ">Leaderboard</h2>
                            <h3 className="text-2xl font-bold text-[#ff9409] mb-4 text-center ">See Who's Leading the
                                Pack!</h3>
                            <p className="mb-4 text-center ">Stay competitive! Check the live leaderboard to see who's
                                winning.</p>
                        <LeaderboardTable
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            toggleSidebar={toggleSidebar}
                            isSidebarOpen={isSidebarOpen}
                        />
                        </div>


                        <div className="flex justify-center gap-x-4 pt-4">
                            <button
                                onClick={handleSignOut} // Attach sign out handler
                                className={`flex items-center px-4 py-4 rounded-lg transition-all duration-300 ease-in-out 
            ${mode === 'dark'
                                    ? 'bg-[#2a3a48] text-[#0eb4ab] hover:bg-[#3e4b5d]'
                                    : 'bg-white text-[#0eb4ab] hover:bg-gray-200'}`
                                }>
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-[#ff9409]"/>
                                Sign out
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)} // Trigger modal
                                className={`flex items-center px-4 py-4 rounded-lg transition-all duration-300 ease-in-out 
            ${mode === 'dark'
                                    ? 'bg-[#ef4547] text-white hover:bg-[#c0392b]'
                                    : 'bg-[#ef4547] text-white hover:bg-red-600'}`
                                }>
                                <TrashIcon className="h-5 w-5 mr-2 text-white"/>
                                Delete Account
                            </button>
                        </div>


                        {/* Use DeleteAccountModal */}
                        <DeleteAccountModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)} // Close modal
                            handleDeleteAccount={handleDeleteAccount}
                            toggleMode={toggleMode}
                            mode={mode}
                        />
                    </div>
                    <AppDownloadModal
                        isOpen={isAppDownloadModalOpen}
                        onClose={closeModal}
                        token={token}
                        toggleMode={toggleMode}
                        mode={mode}
                        notify={notify}
                    />

                    <VerificationModal
                        isOpen={isVerificationModalOpen}
                        onClose={closeVerificationModal}
                        token={token}
                        toggleMode={toggleMode}
                        mode={mode}
                        notify={notify}
                    />

                </main>
            </div>
        </div>
    );
};

export default Dashboard;
