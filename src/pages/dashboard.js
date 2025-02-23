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
import VerificationModal from "@/components/VerificationModal";
import { imagekit } from '../utils/imageKitService';
import { useUser } from '@/context/UserContext';  // Import the context
import useSignOut from '@/hooks/useSignOut';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useModal from '@/hooks/useModal';
import useDeleteAccount from "@/hooks/useDeleteAccount";

const Dashboard = () => {
    const router = useRouter();
    const { token, setToken } = useUser();  // Use the context to get token and setToken
    const { mode, toggleMode } = useTheme(); // Use the hook
    const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the hook
    const { isOpen: isVerificationModalOpen, openModal: openVerificationModal, closeModal: closeVerificationModal } = useModal();

    const [showDeleteModal, setShowDeleteModal] = useState(false); // Manage modal visibility

    const notify = (message) => toast(message);
    const userData = useUserData(token);  // Get user data based on token
    const activities = useUserActivities(token);  // Get user activities based on token
    const { userName, userEmail, imageUrl: profileImage, userPoints } = userData || {};  // Destructure the user data
    const { handleSignOut } = useSignOut(); // Use the hook
    const { handleDeleteAccount } = useDeleteAccount();

    // Ensure userData is properly loaded and update as needed
    useEffect(() => {
        console.log("User Data in Dashboard:", userData); // Log to track updates
    }, [userData]);

    const handleDownloadApp = (message) => notify(message, 'success');

    const openModal = () => {
    };

    const closeModal = () => {
    };


    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f1eb]'}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                onLogout={handleSignOut}
                userData={userData}
            />


            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    token={token}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={handleSignOut}
                    openModal={openModal}
                    openVerificationModal={openVerificationModal}
                    toggleMode={toggleMode}
                    userData={userData}

                />

                <main
                    className={`flex-1 p-4 md:p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >
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
                                        userData={userData}
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


                        {/*            <div className="flex justify-center gap-x-4 pt-4">*/}
                        {/*                <button*/}
                        {/*                    onClick={handleSignOut} // Attach sign out handler*/}
                        {/*                    className={`flex items-center px-4 py-4 rounded-lg transition-all duration-300 ease-in-out */}
                        {/*${mode === 'dark'*/}
                        {/*                        ? 'bg-[#2a3a48] text-[#0eb4ab] hover:bg-[#3e4b5d]'*/}
                        {/*                        : 'bg-white text-[#0eb4ab] hover:bg-gray-200'}`*/}
                        {/*                    }>*/}
                        {/*                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-[#ff9409]"/>*/}
                        {/*                    Sign out*/}
                        {/*                </button>*/}
                        {/*                <button*/}
                        {/*                    onClick={() => setShowDeleteModal(true)} // Trigger modal*/}
                        {/*                    className={`flex items-center px-4 py-4 rounded-lg transition-all duration-300 ease-in-out */}
                        {/*${mode === 'dark'*/}
                        {/*                        ? 'bg-[#ef4547] text-white hover:bg-[#c0392b]'*/}
                        {/*                        : 'bg-[#ef4547] text-white hover:bg-red-600'}`*/}
                        {/*                    }>*/}
                        {/*                    <TrashIcon className="h-5 w-5 mr-2 text-white"/>*/}
                        {/*                    Delete Account*/}
                        {/*                </button>*/}
                        {/*            </div>*/}


                        {/* Use DeleteAccountModal */}
                        <DeleteAccountModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)} // Close modal
                            handleDeleteAccount={handleDeleteAccount}
                            toggleMode={toggleMode}
                            mode={mode}
                        />
                    </div>


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
