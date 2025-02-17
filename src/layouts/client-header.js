import React, { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon, MoonIcon, UserCircleIcon, SunIcon, ArrowsPointingInIcon as FullScreenIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from "react-toastify";
import { supabase } from '/lib/supabase';
import useFullScreen from '@/hooks/useFullScreen';  // Import the custom hook
import useHeaderUserData from '@/hooks/useHeaderUserData';  // Import the new header-specific hook

const ClientHeader = ({ userId, mode, toggleMode, onLogout }) => {
    const { profileImage, userName } = useHeaderUserData(userId); // Use the new custom hook for header data
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const toggleFullScreen = useFullScreen();  // Using the custom hook

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false); // Close the dropdown if clicked outside
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header
            className={`p-4 transition-all duration-300 shadow-sm border-b ${mode === 'dark' ? 'border-[#ff9409]' : 'border-gray-300'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white shadow-lg' : 'bg-white text-black'}`}
        >
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="md:flex items-center">
                        <Link href="/">
                            <Image
                                src="/assets/images/logo.svg"
                                alt="Logo"
                                width={250}
                                height={75}
                            />
                        </Link>
                    </div>
                </div>

                <div className="relative flex items-center space-x-2 pt-4 md:pt-0">
                    {/* Fullscreen Button */}
                    <div className="group relative">
                        <button
                            onClick={toggleFullScreen}
                            className={`flex items-center justify-center h-10 w-10 rounded-full ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'} transition`}
                        >
                            <FullScreenIcon
                                className={`h-6 w-6 ${mode === 'dark' ? 'text-white' : 'text-gray-500'} hover:text-blue-600 transition`}
                            />
                        </button>
                        <span className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'} rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            Toggle Fullscreen
                        </span>
                    </div>

                    {/* Dark/Light Mode Toggle Button */}
                    <div className="group relative">
                        <button onClick={toggleMode} className={`flex items-center justify-center h-10 w-10 rounded-full ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'} transition`}>
                            {mode === 'dark' ? (
                                <SunIcon className={`h-6 w-6 ${mode === 'dark' ? 'text-white' : 'text-gray-500'} hover:text-blue-600 transition`} />
                            ) : (
                                <MoonIcon className={`h-6 w-6 ${mode === 'dark' ? 'text-white' : 'text-gray-500'} hover:text-blue-600 transition`} />
                            )}
                        </button>
                        <span className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'} rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </span>
                    </div>

                    {/* Profile/Dropdown Button */}
                    <div className="relative group" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className={`flex items-center justify-center h-10 w-10 rounded-full ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'} transition`}>
                            {profileImage ? (
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        src={profileImage}
                                        alt={userName || "User Profile"}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <UserCircleIcon className={`h-6 w-6 ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'} hover:text-blue-600 transition`} />
                            )}
                        </button>
                        <span className={`absolute top-10 left-1/2 transform -translate-x-1/2 text-sm ${mode === 'dark' ? 'text-black bg-white' : 'text-white bg-black'} rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            User Menu
                        </span>
                        {dropdownOpen && (
                            <div className={`absolute right-0 mt-2 w-48 ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-300 rounded-md shadow-lg`}>
                                <ul className="py-1">
                                    <li>
                                        <button onClick={onLogout} className={`block w-full text-left px-4 py-2 ${mode === 'dark' ? 'text-white' : 'text-gray-800'} hover:${mode === 'dark' ? 'bg-gray-400' : 'bg-gray-100'}`}>
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

export default ClientHeader;
