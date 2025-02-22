import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserProvider, useUser } from '../context/UserContext';
import SessionExpired from '../components/SessionExpired';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    const [mode, setMode] = useState('light');
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const router = useRouter();

    // Check session on page load or when route changes
    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (savedMode === 'system') {
                setMode(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return (
        <UserProvider>
            <UserComponent
                mode={mode}
                isSessionExpired={isSessionExpired}  // Pass isSessionExpired here
                setIsSessionExpired={setIsSessionExpired}
                router={router}
                Component={Component}
                pageProps={pageProps}
            />
            <ToastContainer position="top-right" />
        </UserProvider>
    );
}

const UserComponent = ({ mode, isSessionExpired, setIsSessionExpired, router, Component, pageProps }) => {
    const { user, token, setToken, setUser } = useUser(); // Destructure setUser here

    useEffect(() => {
        const session = localStorage.getItem('supabase_session');

        // Check if user is logged in
        if (session) {
            const parsedSession = JSON.parse(session);
            setToken(parsedSession.access_token);  // Update context with new token
            setUser(parsedSession.user);  // Set user in context
        }
    }, [setToken, setUser]);

    useEffect(() => {
        const excludedPaths = ['/', '/participate', '/client-login'];

        // Only trigger session check if not on excluded paths
        if (!excludedPaths.includes(router.pathname)) {
            const session = localStorage.getItem('supabase_session');

            if (!session || !JSON.parse(session).access_token) {
                // Redirect to /participate if no session
                setIsSessionExpired(true); // Optional: Set the session expired state to trigger the countdown
                router.push('/participate');  // Redirect user to participate to log in
            } else {
                setIsSessionExpired(false); // Reset session expired state
            }
        }
    }, [router.pathname, setIsSessionExpired]);

    // Show session expired page if the session has expired and user is not on the /participate page
    if (isSessionExpired && router.pathname !== '/participate') {
        return <SessionExpired isSessionExpired={isSessionExpired} />;
    }

    return (
        <div className={mode === 'dark' ? 'dark' : ''}>
            <Component {...pageProps} mode={mode} />
        </div>
    );
};

export default MyApp;
