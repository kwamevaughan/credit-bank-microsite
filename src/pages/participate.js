import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';
import Register from './register'; // Importing the Register component
import { FaRegEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'; // Add FaEye and FaEyeSlash
import { IoKeyOutline } from 'react-icons/io5';
import Image from 'next/image'; // Import Next.js Image component
import NavHeader from '../layouts/nav-header'; // Import Header Component
import { useRouter } from 'next/router'; // Import useRouter for redirection

export default function Participate() {
    const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and register
    const [loginEmail, setLoginEmail] = useState('');
    const [loginReferralCode, setLoginReferralCode] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter(); // Initialize router
    const notify = (message) => toast(message);

    useEffect(() => {
        // Check if 'Remember me' credentials are stored in localStorage on initial load
        const storedEmail = localStorage.getItem('loginEmail');
        const storedReferralCode = localStorage.getItem('loginReferralCode');

        if (storedEmail && storedReferralCode) {
            setLoginEmail(storedEmail);
            setLoginReferralCode(storedReferralCode);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact' }) // Get the count of rows
            .eq('email', loginEmail)
            .eq('referral_code', loginReferralCode);

        // Check if there is an error
        if (error) {
            console.log('Error message:', error.message); // Optional logging
            toast.error('An error occurred while trying to log in. Please try again.');
            return;
        }

        // Handle no data case (invalid credentials)
        if (count === 0) {
            toast.error('Invalid email or referral code. Please check your credentials.');
            return;
        }

        // Handle multiple rows (this shouldn't happen if data is unique)
        if (count > 1) {
            toast.error('Multiple accounts found with the same credentials. Please contact support.');
            return;
        }

        // If login is successful, store credentials in localStorage if "Remember me" is checked
        if (data && data.length === 1) {
            toast.success(`Login successful! Welcome, ${data[0].name}`);

            // Store token in localStorage or sessionStorage
            localStorage.setItem('token', data[0].id); // assuming data[0].id is the token

            if (rememberMe) {
                localStorage.setItem('loginEmail', loginEmail);
                localStorage.setItem('loginReferralCode', loginReferralCode);
            } else {
                localStorage.removeItem('loginEmail');
                localStorage.removeItem('loginReferralCode');
            }

            // Redirect to /dashboard after successful login
            router.push('/dashboard');
        }
    };

    return (
        <div
            className="w-full"
            style={{
                backgroundImage: `url('/assets/images/main-login-bg.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >

            {/* Container with Flexbox to center content below the header */}
            <div className=" flex-col items-center justify-center min-h-screen">
                <NavHeader />

                {/* Login Form Container centered below the header */}
                <div className="flex flex-col items-center justify-center w-full mt-20">

                    {/* Login or Register Form */}
                    <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-2xl border-white border-4 overflow-hidden max-w-sm lg:max-w-4xl w-full lg:w-3/4">
                        {/* Left Side - Form Content */}
                        <div className="w-full md:w-1/2 p-8 px-10">
                            {/* Conditional Rendering of Login or Register Form */}
                            {isRegistering ? (
                                <>
                                    <Register closeRegister={() => setIsRegistering(false)} />
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setIsRegistering(false)}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                        >
                                            Return to Login
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-center text-3xl font-bold leading-10 mobile:text-2xl">Welcome back!</p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
                                        <a
                                            href="#"
                                            className="px-2 text-xs font-bold hover:text-gray-900 underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsRegistering(true); // Toggle to registration form
                                            }}
                                        >
                                            Register to participate
                                        </a>
                                    </p>

                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                    <form onSubmit={handleLogin}>
                                        {/* Email Field */}
                                        <div className="mt-4">
                                            <label className="hidden text-gray-700 text-sm font-bold mb-2">
                                                Email Address
                                            </label>
                                            <div className="flex items-center border border-gray-300 rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                                                <span className="px-2">
                                                    <FaRegEnvelope className="h-5 w-5 text-gray-500" />
                                                </span>
                                                <input
                                                    className="text-gray-700 py-2 px-4 block w-full rounded"
                                                    type="text"
                                                    value={loginEmail}
                                                    onChange={(e) => setLoginEmail(e.target.value)}
                                                    placeholder="Email"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* Referral Field */}
                                        <div className="mt-4">
                                            <label className="hidden text-gray-700 text-sm font-bold mb-2">
                                                Referral Code
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                                    <IoKeyOutline className="text-gray-500 h-5 w-5" />
                                                </span>
                                                <input
                                                    className="text-gray-700 border border-gray-300 rounded py-2 pl-10 pr-10 block w-full focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out"
                                                    type={"text"}
                                                    value={loginReferralCode}
                                                    onChange={(e) => setLoginReferralCode(e.target.value)}
                                                    placeholder="Referral Code"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        {/* Remember Me and Register Link */}
                                        <div className="flex items-center justify-between mt-2">
                                            <label className="flex items-center text-xs text-gray-500">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={rememberMe}
                                                    onChange={() => setRememberMe(!rememberMe)}
                                                />
                                                Remember me
                                            </label>
                                            <a
                                                href="#"
                                                className="text-xs font-bold hover:text-gray-900 underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsRegistering(true); // Toggle to registration form
                                                }}
                                            >
                                                Register?
                                            </a>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="mt-8">
                                            <button
                                                type="submit"
                                                className="bg-orange-600 text-white font-bold py-2 px-4 w-full rounded-2xl transform transition-transform duration-700 ease-in-out hover:scale-105"
                                            >
                                                Login
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            <div className="mt-4 flex items-center w-full text-center">
                                <a
                                    href="https://growthpad.co.ke"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-500 capitalize text-center w-full"
                                >
                                    Powered by
                                    <span className="text-violet-700"> Growthpad Consulting Group</span>
                                </a>
                            </div>
                        </div>

                        {/* Right Side Background Image */}
                        <div
                            className="hidden md:block lg:w-1/2 bg-cover bg-center transition-all duration-700 ease-in-out"
                            style={{
                                backgroundImage: `url('/assets/images/login-bg-diaspora.jpg')`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
