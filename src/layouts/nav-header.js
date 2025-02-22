import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NavHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <header className="sm:sticky top-0 py-2 px-8 md:px-40 bg-[#f7f1eb] tracking-wide z-[100]">
            <div className="flex flex-wrap items-center justify-between gap-5 md:gap-0 w-full mb-8 md:mb-0">
                {/* Logo with responsive width */}
                <Link href="/">
                    <Image
                        src="/assets/images/logo.svg"
                        alt="Logo"
                        width={220}  // Default size for larger screens
                        height={75}
                        className="sm:w-[150px] md:w-[220px]"  // Resize logo for different screens
                    />
                </Link>

                {/* Mobile Menu Toggle Button */}
                <button
                    id="toggleOpen"
                    className="lg:hidden flex items-center justify-center w-8 h-8"
                    onClick={toggleMenu}
                >
                    {/* Show Hamburger Icon when Menu is Closed, Show Close Icon when Open */}
                    {menuOpen ? (
                        <XMarkIcon className="w-7 h-7 text-black" />
                    ) : (
                        <Bars3Icon className="w-7 h-7 text-black" />
                    )}
                </button>

                {/* Menu Items */}
                <div
                    id="collapseMenu"
                    className={`lg:flex ${menuOpen ? 'block' : 'hidden'} lg:block lg:flex-row gap-x-5 bg-[#f7f1eb] 
      ${menuOpen ? 'fixed inset-0 top-[70px] left-0 w-full h-full z-40' : ''}`}
                >
                    <ul className="flex flex-col lg:flex-row gap-x-5 gap-y-1 lg:gap-y-0 p-5 text-black text-lg">
                        <li className="py-3 px-3">
                            <Link href="/">
                                <span className="hover:text-orange-500 block">Home</span>
                            </Link>
                        </li>
                        <li className="py-3 px-3">
                            <Link href="#about-the-campaign">
                                <span className="hover:text-orange-500 block">About the Campaign</span>
                            </Link>
                        </li>
                        <li className="py-3 px-3">
                            <Link href="#how-it-works">
                                <span className="hover:text-orange-500 block">How It Works</span>
                            </Link>
                        </li>
                        <li className="py-3 px-3">
                            <Link href="#actions">
                                <span className="hover:text-orange-500 block">Actions</span>
                            </Link>
                        </li>
                        <li className="py-3 px-3">
                            <Link href="#leaderboard">
                                <span className="hover:text-orange-500 block">Leaderboard</span>
                            </Link>
                        </li>
                        <li className="py-3 px-3">
                            <Link href="#quiz">
                                <span className="hover:text-orange-500 block">Quiz</span>
                            </Link>
                        </li>
                    </ul>
                    <div className="flex md:hidden sm:ml-auto space-x-4 px-5">
                        <Link href="/participate">
                            <button
                                className="px-20 py-2 text-md rounded-lg font-bold text-white border-2 border-teal-400 bg-teal-400 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-teal-400">
                                Join Now
                            </button>
                        </Link>
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex sm:ml-auto space-x-4">
                    <Link href="/participate">
                        <button
                            className="px-6 py-2 text-md rounded-lg font-bold text-white border-2 border-teal-400 bg-teal-400 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-teal-400">
                        Join Now
                        </button>
                    </Link>
                </div>
            </div>
        </header>


    );
}
