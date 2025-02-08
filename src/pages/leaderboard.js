import {useEffect, useState} from 'react';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import LeaderboardTable from "@/components/leaderboardTable";
import AppDownloadModal from "@/components/AppDownloadModal";


const Leaderboard = ({ }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [isModalOpen, setIsModalOpen] = useState(false); // State for Modal

    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);

    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        notify("You have been signed out successfully.");
        router.push('/'); // Redirect to login page
    };

    const openModal = () => {
        setIsModalOpen(true); // Function to open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Function to close the modal
    };

    return (
        <div
            className={`flex flex-col h-screen ${mode === 'dark' ? 'dark' : ''}`}

        >
            <Header
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
            />
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                mode={mode}
                onLogout={handleSignOut}
                openModal={openModal} // Pass the openModal function down to Sidebar

            />

            <main className="">
                <LeaderboardTable
                    mode={mode}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}

                />

                <AppDownloadModal
                    isOpen={isModalOpen}
                    onClose={closeModal} // Pass close function
                />

            </main>
        </div>
    );
}

export default Leaderboard;