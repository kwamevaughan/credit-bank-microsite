import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NavHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <header className="sm:sticky top-0 z-50 shadow-md py-4 px-4 sm:px-10 bg-white font-[sans-serif] min-h-[70px] tracking-wide">
            <div className="flex flex-wrap items-center justify-between gap-5 w-full">
                {/* Logo for larger screens */}
                <Link href="/" className="max-sm:hidden">
                    <Image
                        src="/assets/images/logo.svg"
                        alt="Logo"
                        width={200}
                        height={75}
                    />
                </Link>
                {/* Logo for mobile */}
                <Link href="/" className="hidden max-sm:block">
                    <Image
                        src="/assets/images/logo.svg"
                        alt="Logo"
                        width={150}
                        height={75}
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
                {/* On Desktop: Show the menu items, On Mobile: Show the menu items when open */}
                <div
                    id="collapseMenu"
                    className={`lg:flex ${menuOpen ? 'block' : 'hidden'} lg:block lg:flex-row gap-x-5`}
                >
                    <ul className="flex flex-col lg:flex-row gap-x-5 gap-y-5 lg:gap-y-0">
                        <li className="max-lg:border-b border-gray-300 py-3 px-3">
                            <Link href="/">
                                <span className="hover:text-orange-500 text-gray-500 block font-semibold text-[15px]">Home</span>
                            </Link>
                        </li>
                        <li className="max-lg:border-b border-gray-300 py-3 px-3">
                            <Link href="/leaderboard">
                                <span className="hover:text-orange-500 text-gray-500 block font-semibold text-[15px]">Leaderboard</span>
                            </Link>
                        </li>
                        <li className="max-lg:border-b border-gray-300 py-3 px-3">
                            <Link href="/faqs">
                                <span className="hover:text-orange-500 text-gray-500 block font-semibold text-[15px]">FAQs</span>
                            </Link>
                        </li>
                        <li className="max-lg:border-b border-gray-300 py-3 px-3">
                            <Link href="/privacy-policy">
                                <span className="hover:text-orange-500 text-gray-500 block font-semibold text-[15px]">Privacy Policy</span>
                            </Link>
                        </li>
                        <li className="max-lg:border-b border-gray-300 py-3 px-3">
                            <Link href="/contact">
                                <span className="hover:text-orange-500 text-gray-500 block font-semibold text-[15px]">Support</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex max-lg:ml-auto space-x-4">

                    <Link href="/">
                        <button className="px-4 py-2 text-sm rounded-full font-bold text-white border-2 border-teal-400 bg-teal-400 transition-all ease-in-out duration-300 hover:bg-transparent hover:text-teal-400">
                            Participate
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
