import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
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

const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Manage modal visibility

    const notify = (message) => toast(message);

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

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
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

            // Fetch user profile data
            const { data: userData, error: profileError } = await supabase
                .from('users')
                .select('email, name')
                .eq('id', user.id)
                .single();

            if (profileError) {
                return toast.update(toastId, { render: `Error fetching user profile: ${profileError.message}`, type: "error", isLoading: false });
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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={handleSignOut}
                    openModal={openModal}

                />

                <main className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}>
                    <div className="space-y-6">
                        <UserInfo
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                        />

                        <DashboardOverview
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                        />

                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg hover:shadow-md transition-all duration-300 ease-in-out`}>
                                    <MyActivity
                                        mode={mode}
                                        toggleMode={toggleMode}
                                        token={token}
                                        notify={notify}
                                    />
                                </div>
                                <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#0CB4AB] text-black'} rounded-lg hover:shadow-md transition-all duration-300 ease-in-out`}>
                                    <Referral
                                        mode={mode}
                                        toggleMode={toggleMode}
                                        token={token}
                                        notify={notify}
                                    />
                                </div>
                            </div>
                        </div>

                        <LeaderboardTable
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            toggleSidebar={toggleSidebar}
                            isSidebarOpen={isSidebarOpen}
                        />

                        <div className="flex justify-center gap-x-4 pt-4">
                            <button
                                onClick={handleSignOut} // Attach sign out handler
                                className="bg-white text-[#0eb4ab] flex items-center px-4 py-4 rounded-lg hover:bg-gray-200 transition-all duration-300 ease-in-out">
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-[#ff9409]" />
                                Sign out
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)} // Trigger modal
                                className="bg-[#ef4547] text-white flex items-center px-4 py-4 rounded-lg hover:bg-red-600 transition-all duration-300 ease-in-out">
                                <TrashIcon className="h-5 w-5 mr-2 text-white" />
                                Delete Account
                            </button>
                        </div>

                        {/* Use DeleteAccountModal */}
                        <DeleteAccountModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)} // Close modal
                            handleDeleteAccount={handleDeleteAccount}                        />
                    </div>
                    <AppDownloadModal isOpen={isModalOpen} onClose={closeModal} />

                </main>
            </div>
        </div>
    );
};

export default Dashboard;
