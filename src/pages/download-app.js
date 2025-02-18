import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import Image from 'next/image';
import useUserData from '../hooks/useUserData';
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
    const { userId, userPoints } = userData || {};
    const { handleSignOut } = useSignOut();
    const [isLoading, setIsLoading] = useState(true);

    const [downloadStatus, setDownloadStatus] = useState({
        Android: false,
        Apple: false,
    });

    useEffect(() => {
        const checkUserDownloadStatus = async () => {
            if (!userData?.baseId) {
                return;
            }

            try {
                setIsLoading(true); // Set loading state
                const { data, error } = await supabase
                    .from('user_activities')
                    .select('activity_id, activity_type')
                    .eq('user_id', userData.baseId)
                    .or(`activity_type.ilike.%Android%,activity_type.ilike.%Apple%`);

                if (error) {
                    toast.error('Error fetching user download status');
                    return;
                }

                if (data && data.length > 0) {
                    const status = {
                        Android: data.some(item => item.activity_type.includes('Android')),
                        Apple: data.some(item => item.activity_type.includes('Apple'))
                    };
                    setDownloadStatus(status);
                }
            } catch (err) {
                toast.error('Failed to check download status.');
            } finally {
                setIsLoading(false); // Clear loading state
            }
        };

        checkUserDownloadStatus();
    }, [userData?.baseId]);

    const handleDownloadApp = async (platform, url) => {
        if (!userData?.baseId) {
            toast.error('User ID is not defined. Please log in again.');
            return;
        }

        const waitToastId = toast.loading('Please wait while we check your download status...');

        try {
            const { data, error } = await supabase
                .from('user_activities')
                .select('activity_id')
                .eq('user_id', userData.baseId)
                .ilike('activity_type', `Downloaded the Mobile App (${platform})`);

            toast.dismiss(waitToastId);

            if (data && data.length > 0) {
                toast.info(`You have already downloaded the ${platform} app.`);
                setDownloadStatus(prev => ({ ...prev, [platform]: true }));
                return;
            }

            const { data: user, error: getUserError } = await supabase
                .from('users')
                .select('points, actions_completed')  // Added actions_completed
                .eq('id', userData.baseId)
                .single();

            if (getUserError || !user) {
                toast.error('Failed to fetch user data. Please try again.');
                return;
            }

            const pointsToUpdate = user.points + 15;
            const actionsCompleted = (user.actions_completed || 0) + 1;  // Handle case where actions_completed might be null

            const { error: updateUserError } = await supabase
                .from('users')
                .update({
                    points: pointsToUpdate,
                    actions_completed: actionsCompleted  // Update actions_completed
                })
                .eq('id', userData.baseId);

            if (updateUserError) {
                toast.error('Failed to update user points. Please try again.');
                return;
            }

            const { error: logError } = await supabase
                .from('user_activities')
                .insert({
                    user_id: userData.baseId,
                    activity_type: `Downloaded the Mobile App (${platform})`,
                    points: 15,
                    platform_url: url  // Add the platform URL
                });

            if (logError) {
                toast.error('Failed to log activity. Please try again.');
                return;
            }

            setDownloadStatus(prev => ({ ...prev, [platform]: true }));
            toast.success(`${platform} App Downloaded. You have earned 15 points.`);
            window.location.href = url;

        } catch (error) {
            toast.dismiss(waitToastId);
            toast.error('An error occurred while processing your request.');
        }
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
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'}`}>
                    <div className="space-y-8 mb-8">
                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-4 md:px-8 hover:shadow-lg transition-all duration-300 ease-in-out`}>
                            {/* Header Section with improved layout */}
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className={`space-y-4 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <h2 className={`text-teal-500 text-lg sm:text-4xl md:text-3xl font-extrabold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                        Download the Credit Bank Mobile App
                                    </h2>
                                    <p className={`text-base ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Get instant access to your banking services and earn <span
                                        className="text-[#0CB4AB] font-bold">15 points</span> when you download our
                                        mobile app.
                                    </p>

                                    {/* Added Features Section */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        {[
                                            'Quick Balance Check',
                                            'Instant Transfers',
                                            'Bill Payments',
                                            'Mobile Banking'
                                        ].map((feature) => (
                                            <div key={feature} className="flex items-center space-x-2">
                                                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 13l4 4L19 7"/>
                                                </svg>
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Could add an app preview image here */}
                                <div className="hidden md:flex items-center justify-center">
                                    <Image
                                        src="/assets/images/challenge-img.png"
                                        alt="App Preview"
                                        width={300}
                                        height={600}
                                        className="rounded-lg shadow-lg"
                                    />
                                </div>
                            </div>

                            {/* Download Section with improved table */}
                            <div className="flex flex-col justify-center space-y-4">
                                <div
                                    className={`p-6 ${mode === 'dark' ? 'bg-[#0f1720]' : 'bg-gray-50'} rounded-xl shadow-sm`}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-500">Platform</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-500">Status</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-500">Reward
                                                Points
                                            </th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-500">Download</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {['Android', 'Apple'].map((platform) => (
                                            <tr
                                                key={platform}
                                                className={`hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                                            >

                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <Image
                                                                src={`/assets/images/${platform.toLowerCase()}.svg`}
                                                                alt={platform}
                                                                width={40}
                                                                height={40}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{platform} App</p>
                                                            <p className="text-sm text-gray-500">Version 2.0</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {isLoading ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div
                                                                className="animate-spin rounded-full h-4 w-4 border-2 border-teal-500 border-t-transparent"></div>
                                                            <span className="text-sm">Checking...</span>
                                                        </div>
                                                    ) : (
                                                        <span
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                downloadStatus[platform]
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                {downloadStatus[platform] ? 'Downloaded' : 'Not Yet'}
                                            </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-1">
                                                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor"
                                                             viewBox="0 0 20 20">
                                                            <path
                                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                                        </svg>
                                                        <span
                                                            className="font-medium">{downloadStatus[platform] ? '15' : '0'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${isLoading || downloadStatus[platform]
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                                                        }`}
                                                        onClick={() => handleDownloadApp(platform, platform === 'Android'
                                                            ? 'https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank'
                                                            : 'https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952')}
                                                        disabled={isLoading || downloadStatus[platform]}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <svg
                                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
                                                                    fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12"
                                                                            r="10" stroke="currentColor"
                                                                            strokeWidth="4"/>
                                                                    <path className="opacity-75" fill="currentColor"
                                                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                                </svg>
                                                                Please wait...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {downloadStatus[platform] ? (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-2"
                                                                             fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd"
                                                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                  clipRule="evenodd"/>
                                                                        </svg>
                                                                        Downloaded
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-2" fill="none"
                                                                             stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round"
                                                                                  strokeLinejoin="round" strokeWidth="2"
                                                                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                                                        </svg>
                                                                        Download
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
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
