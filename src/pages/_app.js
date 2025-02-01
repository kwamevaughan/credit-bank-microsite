import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';  // Ensure this is imported
import 'react-toastify/dist/ReactToastify.css'; // Ensure Toastify CSS is loaded
import '../styles/globals.css';
import Head from 'next/head'; // Import the Head component

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
        <>
            <Head>
                <link rel="icon" href="/favicon.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <title>Credit Bank Diaspora Campaign</title>
            </Head>
            <div className={mode === 'dark' ? 'dark' : ''}>
                <Component {...pageProps} mode={mode} toggleMode={toggleMode} />
                {/* Global Toast Container */}
                <ToastContainer position="top-right" />
            </div>
        </>
    );
}

export default MyApp;