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
import { Apple } from "@/components/icons/Apple";
import { Android } from "@/components/icons/Android";
import { CheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

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
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >
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
                                                <CheckIcon className="w-5 h-5 text-teal-500"/>
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
                                        className="rounded-lg shadow-lg transform transition-transform duration-500 ease-out hover:translate-y-[-10px]"
                                    />
                                </div>

                            </div>

                            {/* Download Section with improved table */}
                            <div className="flex flex-col justify-center space-y-4">
                                <div
                                    className={`p-0 md:p-6 ${mode === 'dark' ? 'bg-[#0f1720]' : 'bg-gray-50'} rounded-xl shadow-sm`}>

                                    {/* Responsive Table Container */}
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                                            <thead>
                                            <tr>
                                                <th
                                                    className={`p-4 text-left text-sm font-semibold ${
                                                        mode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                                                    }`}
                                                >
                                                    Platform
                                                </th>
                                                <th
                                                    className={`p-4 text-left text-sm font-semibold ${
                                                        mode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                                                    }`}
                                                >
                                                    Status
                                                </th>
                                                <th
                                                    className={`p-4 text-left text-sm font-semibold ${
                                                        mode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                                                    }`}
                                                >
                                                    Reward Points
                                                </th>
                                                <th
                                                    className={`p-4 text-left text-sm font-semibold ${
                                                        mode === 'dark' ? 'text-gray-300' : 'text-gray-500'
                                                    }`}
                                                >
                                                    Download
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                            {['Android', 'Apple'].map((platform) => (
                                                <tr
                                                    key={platform}
                                                    className={`transition-colors ${
                                                        mode === 'dark'
                                                            ? 'hover:bg-[#2d2d2d]' // Dark mode hover background color
                                                            : 'hover:bg-[#f1f5f9]' // Light mode hover background color
                                                    }`}
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0">
                                                                {/* For the Apple icon, we set fill to white in dark mode */}
                                                                {platform === 'Apple' ? (
                                                                    <Apple
                                                                        className={`w-8 h-8 ${mode === 'dark' ? 'fill-white' : ''}`}/>
                                                                ) : (
                                                                    <Image
                                                                        src={`/assets/images/${platform.toLowerCase()}.svg`}
                                                                        alt={platform}
                                                                        width={40}
                                                                        height={40}
                                                                        className="rounded-lg"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{platform} App</p>
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
                                                                    downloadStatus[platform] ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                            >
            {downloadStatus[platform] ? 'Downloaded' : 'Not Yet'}
          </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-1">
                                                            <StarIcon className="w-5 h-5 text-yellow-400"/>
                                                            <span
                                                                className="font-medium">{downloadStatus[platform] ? '15' : '0'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <button
                                                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                                isLoading || downloadStatus[platform]
                                                                    ? mode === 'dark'
                                                                        ? 'bg-gray-700 text-gray-100 cursor-not-allowed'
                                                                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                                                    : mode === 'dark'
                                                                        ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                                                                        : 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                                                            }`}
                                                            onClick={() =>
                                                                handleDownloadApp(
                                                                    platform,
                                                                    platform === 'Android'
                                                                        ? 'https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank'
                                                                        : 'https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952'
                                                                )
                                                            }
                                                            disabled={isLoading || downloadStatus[platform]}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <CheckIcon
                                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"/>
                                                                    Please wait...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {downloadStatus[platform] ? (
                                                                        <>
                                                                            <CheckIcon className="w-4 h-4 mr-2"/>
                                                                            Downloaded
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ArrowDownTrayIcon
                                                                                className="w-4 h-4 mr-2"/>
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

                                        {/* Mobile view as a stack */}
                                        <div className="block sm:hidden">
                                            {['Android', 'Apple'].map((platform) => (
                                                <div
                                                    key={platform}
                                                    className={`border-b ${mode === 'dark' ? 'border-gray-700' : 'border-gray-300'} p-4`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            {platform === 'Apple' ? (
                                                                <Apple
                                                                    className={`w-8 h-8 ${mode === 'dark' ? 'fill-white' : ''}`}/>
                                                            ) : (
                                                                <Image
                                                                    src={`/assets/images/${platform.toLowerCase()}.svg`}
                                                                    alt={platform}
                                                                    width={40}
                                                                    height={40}
                                                                    className="rounded-lg"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{platform} App</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
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
                                                                }`}
                                                            >
              {downloadStatus[platform] ? 'Downloaded' : 'Not Yet'}
            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 flex items-center space-x-1">
                                                        <StarIcon className="w-5 h-5 text-yellow-400"/>
                                                        <span
                                                            className="font-medium">{downloadStatus[platform] ? '15' : '0'}</span>
                                                    </div>
                                                    <button
                                                        className={`mt-3 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            isLoading || downloadStatus[platform]
                                                                ? mode === 'dark'
                                                                    ? 'bg-gray-700 text-gray-100 cursor-not-allowed'
                                                                    : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                                                                : mode === 'dark'
                                                                    ? 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                                                                    : 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                                                        }`}
                                                        onClick={() =>
                                                            handleDownloadApp(
                                                                platform,
                                                                platform === 'Android'
                                                                    ? 'https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank'
                                                                    : 'https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952'
                                                            )
                                                        }
                                                        disabled={isLoading || downloadStatus[platform]}
                                                    >
                                                        {isLoading ? (
                                                            <>
                                                                <CheckIcon
                                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"/>
                                                                Please wait...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {downloadStatus[platform] ? (
                                                                    <>
                                                                        <CheckIcon className="w-4 h-4 mr-2"/>
                                                                        Downloaded
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ArrowDownTrayIcon className="w-4 h-4 mr-2"/>
                                                                        Download
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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
