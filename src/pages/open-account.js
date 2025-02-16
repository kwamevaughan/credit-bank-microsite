import { useUser } from '@/context/UserContext';  // Import the context
import { useEffect, useState } from 'react';
import useUserData from '@/hooks/useUserData';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { useRouter } from 'next/router';  // Import router for navigation

const OpenAccount = () => {
    const { token } = useUser();  // Access token from context
    const router = useRouter();  // Use router for redirection

    // Early return for loading state if token is not available yet
    if (!token) {
        return <div>Loading...</div>;
    }

    const { userName, userEmail, imageUrl: profileImage } = useUserData(token);
    const [isSidebarOpen, setSidebarOpen] = useState(true); // State for sidebar
    const [mode, setMode] = useState('light'); // State for mode (light or dark)

    // Handle the sign-out process
    const handleSignOut = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('loginEmail');
        localStorage.removeItem('loginReferralCode');
        router.push('/'); // Redirect to login page after sign-out
    };

    // Toggle dark/light mode
    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f1eb]'}`}>

            <Header
                token={token}
                profileImage={profileImage}
                userName={userName}
                userEmail={userEmail}
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}  // Toggle sidebar visibility
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}  // Toggle dark/light mode
            />

            <div className="flex flex-1 transition-all duration-300">

                <Sidebar
                    token={token}
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}  // Toggle sidebar visibility
                    mode={mode}
                    onLogout={handleSignOut}  // Handle logout
                    toggleMode={toggleMode}  // Toggle dark/light mode
                />
            </div>

            <main
                className={`flex-1 pt-14 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} ${mode === "dark" ? "bg-[#0a0c1d] text-white" : "bg-[#f7f1eb] text-black"}`}>
                <h1>Welcome to your Profile, {userName}!</h1>
                {/* Display the profile data */}
            </main>
        </div>
    );
};

export default OpenAccount;
