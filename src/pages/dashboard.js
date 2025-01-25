import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";

const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(token); // Set the token here
        if (token) {
            // Fetch user data if token exists
            const fetchUserData = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('name, points')
                    .eq('id', token)
                    .single();
                if (error) {
                    console.error('Error fetching user data:', error);
                } else {
                    setUserName(data.name);
                    setUserPoints(data.points);
                }
            };

            fetchUserData();
        } else {
            router.push('/'); // Redirect to login if no token is found
        }
    }, []);


    // Set mode from localStorage or system preference, only after mounting
    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);  // Only run once on mount

    // Set isSidebarOpen after mounting
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);  // Only run once on mount

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
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                userName={userName}
            />

            <div className="shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-1 transition-all duration-300"
                 style={{
                     backgroundImage: `url('/assets/images/main-login-bg.jpg')`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     backgroundRepeat: 'no-repeat',
                 }}>

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

                <main
                    className={`flex-1 p-6 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#fafafa] text-black'}`}>
                    <h2 className="text-4xl font-bold text-teal-600 mb-4 text-center">Welcome, {userName}!</h2>
                    <p className="mb-4 text-center">You have {userPoints} points.</p>

                </main>

            </div>
        </div>
    );
};

export default Dashboard;
