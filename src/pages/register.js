import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify'; // Import toast here
import Select from 'react-select';

const Register = ({ closeRegister }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [country, setCountry] = useState('');
    const [countries, setCountries] = useState([]);

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

        const { error } = await supabase
            .from('users')
            .insert([{ name, email, phone_number: phoneNumber, country, referral_code: uniqueCode }]);

        if (error) {
            toast.error('Error: ' + error.message);
        } else {
            toast.success('User registered successfully! Your referral code: ' + uniqueCode);
            setName('');
            setEmail('');
            setPhoneNumber('');
            setCountry('');
            closeRegister(); // Close the registration form
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
