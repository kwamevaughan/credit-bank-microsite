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

    // Destructure token, user, userFullName from the context
    const { token, user, userFullName } = useUser();

    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const { handleSignOut } = useSignOut();

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

    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            {user && ( // Check if user is defined before rendering ClientHeader
                <ClientHeader
                    userId={user.id}
                    mode={mode}
                    onLogout={handleSignOut}
                    toggleMode={toggleMode}
                />
            )}

            <div className="flex flex-1 transition-all duration-300">
                <main
                    className={`flex-1 p-8 pt-16 transition-all duration-300 ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}>
                    <div className="flex flex-col justify-center text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                            Account Verification Dashboard
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-4 mb-8">
                        <div className="flex-1 space-y-12">
                            {user && (
                                <TransactionIDUpdater
                                    token={token}
                                    userId={user.id}
                                    mode={mode}
                                    onLogout={handleSignOut}
                                    notify={notify}
                                    toggleMode={toggleMode}
                                    toggleFullScreen={toggleFullScreen}
                                />
                            )}

                            {user && (
                                <FileUploadWithPreview
                                    userId={user.id}
                                    mode={mode}
                                    toggleMode={toggleMode}
                                    notify={notify}
                                />
                            )}
                        </div>
                        <div className="flex-[2] space-y-8">
                            {user && (
                                <CustomerTransactionList
                                    userId={user.id}
                                    mode={mode}
                                    toggleMode={toggleMode}
                                    notify={notify}
                                />
                            )}

                            {user && (
                                <CustomerOnboardingList
                                    userId={user.id}
                                    mode={mode}
                                    toggleMode={toggleMode}
                                    notify={notify}
                                />
                            )}
                        </div>

                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VerificationDashboard;
