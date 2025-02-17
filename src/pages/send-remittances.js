import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import useUserData from '../hooks/useUserData';
import useUserActivities from '../hooks/useUserActivities';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import UserInfo from "@/components/userInfo";
import DashboardOverview from "@/components/dashboardOverview";
import { imagekit } from '../utils/imageKitService';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';

const SendRemittances = () => {
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
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}
                >
                    <div className="space-y-8 mb-8">
                        {/*<UserInfo*/}
                        {/*    mode={mode}*/}
                        {/*    toggleMode={toggleMode}*/}
                        {/*    token={token}*/}
                        {/*    notify={notify}*/}
                        {/*    userData={userData}*/}
                        {/*/>*/}

                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-4 md:px-8 hover:shadow-md transition-all duration-300 ease-in-out`}
                        >
                            <div
                                className={`px-4 space-y-4 mb-8 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <h2 className={`text-teal-500 text-lg sm:text-4xl md:text-3xl font-extrabold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                    Send Remittances
                                </h2>

                                <p className={`text-base  ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    The RIA remittance service at Credit Bank empowers diaspora customers to send funds directly and instantaneously to their loved ones.
                                </p>

                                <p className={`text-base pb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Send a remittance to a Credit Bank account and enter the recipient's name and transaction details below to redeem your points.
                                </p>
                                <span>
                            </span>
                            </div>


                            <div className="flex flex-col justify-center px-4 space-y-4">
                                {/* Form with 3/4 width */}
                                <form className="space-y-6 w-full mx-auto">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block font-bold text-lg">
                                            Name (as it appears on your ID)
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Enter your full name"
                                            className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                        />
                                    </div>

                                    {/* Referral Code */}
                                    <div>
                                        <label htmlFor="referrer" className="block font-bold text-lg">
                                            Transaction Code/Pin
                                        </label>
                                        <input
                                            type="text"
                                            id="referrer"
                                            name="transactioncode"
                                            placeholder="Enter transaction code"
                                            className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex pt-4 gap-6 w-full justify-between items-center">
                                        <span className="flex-grow w-3/4">
                                            Your points will be updated after our 24-hour verification process.
                                        </span>
                                        <button
                                            type="submit"
                                            className={`w-1/2 py-4 px-4 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${mode === 'dark' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                                        >
                                            Redeem Points
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SendRemittances;
