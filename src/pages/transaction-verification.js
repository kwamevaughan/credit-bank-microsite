import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import ClientHeader from "@/layouts/client-header";
import { toast } from 'react-toastify';
import FileUploadWithPreview from '@/components/FileUploadWithPreview';
import TransactionIDUpdater from '@/components/InsertTransactionID';
import CustomerList from '@/components/CustomerList';
import Footer from "@/layouts/footer";

const VerificationDashboard = () => {
    const router = useRouter();
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);
    const [userFullName, setUserFullName] = useState('Guest');
    const [user, setUser] = useState(null); // Define user state

    const notify = (message) => toast(message);

    useEffect(() => {
        const fetchSession = async () => {
            const session = JSON.parse(localStorage.getItem('supabase_session'));

            if (!session) {
                notify("Session expired. Please log in again.");
                return router.push('/client-login');
            }

            setToken(session.access_token);

            // Use optional chaining to avoid errors if user or id are undefined
            const { user: userData } = session; // Get user from session
            setUser(userData); // Store user in state

            if (userData?.id) {
                // Fetch user's name from client_users table
                const { data, error } = await supabase
                    .from('client_users')
                    .select('name')
                    .eq('id', userData.id)
                    .single(); // Assuming only one user will match

                if (error) {
                    console.error('Error fetching user data:', error);
                    notify("Failed to fetch user data.");
                } else if (data) {
                    setUserFullName(data.name || 'Guest'); // Set user name
                } else {
                    console.log('No data found for user');
                }
            } else {
                console.error('User id is not defined');
                notify("Failed to load user data.");
            }
        };

        fetchSession();

        // Token update listener
        const storageListener = () => fetchSession();
        window.addEventListener('storage', storageListener);

        return () => {
            window.removeEventListener('storage', storageListener);
        };
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

    const toggleMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('supabase_session');
        notify("You have been signed out successfully.");
        router.push('/client-login'); // Redirect to login page
    };


    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            {user && ( // Check if user is defined before rendering ClientHeader
                <ClientHeader
                    userId={user.id}
                    mode={mode}
                    onLogout={handleSignOut}
                    toggleMode={toggleMode}
                    toggleFullScreen={toggleFullScreen}
                />
            )}

            <div className="flex flex-1 transition-all duration-300">
                <main
                    className={`flex-1 p-8 pt-16 transition-all duration-300 ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}>
                    <div className="flex flex-col justify-center text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                            Transaction Verification
                        </h2>

                    </div>

                    <div className="flex flex-col md:flex-row w-full gap-4 mb-8"> {/* Use flex with gap to separate the elements */}
                        <div
                            className="flex-1 space-y-12"> {/* This will make FileUploadWithPreview take up equal space */}
                            {user && (
                                <TransactionIDUpdater
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
                        <div className="flex-[2]"> {/* This column will now be twice as wide as the left column */}
                            {user && (
                                <CustomerList
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
            <Footer/>
        </div>
    );
};

export default VerificationDashboard;