import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify'; // Import toast here
import Select from 'react-select';
import { TrophyIcon } from '@heroicons/react/24/outline'; // Use the outline style from version 24
import { useRouter } from 'next/router'; // Import useRouter for redirection

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
            <h1 className="text-2xl font-bold mb-4">User Registration</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                {/* Email Field */}
                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                {/* Phone Number Field */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                {/* Country Dropdown */}
                <div className="mb-4">
                    <Select
                        value={country ? { label: country, value: country } : null}
                        onChange={(selectedOption) => setCountry(selectedOption ? selectedOption.value : '')}
                        options={countries}
                        placeholder="Select your country"
                        isSearchable
                        isClearable
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-orange-600 text-white font-bold py-2 px-4 w-full rounded-2xl transform transition-transform duration-700 ease-in-out hover:scale-105"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
