import {useEffect, useState} from 'react';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import LeaderboardTable from "@/components/leaderboardTable";

const Leaderboard = ({  }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');

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


    return (
        <div
            className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}
            style={{
                backgroundImage: `url('/assets/images/main-login-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
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
            />

            <main className="py-24">
                <LeaderboardTable
                />


            </main>
        </div>
    );
}

export default Leaderboard;