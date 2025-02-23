import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Link from 'next/link';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import useUserData from '../hooks/useUserData';
import { useUser } from '@/context/UserContext';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useSignOut from '@/hooks/useSignOut';
// import useCustomerData from '@/hooks/useCustomerData';

const SendRemittances = () => {
    const router = useRouter();
    const { token, setToken } = useUser();
    const userData = useUserData(token);
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { mode, toggleMode } = useTheme();
    const notify = (message) => toast(message);
    const { handleSignOut } = useSignOut();
    // const { customers, error, refetchCustomers, setCustomers } = useCustomerData(notify);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');

    // Check if user data is available
    useEffect(() => {
        if (userData && userData.userName) {
            setUserName(userData.userName);
        }
    }, [token, router, userData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;
        setLoading(true);
        setFeedbackMessage('Please wait while we verify the transaction ID...');

        if (!transactionId) {
            setFeedbackMessage('Please enter a valid transaction ID.');
            setLoading(false);
            return;
        }

        // Extract actual user ID from token (as our hook doesn't return the raw ID)
        if (!token) {
            setFeedbackMessage('User data not available. Please ensure you are logged in and try again.');
            setLoading(false);
            return;
        }

        // Use token as the ID since that's what you passed to the hook
        const userId = token;

        // Normalize the transactionId to lowercase for case-insensitive comparison
        const normalizedTransactionId = transactionId.toLowerCase();

        // Check if the transaction has already been redeemed
        const { data: transactionData, error: transactionError } = await supabase
            .from('transaction_verification')
            .select('status, transaction_id, redeemed')
            .ilike('transaction_id', normalizedTransactionId) // Use ilike for case-insensitive match
            .single();

        if (transactionError || !transactionData) {
            if (transactionError?.code === 'PGRST116') {
                setFeedbackMessage(
                    `Unfortunately, we couldn't match the transaction ID "${transactionId}" with our records. Kindly double-check and try again.`
                );
            } else {
                setFeedbackMessage('Error verifying transaction. Please try again later.');
            }
            setLoading(false);
            return;
        }

        if (transactionData.redeemed) {
            setFeedbackMessage(
                `The transaction ID "${transactionId}" you entered has already been redeemed for points. Please review the details and try again if necessary.`
            );
            setLoading(false);
            return;
        }

        if (transactionData.status === 'Approved') {
            const { data: userPointsData, error: userError } = await supabase
                .from('users')
                .select('points, actions_completed')
                .eq('id', userId)
                .single();

            if (userError || !userPointsData) {
                setFeedbackMessage('Error fetching your points data. Please try again later.');
                setLoading(false);
                return;
            }

            const updatedPoints = userPointsData.points + 200;

            const { error: updateError } = await supabase
                .from('users')
                .update({ points: updatedPoints })
                .eq('id', userId);

            if (updateError) {
                setFeedbackMessage('Error updating points. Please try again later.');
                setLoading(false);
                return;
            }

            const { error: updateRedeemedError } = await supabase
                .from('transaction_verification')
                .update({ redeemed: true })
                .eq('transaction_id', transactionId);

            if (updateRedeemedError) {
                setFeedbackMessage('Error marking transaction as redeemed. Please try again later.');
                setLoading(false);
                return;
            }

            const { error: activityError } = await supabase
                .from('user_activities')
                .insert([
                    {
                        user_id: userId,
                        points: 200,
                        activity_type: 'Sent remittance',
                        platform_url: 'RIA Money Transfer',
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (activityError) {
                setFeedbackMessage('Error logging user activity. Please try again later.');
                setLoading(false);
                return;
            }

            const { error: incrementActionsError } = await supabase
                .from('users')
                .update({ actions_completed: userPointsData.actions_completed + 1 })
                .eq('id', userId);

            if (incrementActionsError) {
                setFeedbackMessage('Error incrementing actions completed. Please try again later.');
                setLoading(false);
                return;
            }

            setFeedbackMessage(
                `Thank you for submitting the transaction ID "${transactionId}". The transaction has been verified, and 200 points have been added to your account. Good luck!`
            );

            notify('Congratulations 🎉 You have been awarded 200 points. Good luck!');

            setTransactionId(''); // Reset the transaction ID input
        } else if (transactionData.status === 'Pending') {
            setFeedbackMessage(
                `Thanks for submitting the transaction ID "${transactionId}" for verification. The transaction is pending approval. Kindly check back in an hour. Once verified, 200 points will be added to your existing points. Good luck!`
            );
        }

        setLoading(false);
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
                                    Send Remittances
                                </h2>

                                <p className={`text-base  ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>

                                    Ria Money Transfer enables Nyumbani Diaspora Account holders to send funds directly
                                    and instantly to their loved ones.

                                    Even people who don't have an account can send money to others for collection at any
                                    Credit Bank Branch.
                                </p>
                                <p className={`text-base  ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>

                                    With the Nyumbani Diaspora Challenge, <span className="text-teal-600">earn 200 points</span> for
                                    every <span className="text-teal-600">Ksh10,000</span> transferred. <a
                                    href="https://www.riamoneytransfer.com/en-us/send-money/" target="_blank"
                                    rel="noopener noreferrer" className="text-teal-600 underline">Visit RIA Money
                                    Transfer </a> today.
                                </p>

                                <p className={`text-base  ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Already sent or received a remittance? Fill in your details to redeem your points.
                                </p>

                                <p className=" font-bold">
                                    <span className="underline">Disclaimer:</span> Earn 200 points when you send or
                                    receive a minimum of Ksh10,000 to a
                                    Credit Bank account or to a Branch for collection .
                                </p>


                            </div>

                            <div className="flex flex-col justify-center px-4 space-y-4">
                                {userData && userData.userName ? (
                                    <form className="space-y-6 w-full mx-auto" onSubmit={handleSubmit}>
                                        {/* Name */}
                                        <div>
                                            <label htmlFor="name" className="block font-bold text-lg">
                                                Sender's Name (as it appears on your ID)
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                            />
                                        </div>

                                        {/* Transaction Code */}
                                        <div>
                                            <label htmlFor="transactioncode" className="block font-bold text-lg">
                                                Transaction Code/Pin
                                            </label>
                                            <input
                                                type="text"
                                                id="transactioncode"
                                                name="transactioncode"
                                                placeholder="Enter transaction code"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                className={`mt-1 block w-full p-4 border rounded-md shadow-sm sm:text-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${mode === 'dark' ? 'bg-[#2d3748] text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div
                                            className="flex flex-col md:flex-row pt-4 gap-6 w-full justify-between items-center">
    <span className="flex-grow w-full md:w-3/4">
        Your points will be updated after our 24-hour verification process.
    </span>
                                            <button
                                                type="submit"
                                                disabled={loading} // Disable button while loading
                                                className={`w-full md:w-1/2 py-4 px-4 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${mode === 'dark' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-teal-500 text-white hover:bg-teal-600'}`}
                                            >
                                                {loading ? 'Processing...' : 'Redeem Points'}
                                            </button>
                                        </div>

                                    </form>
                                ) : (
                                    <div className="flex justify-center items-center py-8">
                                        <p className="text-lg">Loading user data... If this persists, please try logging
                                            in again.</p>
                                    </div>
                                )}

                                {/* Feedback Message */}
                                {feedbackMessage && (
                                    <div
                                        className={`mt-6 p-4 border rounded-lg h-32 overflow-y-auto ${
                                            mode === 'dark'
                                                ? 'bg-gray-800 text-gray-200 border-gray-600' // Dark mode styles
                                                : 'bg-gray-100 text-gray-700 border-gray-300' // Light mode styles
                                        }`}
                                    >
                                        <p>{feedbackMessage}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SendRemittances;