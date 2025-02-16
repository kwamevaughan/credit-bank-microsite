import { useState, useEffect } from 'react';
import { UserProvider } from '../context/UserContext';  // adjust the path if necessary
import { ToastContainer } from 'react-toastify';  // Ensure this is imported
import 'react-toastify/dist/ReactToastify.css'; // Ensure Toastify CSS is loaded
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
    const [mode, setMode] = useState('light');

    const toggleMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            console.log('Toggling mode to:', newMode);
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

    useEffect(() => {
        localStorage.setItem('mode', mode);
    }, [mode]);

    return (
        <UserProvider>
            <div className={mode === 'dark' ? 'dark' : ''}>
                <Component {...pageProps} mode={mode} toggleMode={toggleMode} />
                <ToastContainer position="top-right" />
            </div>
        </UserProvider>
    );
}

export default MyApp;
