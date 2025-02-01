import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import UserInfo from "@/components/userInfo";

const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);

    const notify = (message) => toast(message);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(token);
        if (!token) {
            router.push('/');
        }
    }, [router]);

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

    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={() => {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        router.push('/'); // Redirect to login
                    }}
                />

                <main className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-transparent text-black'}`}>
                    <UserInfo
                        mode={mode}
                        toggleMode={toggleMode}
                        token={token}
                        notify={notify}
                    />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;