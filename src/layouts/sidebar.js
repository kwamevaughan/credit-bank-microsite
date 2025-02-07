import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowRightOnRectangleIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    ArrowUpOnSquareIcon,
    CogIcon,
    DocumentTextIcon,
    BellIcon,
    ArrowTrendingUpIcon, ArrowDownTrayIcon, QuestionMarkCircleIcon, BanknotesIcon, UserPlusIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from "next/link";
import AppDownloadModal from "@/components/AppDownloadModal";
import {useState} from "react";

const Sidebar = ({ isOpen, toggleSidebar, mode, onLogout, openModal }) => {
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
                            <ChevronLeftIcon className="h-6 w-6 text-gray-950 font-bold" />
                        ) : (
                            <ChevronRightIcon className="h-6 w-6 text-gray-950" />
                        )}
                    </button>
                </div>
                <ul className="flex-grow px-4">
                    <li className="py-2">
                        <Link href="/dashboard"
                              className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <HomeIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
                            Dashboard
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/leaderboard"
                              className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <ArrowTrendingUpIcon
                                className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
                            Leaderboard
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/quiz"
                              className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <QuestionMarkCircleIcon
                                className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
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
                                className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
                            Open An Account
                        </Link>
                    </li>


                    <li className="py-2">
                        <Link href="#"
                              className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3"
                              onClick={openModal} // Open modal on click
                        >
                            <ArrowDownTrayIcon
                                className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
                            Download Mobile App
                        </Link>
                    </li>

                    <li className="py-2">
                        <Link href="#"
                              className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <UserPlusIcon
                                className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition"/>
                            Account Settings
                        </Link>
                    </li>
                </ul>

                <button
                    onClick={onLogout}
                    className="w-full bg-gray-100 text-black p-2 rounded-b-lg flex items-center justify-center hover:bg-gray-400 transition duration-200"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2"/> Sign Out
                </button>

            </div>
        </div>
    );
};

export default Sidebar;
