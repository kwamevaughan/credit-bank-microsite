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
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from "next/link";

const Sidebar = ({ isOpen, toggleSidebar, mode, onLogout }) => {
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
                        <Link href="/dashboard" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <HomeIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Dashboard
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/keyword-manager" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <ArrowTrendingUpIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Keyword Manager
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/upload-website" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <ArrowUpOnSquareIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Upload
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/run-query" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <MagnifyingGlassIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Run Query
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/automation" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <CogIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Automation
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/scraping-log" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <DocumentTextIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Scraping Logs
                        </Link>
                    </li>
                    <li className="py-2">
                        <Link href="/notification-settings" className="flex items-center transition-all duration-500 ease-out transform hover:-translate-y-[10px] hover:shadow-lg hover:py-3">
                            <BellIcon className="h-8 w-8 mr-2 p-1 rounded-full bg-gray-200 text-gray-500 transition" />
                            Notification Settings
                        </Link>
                    </li>
                </ul>

                <button
                    onClick={onLogout}
                    className="w-full bg-gray-100 text-black p-2 rounded-b-lg flex items-center justify-center hover:bg-gray-400 transition duration-200"
                >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" /> Sign Out
                </button>

            </div>
        </div>
    );
};

export default Sidebar;
