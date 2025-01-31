import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, ClipboardDocumentIcon, ArrowTrendingUpIcon, MoonIcon, BellIcon, UserCircleIcon, SunIcon, ArrowsPointingInIcon as FullScreenIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from "react-toastify";
import { supabase } from '/lib/supabase';

const Header = ({ token, toggleSidebar, isSidebarOpen, mode, toggleMode, userName }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const dropdownRef = useRef(null);


    // Fetch user data from Supabase
    const fetchUserData = async () => {
        if (!token) {
            console.error('Token is missing');
            return; // Don't proceed if token is not available
        }

        const { data, error } = await supabase
            .from('users')
            .select('points, referral_code')
            .eq('id', token)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
        return; // Don't proceed if there's an error
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserData(); // Only fetch if token is available
        }
    }, [token]);



    // Show toast notification
    const notify = (message) => toast(message);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        router.push('/'); // Redirect to login on logout
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

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setTooltipVisible(true);
            setTimeout(() => setTooltipVisible(false), 2000); // Hide tooltip after 2 seconds
            notify("Referral code copied!"); // Show toast notification
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    useEffect(() => {
        fetchUserData(); // Fetch user data on component mount
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header
            className={`p-4 transition-all duration-300 shadow-sm border-b border-gray-100 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white shadow-lg' : 'bg-white text-black'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between">
                {/* Logo for mobile, hidden when sidebar is open */}
                {!isSidebarOpen && (
                    <div className="md:hidden mb-2">
                        <Image
                            src="/assets/images/logo.svg"
                            alt="Logo"
                            width={150}
                            height={75}
                        />
                    </div>
                )}

                <div className="flex items-center space-x-4">
                    {!isSidebarOpen && (
                        <>
                            <button onClick={toggleSidebar} className="text-black focus:outline-none">
                                {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                            </button>
                            {/* Logo for desktop */}
                            <div className="hidden md:flex items-center">
                                <Link href="/">
                                    <Image
                                        src="/assets/images/logo.svg"
                                        alt="Logo"
                                        width={250}
                                        height={75}
                                    />
                                </Link>
                            </div>
                        </>
                    )}



                </div>

                {/* Icons with top padding on mobile */}
                <div className="relative flex items-center space-x-2 pt-4 md:pt-0">
                    {/* Full-Screen Toggle Button */}
                    <button
                        onClick={toggleFullScreen}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                        <FullScreenIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                    </button>

                    <button
                        onClick={toggleMode}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                        {mode === 'dark' ? (
                            <SunIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                        ) : (
                            <MoonIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                        )}
                    </button>

                    <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                        <BellIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                        {/* Notification Dot with Ping Animation */}
                        <span className="absolute top-[-3px] right-0 w-3 h-3 flex justify-center items-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500/50 opacity-75"></span>
                            <span className="relative inline-flex rounded-full w-[6px] h-[6px] bg-green-500"></span>
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 transition">
                            <UserCircleIcon className="h-5 w-5 text-gray-500 hover:text-blue-600 transition" />
                        </button>

                        {dropdownOpen && (
                            <div ref={dropdownRef}
                                 className="absolute right-0 mt-2 w-70 bg-white rounded-md shadow-lg z-10">
                                <div className="py-2 px-6">
                                    <p>{userName}!</p>

                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200">
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
