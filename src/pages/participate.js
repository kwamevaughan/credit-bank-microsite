import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';
import Register from './register'; // Importing the Register component
import { FaRegEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa'; // Add FaEye and FaEyeSlash
import { IoKeyOutline } from 'react-icons/io5';
import Image from 'next/image'; // Import Next.js Image component
import Link from 'next/link';
import NavHeader from '../layouts/nav-header'; // Import Header Component
import Footer from '../layouts/footer';
import ForgotPasswordModal from '../components/forgotPassword';

import { useRouter } from 'next/router'; // Import useRouter for redirection

export default function Participate() {
    const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and register
    const [loginEmail, setLoginEmail] = useState('');
    const [loginReferralCode, setLoginReferralCode] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to track visibility of password
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

    const router = useRouter(); // Initialize router
    const notify = (message) => toast(message);

    const handleFormSwitch = (e) => {
        e.preventDefault();
        setIsRegistering(!isRegistering); // Toggle between Register and Login
    };


    useEffect(() => {
        const { referralCode } = router.query;

        // Check if 'Remember me' credentials are stored in localStorage on initial load
        const storedEmail = localStorage.getItem('loginEmail');
        const storedReferralCode = localStorage.getItem('loginReferralCode');

        if (storedEmail && storedReferralCode) {
            setLoginEmail(storedEmail);
            setLoginReferralCode(storedReferralCode);
            setRememberMe(true);
        }

        // If there is a referral code in the URL, set it to the state and open the registration form
        if (referralCode) {
            setLoginReferralCode(referralCode); // Set the code from the URL
            setIsRegistering(true); // Automatically open registration
        }
    }, [router.query]);


    const handleLogin = async (e) => {
        e.preventDefault();

        // Start the authentication toast
        const toastId = toast.info('Authenticating... Please wait.', {
            autoClose: false, // Keep this toast open indefinitely until updated
            position: "top-center",
            closeButton: false, // Hide close button
            hideProgressBar: false, // Show progress bar while loading
            draggable: false
        });

        // Proceed with the login logic
        const { data, error, count } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .eq('email', loginEmail)
            .eq('referral_code', loginReferralCode);

        // Check if there is an error
        if (error) {
            console.log('Error message:', error.message);
            toast.update(toastId, {
                render: 'An error occurred while trying to log in. Please try again.',
                type: "error", // Use "error" string instead of toast.TYPE.ERROR
                autoClose: 5000
            });
            return;
        }

        // Handle no data case (invalid credentials)
        if (count === 0) {
            toast.update(toastId, {
                render: 'Invalid email or referral code. Please check your credentials.',
                type: "error", // Use "error" string instead of toast.TYPE.ERROR
                autoClose: 5000
            });
            return;
        }

        // Handle multiple rows (this shouldn't happen if data is unique)
        if (count > 1) {
            toast.update(toastId, {
                render: 'Multiple accounts found with the same credentials. Please contact support.',
                type: "error", // Use "error" string instead of toast.TYPE.ERROR
                autoClose: 5000
            });
            return;
        }

        // If login is successful, update the toast to show success
        if (data && data.length === 1) {
            const user = data[0]; // User data from the database

            toast.update(toastId, {
                render: `Authenticated! Welcome, ${user.name}`, // Just the success message
                type: "success",  // Use "success" string
                autoClose: 3000, // Auto close after a few seconds
                className: 'shadow-lg rounded-lg p-4', // Tailwind for success styling
                closeButton: true, // Show close button
            });

            // Manually create a session-like object and store it in localStorage
            const session = {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                access_token: user.id,  // You could also store an actual token here if needed
            };

            // Store the session object in localStorage
            localStorage.setItem('supabase_session', JSON.stringify(session));

            // Optionally store the user email and referral code if "Remember me" is checked
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




    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full bg-[#f7f1eb]">
            <div className="flex flex-col items-center justify-center w-full py-20">
                <div className="flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden max-w-sm lg:max-w-full w-full lg:w-3/4">
                    <div
                        className="hidden md:block lg:w-1/2 bg-cover bg-center transition-all duration-700 ease-in-out"
                        style={{ backgroundImage: `url('/assets/images/form-bg.png')` }}
                    ></div>

                    <div className="w-full md:w-1/2 p-8 px-10">
                        {isRegistering ? (
                            <Register closeRegister={() => setIsRegistering(false)} referralCode={loginReferralCode} />
                        ) : (
                            <>
                                <div className="pb-10">
                                    <Link href="/">
                                        <Image src="/assets/images/logo.svg" alt="Logo" width={300} height={50} />
                                    </Link>
                                </div>
                                <div className="pb-2">
                                    <p className="text-3xl leading-10 mobile:text-2xl pb-2">Welcome back!</p>
                                    <p>
                                        Log in to track your progress, earn points, and stand a chance to win the
                                        Diaspora Champions Challenge.
                                    </p>
                                </div>

                                {error && <p style={{ color: 'red' }}>{error}</p>}
                                <form onSubmit={handleLogin}>
                                    <div className="mt-4">
                                        <label className="text-gray-700 text-sm font-bold mb-2">E-mail</label>
                                        <div className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                                            <input
                                                className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                                                type="text"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                placeholder="example@gmail.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label className="text-gray-700 text-sm font-bold mb-2">Password</label>
                                        <div className="relative">
                                            <span
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? (
                                                    <FaEyeSlash className="text-gray-500 h-5 w-5" />
                                                ) : (
                                                    <FaEye className="text-gray-500 h-5 w-5" />
                                                )}
                                            </span>
                                            <input
                                                className="bg-transparent text-gray-700 border border-[#FF930A] rounded py-2 px-4 block w-full focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out"
                                                type={showPassword ? 'text' : 'password'}
                                                value={loginReferralCode}
                                                onChange={(e) => setLoginReferralCode(e.target.value)}
                                                placeholder="Enter Referral Code"
                                                required
                                            />
                                        </div>
                                    </div>

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
                                            className="text-gray-400 font-bold hover:text-gray-900 underline"
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent default anchor behavior
                                                setIsForgotPasswordModalOpen(true); // Open the modal
                                            }}
                                        >
                                            Forgot my password?
                                        </a>
                                    </div>

                                    <div className="mt-8">
                                        <button
                                            type="submit"
                                            className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-105"
                                        >
                                            Access Dashboard
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        <div className="mt-6 flex items-center w-full space-x-2">
                            <span className="text-gray-400">
                                {isRegistering ? "Already have an account?" : "Don't have an account yet?"}{' '}
                            </span>
                            <a
                                href="#"
                                className="font-bold hover:text-gray-900 underline"
                                onClick={handleFormSwitch}
                            >
                                <span className="text-[#FF930A] underline font-bold hover:text-gray-900">
                                    {isRegistering ? "Back to Login" : "Sign Up Here"}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Modal for Forgot Password */}
            <ForgotPasswordModal
                isOpen={isForgotPasswordModalOpen}
                closeModal={() => setIsForgotPasswordModalOpen(false)}
                notify={notify}
            />
        </div>
    );
}