import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ClientHeader from "@/layouts/client-header";
import { toast } from 'react-toastify';
import FileUploadWithPreview from '@/components/FileUploadWithPreview';
import TransactionIDUpdater from '@/components/InsertTransactionID';
import CustomerTransactionList from '@/components/CustomerTransactionList';
import CustomerOnboardingList from '@/components/CustomerOnboardingList';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';
import Footer from "@/layouts/footer";

const VerificationDashboard = () => {
    const router = useRouter();
    const { token, user, userFullName, loading } = useUser();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const { handleSignOut } = useSignOut();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const notify = (message) => toast(message);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const checkAuth = () => {
            try {
                const sessionStr = localStorage.getItem('supabase_session');
                if (!sessionStr) {
                    router.push('/');
                    return;
                }

                const session = JSON.parse(sessionStr);
                if (!session || !session.user || !session.user.username) {
                    router.push('/');
                    return;
                }

                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error checking authentication:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    // If not authenticated, don't render anything
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <ClientHeader
                userId={user?.id}
                mode={mode}
                onLogout={handleSignOut}
                toggleMode={toggleMode}
            />

            <div className="flex flex-1 transition-all duration-300">
                <main
                    className={`flex-1 p-8 pt-16 transition-all duration-300 ${
                        mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'
                    } w-full`}
                >
                    <div className="flex flex-col justify-center text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                            Account Verification Dashboard
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-4 mb-8">
                        <div className="flex-1 space-y-12">
                            <TransactionIDUpdater
                                token={token}
                                userId={user?.id}
                                mode={mode}
                                onLogout={handleSignOut}
                                notify={notify}
                                toggleMode={toggleMode}
                                toggleFullScreen={toggleFullScreen}
                            />

                            <FileUploadWithPreview
                                userId={user?.id}
                                mode={mode}
                                toggleMode={toggleMode}
                                notify={notify}
                            />
                        </div>
                        <div className="flex-[2] space-y-8">
                            <CustomerTransactionList
                                userId={user?.id}
                                mode={mode}
                                toggleMode={toggleMode}
                                notify={notify}
                            />

                            <CustomerOnboardingList
                                userId={user?.id}
                                mode={mode}
                                toggleMode={toggleMode}
                                notify={notify}
                            />
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VerificationDashboard;