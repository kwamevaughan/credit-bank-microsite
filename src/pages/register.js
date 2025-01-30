import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify'; // Import toast here
import Select from 'react-select';
import { TrophyIcon } from '@heroicons/react/24/outline'; // Use the outline style from version 24
import { useRouter } from 'next/router'; // Import useRouter for redirection
import Link from 'next/link';
import Image from 'next/image';

const Register = ({ closeRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('');
    const [countries, setCountries] = useState([]);

    const router = useRouter(); // Initialize router
    const notify = (message) => toast(message);

    const generateUniqueCode = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if email exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            toast.error('This email is already registered.');
            return;
        }

        const uniqueCode = generateUniqueCode();

        // Insert the user data along with the initial 5 points
        const { error } = await supabase
            .from('users')
            .insert([{ name, email, phone_number: phoneNumber, country, referral_code: uniqueCode, points: 5 }]);

        if (error) {
            toast.error('Error: ' + error.message);
        } else {
            toast.success('User registered successfully! Your referral code: ' + uniqueCode);

            // Show another toast for redeeming points with the trophy icon
            toast.success(
                <div className="flex items-center">
                    <TrophyIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    You have redeemed 5 points!
                </div>
            );

            // Clear form fields
            setName('');
            setEmail('');
            setPhoneNumber('');
            setCountry('');

            // Fetch the newly created user to get the ID for redirection
            const { data: newUser, error: userFetchError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single(); // Fetch the newly created user data to retrieve the ID

            if (userFetchError || !newUser) {
                console.error('Error fetching user after registration:', userFetchError);
                toast.error('Failed to fetch user information after registration.');
                return;
            }

            // Store the token (if the ID is your token)
            localStorage.setItem('token', newUser.id); // Assuming newUser.id is what you use as token

            closeRegister(); // Close the registration form

            // Redirect to /dashboard after successful registration
            router.push('/dashboard'); // Use router.push to navigate to the dashboard
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
                    label: item.name, // Use country name for display
                    value: item.name, // Use country name as the value
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
            <p>Register to track your progress, earn points, and stand a chance to win the Diaspora Champions
                Challenge.</p>
            </div>
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Name</label>
                    <div
                        className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">

                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                    />
                </div>
                </div>

                {/* Email Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">E-mail</label>
                    <div
                        className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                        <input
                            type="email"
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                        />
                    </div>
                </div>

                    {/* Phone Number Field */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                    <div
                        className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">

                    <input
                            type="text"
                            placeholder="+254(012)-345-6789"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                        />
                    </div>
                </div>

                    {/* Country Dropdown */}
                <div className="mt-4">
                    <label className="text-gray-700 text-sm font-bold mb-2">Country</label>
                    <div
                        className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">

                    <Select
                            value={country ? {label: country, value: country} : null}
                            onChange={(selectedOption) => setCountry(selectedOption ? selectedOption.value : '')}
                            options={countries}
                            placeholder="Select your country"
                            isSearchable
                            isClearable
                            className="bg-transparent block w-full rounded"
                        />
                    </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-105"
                        >
                            Register
                        </button>
                    </div>
            </form>
        </div>
);
};

export default Register;
