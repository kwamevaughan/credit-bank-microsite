import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import useUserData from '@/hooks/useUserData';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { useRouter } from 'next/router';
import UserInfo from "@/components/userInfo";

const OpenAccount = () => {
    const { token } = useUser();
    const router = useRouter();
    const [notify, setNotify] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [mode, setMode] = useState('light');

    // Call useUserData unconditionally
    const userData = useUserData(token);
    const { userName, userEmail, imageUrl: profileImage } = userData || {};

    // Handle the sign-out process
    const handleSignOut = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('loginEmail');
        localStorage.removeItem('loginReferralCode');
        router.push('/');
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

    // Loading state
    if (!token) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f1eb]'}`}>
            <Header
                token={token}
                profileImage={profileImage}
                userName={userName}
                userEmail={userEmail}
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    token={token}
                    isOpen={isSidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    mode={mode}
                    onLogout={handleSignOut}
                    toggleMode={toggleMode}
                />
            </div>

            <main
                className={`flex-1 pt-14 p-8 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} ${mode === "dark" ? "bg-[#0a0c1d] text-white" : "bg-[#f7f1eb] text-black"}`}>
                <div className="space-y-6">
                    <UserInfo
                        mode={mode}
                        toggleMode={toggleMode}
                        token={token}
                        notify={notify}
                        userData={userData}
                    />
                    <h1>Welcome to your Profile, {userName}!</h1>
                </div>
            </main>
        </div>
    );
};

export default OpenAccount;