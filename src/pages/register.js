import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify'; // Import toast here
import Select from 'react-select';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Import the checkmark and X icons
import { useRouter } from 'next/router'; // Import useRouter for redirection
import Link from 'next/link';
import Image from 'next/image';

const Register = ({ closeRegister, referralCode: initialReferralCode }) => { // Accept referralCode as a prop
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('');
    const [referralCode, setReferralCode] = useState(initialReferralCode || ''); // Set initial state from prop
    const [referralCodeValid, setReferralCodeValid] = useState(null); // Referral code validity state
    const [countries, setCountries] = useState([]);

    const router = useRouter();
    const notify = (message) => toast(message);

    // Automatically check referral code validity when it changes
    useEffect(() => {
        if (referralCode) {
            checkReferralCode(referralCode); // Validate the pre-filled referral code
        }
    }, [referralCode]); // Dependency on referralCode

    const generateUniqueCode = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const checkReferralCode = async (code) => {
        if (!code) {
            setReferralCodeValid(null);
            return;
        }

        // Check if the referral code exists in the database
        const { data: referredUser, error } = await supabase
            .from('users')
            .select('referral_code')
            .eq('referral_code', code)
            .single();

        if (error || !referredUser) {
            setReferralCodeValid(false); // Invalid code
        } else {
            setReferralCodeValid(true); // Valid code
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pleaseWaitToast = toast.loading("Please wait...", { autoClose: false });

        try {
            // Check if email exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (existingUser) {
                toast.update(pleaseWaitToast, {
                    render: 'This email is already registered.',
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000,
                });
                return;
            }

            // Generate a new referral code for the new user
            const uniqueCode = generateUniqueCode();
            let referredUserPoints = 0; // Points to add to the referrer

            if (referralCodeValid === true) {
                // Update the referrer's points
                const { data: referredUser } = await supabase
                    .from('users')
                    .select('points')
                    .eq('referral_code', referralCode)
                    .single();

                referredUserPoints = referredUser?.points + 15 || 0; // Adding points to the referrer
            }

            // Insert the new user data
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    name,
                    email,
                    phone_number: phoneNumber,
                    country,
                    referral_code: uniqueCode,
                    points: 0 // New user gets 0 points
                }]);

            if (insertError) {
                toast.update(pleaseWaitToast, {
                    render: `Error: ${insertError.message}`,
                    type: 'error',
                    isLoading: false,
                    autoClose: 5000,
                });
                return;
            }

            // Update the referrer’s points if there is a valid referral code
            if (referredUserPoints > 0) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ points: referredUserPoints })
                    .eq('referral_code', referralCode);

                if (updateError) {
                    toast.update(pleaseWaitToast, {
                        render: `Error updating referrer’s points: ${updateError.message}`,
                        type: 'error',
                        isLoading: false,
                        autoClose: 5000,
                    });
                } else {
                    toast.update(pleaseWaitToast, {
                        render: 'Referrer has been awarded 15 points!',
                        type: 'success',
                        isLoading: false,
                        autoClose: 5000,
                    });
                }
            }

            toast.update(pleaseWaitToast, {
                render: 'User registered successfully! Your referral code: ' + uniqueCode,
                type: 'success',
                isLoading: false,
                autoClose: 5000,
            });

            // Clear form fields
            setName('');
            setEmail('');
            setPhoneNumber('');
            setCountry('');
            setReferralCode(''); // Clear referral code

            // Fetch the newly created user
            const { data: newUser, error: userFetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userFetchError || !newUser) {
                console.error('Error fetching user after registration:', userFetchError);
                toast.error('Failed to fetch user information after registration.');
                return;
            }

            // Create session object
            const session = {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                },
                access_token: newUser.id,  // If you have an actual access token, use that
            };

            // Store the session object in localStorage
            localStorage.setItem('supabase_session', JSON.stringify(session));

            closeRegister(); // Close the registration form

            // Redirect to /dashboard after successful registration
            router.push('/dashboard');

        } catch (error) {
            toast.update(pleaseWaitToast, {
                render: 'An unexpected error occurred. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        }
    };

    useEffect(() => {
        // Fetch country list from the JSON file
        const fetchCountries = async () => {
            try {
                const response = await fetch('/assets/misc/countries.json');
                const data = await response.json();

                // Map countries to the format required by react-select
                const countryOptions = data.map((item) => ({
                    label: item.name,
                    value: item.name,
                }));
                setCountries(countryOptions);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    return (
        <div className="">
            <div className="pb-10">
                <Link href="/">
                    <Image
                        src="/assets/images/logo.svg"
                        alt="Logo"
                        width={300}
                        height={50}
                    />
                </Link>
            </div>

            <div className="pb-2">
                <h1 className="text-2xl font-bold pb-2">User Registration</h1>
                <p>Register to track your progress, earn points, and stand a chance to win the Diaspora Champions Challenge.</p>
            </div>
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-transparent text-gray-700 border border-[#FF930A] rounded py-2 px-4 block w-full"
                    />
                </div>

                {/* Email Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">E-mail</label>
                    <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-transparent text-gray-700 border border-[#FF930A] rounded py-2 px-4 block w-full"
                    />
                </div>

                {/* Phone Number Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                    <input
                        type="text"
                        placeholder="+254(012)-345-6789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="bg-transparent text-gray-700 border border-[#FF930A] rounded py-2 px-4 block w-full"
                    />
                </div>

                {/* Country Dropdown */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Country</label>
                    <Select
                        value={country ? {label: country, value: country} : null}
                        onChange={(selectedOption) => setCountry(selectedOption ? selectedOption.value : '')}
                        options={countries}
                        placeholder="Select your country"
                        isSearchable
                        isClearable
                        className="bg-transparent block w-full"
                    />
                </div>

                {/* Referral Code Field */}
                <div className="mt-4 relative">
                    <label className="text-gray-700 text-sm font-bold mb-2">Referral Code (Optional)</label>
                    <input
                        type="text"
                        placeholder="Enter referral code (if any)"
                        value={referralCode}
                        onChange={(e) => {
                            setReferralCode(e.target.value);
                            checkReferralCode(e.target.value);
                        }}
                        className="bg-transparent text-gray-700 border border-[#FF930A] rounded py-2 px-4 block w-full pr-12"
                    />
                    {/* Referral Code Validation Feedback */}
                    {referralCodeValid !== null && (
                        <div
                            className={`absolute right-3 top-2/3 transform -translate-y-1/2 text-sm ${referralCodeValid ? 'text-green-500' : 'text-red-500'}`}>
                            {referralCodeValid ? (
                                <>Valid <CheckIcon className="inline h-5 w-5"/></>
                            ) : (
                                <>Invalid <XMarkIcon className="inline h-5 w-5"/></>
                            )}
                        </div>
                    )}
                </div>


                {/* Submit Button */}
                <div className="mt-8">
                    <button
                        type="submit"
                        className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg"
                    >
                        Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Register;