import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    ArrowRightStartOnRectangleIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ArrowUpOnSquareIcon,
    CogIcon,
    DocumentTextIcon,
    BellIcon,
    ArrowTrendingUpIcon, ArrowDownTrayIcon, QuestionMarkCircleIcon, BanknotesIcon, UserPlusIcon,
    ArrowsPointingInIcon as FullScreenIcon, MoonIcon, SunIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from "next/link";
import AppDownloadModal from "@/components/AppDownloadModal";
import {useState} from "react";

const Sidebar = ({ isOpen, toggleSidebar, mode, onLogout, openModal, toggleFullScreen, toggleMode}) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility



    return (
        <div
            className={`fixed left-0 top-0 h-full shadow-md transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-white text-black'}`}
            style={{ width: '256px' }}
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between p-4">
                    <Link href="/">
                        <Image
                            src="/assets/images/logo.svg"
                            alt="Logo"
                            width={300}
                            height={75}
                        />
                    </Link>
                    <button onClick={toggleSidebar} className="-ml-2">
                        {isOpen ? (
                            <ChevronLeftIcon className="h-6 w-6 text-gray-950 font-bold"/>
                        ) : (
                            <ChevronRightIcon className="h-6 w-6 text-gray-950"/>
                        )}
                    </button>
                </div>
                <ul className="flex-grow px-4">
                    <li className="py-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                        >
                            <HomeIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Dashboard
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link
                            href="/leaderboard"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                        >
                            <ArrowTrendingUpIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Leaderboard
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link
                            href="/quiz"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                        >
                            <QuestionMarkCircleIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Quiz
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link
                            href="https://diaspora.creditbank.co.ke/apply/"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                            target="_blank"
                        >
                            <DocumentTextIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Open An Account
                        </Link>
                    </li>

                    <li className="py-2">
                        <Link
                            href="#"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                            onClick={openModal} // Open modal on click
                        >
                            <ArrowDownTrayIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Download Mobile App
                        </Link>
                    </li>

                    <li className="py-2">
                        <Link
                            href="#"
                            className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                        >
                            <UserPlusIcon
                                className={`h-8 w-8 mr-2 p-1 rounded-full ${
                                    mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
                                } transition`}
                            />
                            Account Settings
                        </Link>
                    </li>
                </ul>


                <div className="relative flex items-center space-x-2 pt-4 md:pt-0 w-full">
                    {/* Dark/Light Mode Toggle */}
                    <div className="group relative w-full">
                        <button
                            onClick={toggleMode}
                            className={`flex items-center justify-between w-full gap-x-2 ${mode === 'dark' ? 'bg-black text-white' : 'bg-gray-200 text-black'} px-2 py-2 rounded-full`}
                        >
                            {mode === 'dark' ? "Light Mode" : "Dark Mode"}
                            {mode === 'dark' ? (
                                <SunIcon className="h-6 w-6 text-white hover:text-[#ff9409] transition"/>
                            ) : (
                                <MoonIcon className="h-6 w-6 text-gray-500 hover:text-[#ff9409] transition"/>
                            )}
                        </button>
                        <span
                            style={{top: '-50px'}} // Custom top value
                            className="absolute left-0 w-full text-sm text-white bg-black rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
            {mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </span>
                    </div>

                    {/* Sign Out Button */}
                    <div className="group relative w-full">
                        <button
                            onClick={onLogout}
                            className={`flex items-center justify-between w-full gap-x-2 ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'} px-4 py-2 rounded-full`}
                        >
                            Sign Out
                            <ArrowRightStartOnRectangleIcon
                                className="h-6 w-6 text-gray-500 hover:text-[#ff9409] transition"/>
                        </button>
                        <span
                            style={{top: '-50px'}} // Custom top value
                            className="absolute left-0 w-full text-sm text-white bg-black rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
            Sign Out
        </span>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Sidebar;
