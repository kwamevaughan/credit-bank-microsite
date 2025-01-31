import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import Image from 'next/image';

// Define the path to your countries JSON file
const countriesJsonPath = '/assets/misc/countries.json';

const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [userId, setUserId] = useState('');  // To store the dynamically generated user ID
    const [countryCode, setCountryCode] = useState('');  // To store the country code
    const [countries, setCountries] = useState([]);  // To store the countries data

    // Fetch the countries JSON file when the component mounts
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch(countriesJsonPath);
                const data = await response.json();
                setCountries(data);  // Store the data in the state
            } catch (error) {
                console.error('Error loading countries data:', error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(token); // Set the token here
        if (token) {
            // Fetch user data if token exists
            const fetchUserData = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, points, country')
                    .eq('id', token)
                    .single();
                if (error) {
                    console.error('Error fetching user data:', error);
                } else {
                    setUserName(data.name);
                    setUserPoints(data.points);

                    // Find the country code using the country name
                    const country = countries.find(item => item.name === data.country);
                    if (country) {
                        setCountryCode(country.code);  // Set the country code
                        setUserId(`CB${data.id}${country.code}`);  // Format: CB<userID><countryCode>
                    } else {
                        setCountryCode('XX');  // Default to 'XX' if country not found
                        setUserId(`CB${data.id}XX`);  // Default format if country code not found
                    }
                }
            };

            fetchUserData();
        } else {
            router.push('/'); // Redirect to login if no token is found
        }
    }, [token, countries]);  // Dependency on both token and countries

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
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                userName={userName}
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

                <main
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-transparent text-black'}`}>

                    <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-14 px-4 md:px-8`}>
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr]"> {/* Set left column to 2fr and right column to 1fr */}
                            <div className="flex items-center">
                                <div className="px-4 space-y-4">
                                    <div className="block mx-auto">
                                        <Image
                                            src="/assets/images/placeholder.png"
                                            alt="Placeholder Image"
                                            width={120}
                                            height={50}
                                            className="block mx-auto"
                                        />
                                        <Image
                                            src="/assets/images/rank-1.png"
                                            alt="Position Ranking Image"
                                            width={50}
                                            height={50}
                                            className="block mt-[-3em] ml-[60%]"
                                        />
                                    </div>
                                    <div
                                        className="py-2 px-6 bg-[#e7f8f7] border border-[#0eb4ab] rounded-lg text-[#0eb4ab]">
                                        User ID: {userId || 'Loading...'} {/* Dynamically generated user ID */}
                                    </div>
                                </div>
                                <div className="px-4">
                                    <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold ">
                                        Hi {userName} 👋,
                                    </h2>
                                    <p className="font-normal text-base sm:text-2xl">welcome to your profile!</p>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center px-4 space-y-4">
                                <div
                                    className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#f7f1eb] text-black'} flex justify-between items-center py-2 px-4 border border-[#FF930A] rounded-lg font-bold`}>
                                    <div className="flex items-center">
                                        <Image
                                            src="/assets/images/rank-1.png"
                                            alt="Position Ranking Image"
                                            width={50}
                                            height={50}
                                            className=""
                                        />
                                        <p>Points</p>
                                    </div>

                                    <span className="text-2xl font-extrabold">{userPoints || 'Loading...'}</span>
                                </div>

                                <div
                                    className={`${
                                        mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#e7f8f7] text-black'
                                    } flex justify-between items-center py-4 px-4 border border-[#0eb4ab] rounded-lg font-bold`}
                                >
                                    <p>Actions Completed</p>
                                    <span className="text-2xl font-extrabold">120</span>
                                </div>


                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default Dashboard;
