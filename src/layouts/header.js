import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, MoonIcon, UserCircleIcon, SunIcon, ArrowsPointingInIcon as FullScreenIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from "react-toastify";
import { supabase } from '/lib/supabase';

const Header = ({ token, toggleSidebar, isSidebarOpen, mode, toggleMode, userName, toggleFullScreen, onLogout }) => {
    const [user, setUser] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Create a ref for the dropdown container
    const dropdownRef = useRef(null);

    // Fetch user data from Supabase
    const fetchUserData = async () => {
        if (!token) {
            console.error('Token is missing');
            return;
        }

        const { data, error } = await supabase
            .from('users')
            .select('profile_image')
            .eq('id', token)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            return;
        }

        setUser(data);
        setProfileImage(data.profile_image);
    };

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]);

    // Add event listener to handle clicks outside of the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close the dropdown if clicked outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);




    return (
        <header
            className={`p-4 transition-all duration-300 shadow-sm border-b ${mode === 'dark' ? 'border-[#ff9409]' : 'border-gray-300'} ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white shadow-lg' : 'bg-white text-black'}`}
        >
            <div className="flex flex-col md:flex-row items-center justify-between">
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
                            <div className="group relative">
                                <button onClick={toggleSidebar} className="text-black focus:outline-none">
                                    {isSidebarOpen ? <XMarkIcon className="h-6 w-6"/> :
                                        <Bars3Icon className="h-6 w-6"/>}
                                </button>
                                <span
                                    className="absolute top-10 left-1/2 transform -translate-x-1/2 text-sm text-white bg-black rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                                </span>
                            </div>
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

                <div className="relative flex items-center space-x-2 pt-4 md:pt-0">
                    {/* Fullscreen Button */}
                    <div className="group relative">
                        <button
                            onClick={toggleFullScreen}
                            className={`flex items-center justify-center h-10 w-10 rounded-full ${
                                mode === 'dark' ? 'bg-black' : 'bg-gray-200'
                            } transition`}
                        >
                            <FullScreenIcon
                                className={`h-6 w-6 ${
                                    mode === 'dark' ? 'text-white' : 'text-gray-500'
                                } hover:text-blue-600 transition`}
                            />
                        </button>
                        <span
                            className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${
                                mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'
                            } rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
            Toggle Fullscreen
        </span>
                    </div>

                    {/* Dark/Light Mode Toggle Button */}
                    <div className="group relative">
                        <button
                            onClick={toggleMode}
                            className={`flex items-center justify-center h-10 w-10 rounded-full ${
                                mode === 'dark' ? 'bg-black' : 'bg-gray-200'
                            } transition`}
                        >
                            {mode === 'dark' ? (
                                <SunIcon
                                    className={`h-6 w-6 ${
                                        mode === 'dark' ? 'text-white' : 'text-gray-500'
                                    } hover:text-blue-600 transition`}
                                />
                            ) : (
                                <MoonIcon
                                    className={`h-6 w-6 ${
                                        mode === 'dark' ? 'text-white' : 'text-gray-500'
                                    } hover:text-blue-600 transition`}
                                />
                            )}
                        </button>
                        <span
                            className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${
                                mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'
                            } rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
            {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </span>
                    </div>

                    {/* Profile/Dropdown Button */}
                    <div className="relative group" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`flex items-center justify-center h-10 w-10 rounded-full ${
                                mode === 'dark' ? 'bg-black' : 'bg-gray-200'
                            } transition`}
                        >
                            {profileImage ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden"> {/* Force square container */}
                                    <Image
                                        src={profileImage}
                                        alt="User Profile"
                                        width={48}  // Ensures the image size matches the button size
                                        height={48} // Ensures the image size matches the button size
                                        className="object-cover" // Ensures the image is cropped properly inside the circle
                                    />
                                </div>
                            ) : (
                                <UserCircleIcon
                                    className={`h-6 w-6 ${
                                        mode === 'dark' ? 'text-white' : 'text-gray-500'
                                    } hover:text-blue-600 transition`}
                                />
                            )}
                        </button>
                        <span
                            className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${
                                mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'
                            } rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
            User Menu
        </span>
                        {dropdownOpen && (
                            <div
                                className={`absolute right-0 mt-2 w-48 ${
                                    mode === 'dark' ? 'bg-gray-800' : 'bg-white'
                                } border border-gray-300 rounded-md shadow-lg`}
                            >
                                <ul className="py-1">
                                    <li>
                                        <Link
                                            href="#"
                                            className={`block px-4 py-2 ${
                                                mode === 'dark' ? 'text-white' : 'text-gray-800'
                                            } hover:${mode === 'dark' ? 'bg-gray-400' : 'bg-gray-100'}`}
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className={`block px-4 py-2 ${
                                                mode === 'dark' ? 'text-white' : 'text-gray-800'
                                            } hover:${mode === 'dark' ? 'bg-gray-400' : 'bg-gray-100'}`}
                                        >
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={onLogout}
                                            className={`block w-full text-left px-4 py-2 ${
                                                mode === 'dark' ? 'text-white' : 'text-gray-800'
                                            } hover:${mode === 'dark' ? 'bg-gray-400' : 'bg-gray-100'}`}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>

                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;
