import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import useUserData from '../hooks/useUserData';
import useUserActivities from '../hooks/useUserActivities';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import Image from 'next/image';
import UserInfo from "@/components/userInfo";
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';

const DownloadApp = () => {
    const router = useRouter();
    const { token, setToken } = useUser();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const notify = (message) => toast(message);
    const userData = useUserData(token);
    const activities = useUserActivities(token);
    const { userName, userEmail, imageUrl: profileImage, userPoints } = userData || {};
    const { handleSignOut } = useSignOut();


    const [userId, setUserId] = useState(null);
    const [downloadStatus, setDownloadStatus] = useState({
        Android: false,
        Apple: false,
    });

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setUserId(session.user?.id);
            console.log("Logged in User ID:", session.user?.id); // Log the user ID
        }
    }, []);

    useEffect(() => {
        const checkUserDownloadStatus = async () => {
            if (!userId) return;

            const { data, error } = await supabase
                .from('user_activities')
                .select('*')
                .eq('user_id', userId)
                .ilike('activity_type', 'Downloaded the Mobile App%');

            if (data && data.length > 0) {
                const status = {
                    Android: data.some(item => item.activity_type.includes('Android')),
                    Apple: data.some(item => item.activity_type.includes('Apple'))
                };
                setDownloadStatus(status);
            }
        };

        checkUserDownloadStatus();
    }, [userId]);

    const handleDownloadApp = async (platform, url) => {
        if (!userId) {
            toast.error('User ID is not defined. Please log in again.');
            return;
        }

        const waitToastId = toast.loading('Please wait while we check your download status...');
        const { data, error } = await supabase
            .from('user_activities')
            .select('activity_id')
            .eq('user_id', userId)
            .ilike('activity_type', `Downloaded the Mobile App (${platform})`);

        toast.dismiss(waitToastId);

        if (data && data.length > 0) {
            toast.info(`You have already downloaded the ${platform} app.`);
            setDownloadStatus(prev => ({ ...prev, [platform]: true }));
            return;
        }

        const { data: user, error: getUserError } = await supabase
            .from('users')
            .select('points')
            .eq('id', userId)
            .single();

        const pointsToUpdate = user.points + 15;

        const { error: updateUserError } = await supabase
            .from('users')
            .update({ points: pointsToUpdate })
            .eq('id', userId);

        if (updateUserError) {
            toast.error('Failed to update user. Please try again.');
            return;
        }

        const { error: logError } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                activity_type: `Downloaded the Mobile App (${platform})`,
                points: 15,
            });

        if (logError) {
            toast.error('Failed to log activity. Please try again.');
            return;
        }

        setDownloadStatus(prev => ({ ...prev, [platform]: true }));

        toast.success(`${platform} App Downloaded. You have earned 15 points.`);
        window.location.href = url;
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
                    toggleMode={toggleMode}
                    userData={userData}
                />

                <main
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}
                >
                    <div className="space-y-8 mb-8">
                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-4 md:px-8 hover:shadow-md transition-all duration-300 ease-in-out`}
                        >
                            <div className={`px-4 space-y-4 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <h2 className={`text-teal-500 text-lg sm:text-4xl md:text-3xl font-extrabold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                    Download the Credit Bank Mobile App
                                </h2>
                                <p className={`text-base pb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Download the Credit Bank mobile app to earn <span className="text-[#0CB4AB] font-bold">15 points.</span>
                                </p>
                            </div>

                            <div className="flex flex-col justify-center px-4 space-y-4">
                                <div
                                    className={`p-6 ${mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'} p-4 rounded-md`}>

                                    <table
                                        className="min-w-full table-auto shadow-md rounded-lg overflow-hidden hover:shadow-lg">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left">Platform</th>
                                            <th className="p-3 text-left">Download Status</th>
                                            <th className="p-3 text-left">Points</th>
                                            <th className="p-3 text-left">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {['Android', 'Apple'].map((platform) => (
                                            <tr
                                                key={platform}
                                                className={`hover:bg-gray-200 ${mode === 'dark' ? 'text-white' : 'text-black'}`}
                                            >
                                                <td className="p-3 flex items-center">
                                                    <Image
                                                        src={`/assets/images/${platform.toLowerCase()}.svg`}
                                                        alt={platform}
                                                        width={30}
                                                        height={30}
                                                    />
                                                    <span className="ml-2">{platform} App</span>
                                                </td>
                                                <td className="p-3">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        downloadStatus[platform]
                                            ? 'bg-green-200 text-green-800'
                                            : 'bg-yellow-200 text-yellow-800'
                                    }`}
                                >
                                    {downloadStatus[platform] ? 'Downloaded' : 'Not Yet'}
                                </span>
                                                </td>
                                                <td className="p-3">{downloadStatus[platform] ? '15' : '0'}</td>
                                                <td className="p-3">
                                                    <button
                                                        className={`bg-teal-500 text-white py-2 px-4 rounded ${downloadStatus[platform] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleDownloadApp(platform, platform === 'Android' ? 'https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank' : 'https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952')}
                                                        disabled={downloadStatus[platform]}
                                                    >
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DownloadApp;
