import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import useUserData from '../hooks/useUserData';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';
import Referral from "@/components/referFriend";

const Referrals = () => {
    const router = useRouter();
    const { token, setToken } = useUser();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const notify = (message) => toast(message);
    const userData = useUserData(token);
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
                    className={`flex-1 p-4 md:p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >

                    <div className="space-y-8 mb-8">

                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-4 md:px-8 hover:shadow-md transition-all duration-300 ease-in-out`}
                        >
                            <div
                                className={`px-4 space-y-4 mb-8 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <h2 className={`text-teal-500 text-lg sm:text-4xl md:text-3xl font-extrabold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                    Referrals
                                </h2>

                                <p className={`text-base  ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Sharing is caring! Don’t keep the good news about Credit Bank’s wealth management
                                    solutions to yourself. Earn points for referring your loved ones.
                                </p>

                                <Referral
                                    token={token}
                                    userData={userData}
                                    notify={notify}
                                    mode={mode}
                                />
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Referrals;
