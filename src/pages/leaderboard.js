import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import useUserData from '../hooks/useUserData';
import useUserActivities from '../hooks/useUserActivities';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import LeaderboardTable from "@/components/leaderboardTable";

import { imagekit } from '../utils/imageKitService';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';

const Leaderboard = () => {
    const router = useRouter();
    const { token, setToken } = useUser();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const notify = (message) => toast(message);
    const userData = useUserData(token);
    const activities = useUserActivities(token);
    const { userName, userEmail, imageUrl: profileImage, userPoints } = userData || {};
    const { handleSignOut } = useSignOut();

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

                <main
                    className={`flex-1 p-2 md:p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >

                    <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center ">Leaderboard</h2>
                    <h3 className="text-2xl font-bold text-[#ff9409] mb-4 text-center ">See Who's Leading the
                        Pack!</h3>

                    <p className="mb-4 text-center ">Stay competitive! Check the live leaderboard to see who's
                        winning.</p>

                    <div className="space-y-8">
                        <LeaderboardTable
                            token={token}
                            userData={userData}
                            notify={notify}
                            mode={mode}
                        />

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Leaderboard;
