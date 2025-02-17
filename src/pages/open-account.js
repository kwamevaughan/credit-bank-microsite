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
import { imagekit } from '../utils/imageKitService';
import { useUser } from '@/context/UserContext';  // Import the context
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';

const OpenAccount = () => {
    const router = useRouter();
    const { token, setToken } = useUser();  // Use the context to get token and setToken
    const { isSidebarOpen, toggleSidebar } = useSidebar(); // Use the hook
    const { mode, toggleMode } = useTheme(); // Use the hook
    const notify = (message) => toast(message);
    const userData = useUserData(token);  // Get user data based on token
    const activities = useUserActivities(token);  // Get user activities based on token
    const { userName, userEmail, imageUrl: profileImage, userPoints } = userData || {};  // Destructure the user data
    const { handleSignOut } = useSignOut(); // Use the hook


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
                    toggleMode={toggleMode}
                    userData={userData}

                />

                <main className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}>
                    <div className="space-y-6">
                        <UserInfo
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            userData={userData}
                        />


                        <div>

                        </div>


                    </div>

                </main>
            </div>
        </div>
    );
};

export default OpenAccount;
