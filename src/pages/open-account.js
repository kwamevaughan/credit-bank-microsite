import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import useUserData from '../hooks/useUserData';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';
import useAccountOpening from '@/hooks/useAccountOpening';
import { CheckIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const OpenAccount = () => {
    const router = useRouter();
    const { token } = useUser();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { handleSignOut } = useSignOut();
    const { mode, toggleMode } = useTheme();
    const notify = (message) => toast(message);
    const userData = useUserData(token);
    const {
        accountType,
        setAccountType,
        name,
        setName,
        referrer,
        setReferrer,
        handleSubmit,
        referralCodeValid,
        setReferralCodeValid,
        isSelfReferral,
        isValidating,
        referrerName,
        handleReferralCodeChange
    } = useAccountOpening(token, userData?.userName || '');

    // Function to check if referral code is valid
    const validateReferralCode = async (code) => {
        if (!code) {
            setReferralCodeValid(true); // Allow empty codes
            return;
        }

        // Check if the referral code exists and does not belong to the logged-in user
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .eq('referral_code', code)
                .single(); // assuming 'referral_code' is the column storing referral codes

            if (error) throw error;

            // Check if referral code belongs to the logged-in user
            if (data && data.id !== userData.id) {
                setReferralCodeValid(true); // Valid referral code
            } else {
                setReferralCodeValid(false); // Referral code belongs to the logged-in user
            }
        } catch (error) {
            setReferralCodeValid(false); // Referral code is invalid
            console.error('Error validating referral code:', error.message);
        }
    };

    useEffect(() => {
        // Only validate referral code if it's changed
        if (referrer) {
            validateReferralCode(referrer);
        }
    }, [referrer]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f1eb]'}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                onLogout={handleSignOut}
                userData={userData}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    token={token}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={handleSignOut}
                    toggleMode={toggleMode}
                    userData={userData}
                />

                <main
                    className={`flex-1 p-4 md:p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >

                    <div className="space-y-8 mb-8">
                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-4 md:px-8 hover:shadow-md transition-all duration-300 ease-in-out`}
                        >
                            <div
                                className={`px-4 space-y-4 mb-8 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                <h2 className={`text-teal-500 text-lg sm:text-4xl md:text-3xl font-extrabold ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                                    Open an Account
                                </h2>
                                <p className={`text-base pb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Credit Bank offers tailored wealth management solutions to suit your needs. With
                                    the Nyumbani Diaspora Challenge, you can earn points for opening an account or
                                    referring a friend to open one.
                                </p>

                                <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
                                    <div
                                        className="flex flex-col border border-[#ff930a] p-4 rounded-lg hover:shadow-lg hover:translate-y-[-8px] transform transition-all duration-300 ease-in-out w-full md:w-[48%] flex-grow">
                                        <div className="flex items-center mb-2">
                                            <ShieldCheckIcon className="w-6 h-6 text-teal-500 mr-2"/>
                                            <p className={`font-extrabold text-base ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                CDSC Account
                                            </p>
                                        </div>
                                        <span
                                            className={`text-base pb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Open a CDSC account if you have a Nyumbani Diaspora Account and wish to buy and sell listed stocks at the Nairobi Securities Exchange.
            </span>

                                        <div className="flex-grow"></div>

                                        <a href="https://creditbank.co.ke/nse-cdsc-accounts/" target="_blank"
                                           rel="noopener noreferrer">
                                            <button
                                                className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                                Open a CDSC Account
                                            </button>
                                        </a>
                                    </div>

                                    <div
                                        className="flex flex-col border border-[#ff930a] p-4 rounded-lg hover:shadow-lg hover:translate-y-[-8px] transform transition-all duration-300 ease-in-out w-full md:w-[48%] flex-grow">
                                        <div className="flex items-center mb-2">
                                            <ShieldCheckIcon className="w-6 h-6 text-teal-500 mr-2"/>
                                            <p className={`font-extrabold text-base ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Fixed Deposit Account
                                            </p>
                                        </div>
                                        <span
                                            className={`text-base pb-4 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                This investment account gives you the opportunity to grow your wealth and meet your financial goals in an assured manner. You can enjoy a competent fixed interest rate on your deposits until a given maturity date.
            </span>

                                        <div className="flex-grow"></div>

                                        <a href="https://creditbank.co.ke/fixed-call-deposit-account/" target="_blank"
                                           rel="noopener noreferrer">
                                            <button
                                                className="bg-[#0cb4ab] hover:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg">
                                                Open a Fixed Account
                                            </button>
                                        </a>
                                    </div>
                                </div>

                                <p className="pt-4 text-lg font-bold">Already opened an account? Fill in your details to
                                    redeem your
                                    points.</p>
                            </div>

                            <div className="flex flex-col justify-center px-4 space-y-4">
                                {/* Form with 3/4 width */}
                                <form className="space-y-6 w-full mx-auto" onSubmit={handleFormSubmit}>
                                    {/* Select Account Type */}
                                    <div>
                                        <label htmlFor="account-type" className="block font-bold text-lg">
                                            Select Account Type
                                        </label>
                                        <select
                                            id="account-type"
                                            name="account-type"
                                            onChange={(e) => setAccountType(e.target.value)} // Bind onChange to update state
                                            className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                        >
                                            <option value="">Choose an option</option>
                                            <option value="nyumbani">Nyumbani Diaspora Account</option>
                                            <option value="cdsc">CDSC Account</option>
                                            <option value="fixed-deposit">Fixed Deposit Account</option>
                                        </select>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block font-bold text-lg">
                                            Name (as it appears on your ID)
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={name}  // Just use the state value directly
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                            required
                                        />
                                    </div>

                                    {/* Referral Code */}
                                    <div className="relative">
                                        <label htmlFor="referrer" className="block font-bold text-lg">
                                            Referral Code (optional)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="referrer"
                                                name="referrer"
                                                value={referrer}
                                                onChange={handleReferralCodeChange}
                                                placeholder="Enter referral code (if any)"
                                                className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                                                    mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'
                                                } ${!referralCodeValid ? 'border-red-500' : referrer ? 'border-green-500' : ''}`}
                                            />
                                            {/* Validation icon */}
                                            {referrer && !isValidating && (
                                                <div
                                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                                                        referralCodeValid ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                    {referralCodeValid ? (
                                                        <CheckIcon className="inline h-5 w-5"/>
                                                    ) : (
                                                        <XMarkIcon className="inline h-5 w-5"/>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Validation message */}
                                        {referrer && !isValidating && (
                                            <p className={`mt-1 text-sm ${referralCodeValid ? 'text-green-500' : 'text-red-500'}`}>
                                                {isSelfReferral
                                                    ? "You cannot use your own referral code"
                                                    : referralCodeValid && referrerName
                                                        ? `Found a match for: ${referrerName}`
                                                        : "Please enter a valid referral code"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div
                                        className="flex flex-col md:flex-row pt-4 gap-6 w-full justify-between items-center">
                                        <span className="flex-grow w-full md:w-3/4">
                                            Your points will be updated after our 24-hour verification process.
                                        </span>
                                        <button
                                            type="submit"
                                            className={`w-full md:w-1/2 py-4 px-4 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${mode === 'dark' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                                        >
                                            Redeem Points
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OpenAccount;
