import bcrypt from 'bcryptjs';
import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';
import { FaRegEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoKeyOutline } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '../layouts/footer';
import { useRouter } from 'next/router';
import ReCAPTCHA from 'react-google-recaptcha'; // Import ReCAPTCHA component

export default function Verification() {
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaValue, setRecaptchaValue] = useState(null);

    const router = useRouter();
    const notify = (message) => toast(message);

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            if (session && session.user && session.user.username) {
                router.push('/transaction-verification');
            }
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!recaptchaValue) {
            toast.error("Please verify that you're not a robot.");
            return;
        }

        const toastId = toast.info('Authenticating... Please wait.', {
            autoClose: false,
            position: "top-center",
            closeButton: false,
            hideProgressBar: false,
            draggable: false,
        });

        const { data, error, count } = await supabase
            .from('client_users')
            .select('id, username, password, name')
            .eq('username', loginUsername)
            .single(); // Use single to get only one user

        if (error) {
            console.log('Error message:', error.message);
            toast.update(toastId, {
                render: 'An error occurred while trying to log in. Please try again.',
                type: "error",
                autoClose: 5000,
            });
            return;
        }

        if (!data) {
            toast.update(toastId, {
                render: 'Invalid username or password. Please check your credentials.',
                type: "error",
                autoClose: 5000,
            });
            return;
        }

        const user = data;
        const isPasswordMatch = await bcrypt.compare(loginPassword, user.password);

        if (!isPasswordMatch) {
            toast.update(toastId, {
                render: 'Invalid username or password. Please check your credentials.',
                type: "error",
                autoClose: 5000,
            });
            return;
        }

        toast.update(toastId, {
            render: `Authenticated! Welcome, ${user.name}`,
            type: "success",
            autoClose: 3000,
            className: 'shadow-lg rounded-lg p-4',
            closeButton: true,
        });

        // Store session information correctly
        const session = {
            user: {
                id: user.id, // Store the user's id
                username: user.username,
                name: user.name,
            },
            access_token: user.username,
        };

        localStorage.setItem('supabase_session', JSON.stringify(session));

        if (rememberMe) {
            localStorage.setItem('loginUsername', loginUsername);
            localStorage.setItem('loginPassword', loginPassword);
        } else {
            localStorage.removeItem('loginUsername');
            localStorage.removeItem('loginPassword');
        }

        router.push('/transaction-verification');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const onRecaptchaChange = (value) => {
        setRecaptchaValue(value);
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
                        <div className="pb-10">
                            <Link href="/">
                                <Image src="/assets/images/logo.svg" alt="Logo" width={300} height={50} />
                            </Link>
                        </div>
                        <div className="pb-2">
                            <p className="text-3xl leading-10 mobile:text-2xl pb-2">Transaction Verification Portal</p>
                            <p>Login to upload and verify customer transaction ID</p>
                        </div>

                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <form onSubmit={handleLogin}>
                            <div className="mt-4">
                                <label className="text-gray-700 text-sm font-bold mb-2">Username</label>
                                <div className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                                    <input
                                        className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                                        type="text"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        placeholder="Enter username"
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
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="Enter Password"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Google reCAPTCHA */}
                            <div className="mt-4">
                                <ReCAPTCHA
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                                    onChange={onRecaptchaChange}
                                />
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
                            </div>

                            <div className="mt-8">
                                <button
                                    type="submit"
                                    className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-105"
                                >
                                    Login to Portal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}