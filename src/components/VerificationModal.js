import React, { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Modal from './Modal';

const VerificationModal = ({ isOpen, onClose, mode, notify }) => {
    const [userId, setUserId] = useState(null);
    const [name, setName] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setUserId(session.user?.id);
        }
    }, [isOpen]);

    useEffect(() => {
        if (userId) {
            // Fetch the logged-in user's name from Supabase when userId is set
            const fetchUserName = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Error fetching user name:', error);
                    return;
                }

                if (data) {
                    setName(data.name); // Set the user's name to the state
                }
            };

            fetchUserName();
        }
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFeedbackMessage('Please wait while we verify the transaction ID...');

        // Check if the transaction has already been redeemed
        const { data: transactionData, error: transactionError } = await supabase
            .from('transaction_verification')
            .select('status, transaction_id, redeemed')
            .eq('transaction_id', transactionId)
            .single(); // Use single() to ensure we only get one result

        if (transactionError) {
            // Handle the specific PGRST116 error for no results
            if (transactionError.code === 'PGRST116') {
                // No results found (transaction not in the database)
                setFeedbackMessage(
                    <span>Hello <span className="capitalize">{name}</span>, unfortunately, we couldn't match the transaction ID "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" with our records. Kindly double-check and try again.
                    </span>
                );
            } else {
                // Generic error handling for other types of errors
                console.error(transactionError); // log the error for debugging
                setFeedbackMessage('Error verifying transaction. Please try again later.');
            }
            setLoading(false);
            return;
        }

        if (!transactionData) {
            // Fallback for when no transaction data is returned (this should not be necessary after handling the PGRST116 error)
            setFeedbackMessage(
                <span>Hello <span className="capitalize">{name}</span>, unfortunately, we couldn't match the transaction ID "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" with our records. Kindly double-check and try again.
                </span>
            );
            setLoading(false);
            return;
        }

        // Check if the transaction has already been redeemed
        if (transactionData.redeemed) {
            setFeedbackMessage(
                <span>
            Hello <span className="capitalize">{name}</span>, the transaction ID "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" you entered has already been redeemed for points. Please review the details and try again if necessary.
        </span>
            );
            setLoading(false);
            return;
        }

        // If transaction is approved and not redeemed yet
        if (transactionData.status === 'Approved') {
            // Fetch current points of the user
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('points, actions_completed')
                .eq('id', userId)
                .single();

            if (userError) {
                setFeedbackMessage('Error fetching current points. Please try again later.');
                setLoading(false);
                return;
            }

            // Increment points
            const updatedPoints = userData.points + 200;

            // Update the user's points with the incremented value
            const { error: updateError } = await supabase
                .from('users')
                .update({ points: updatedPoints })
                .eq('id', userId);

            if (updateError) {
                setFeedbackMessage('Error updating points. Please try again later.');
                setLoading(false);
                return;
            }

            // Mark the transaction as redeemed
            const { error: updateRedeemedError } = await supabase
                .from('transaction_verification')
                .update({ redeemed: true })
                .eq('transaction_id', transactionId);

            if (updateRedeemedError) {
                setFeedbackMessage('Error marking transaction as redeemed. Please try again later.');
                setLoading(false);
                return;
            }

            // Log the activity in the user_activities table
            const { error: activityError } = await supabase
                .from('user_activities')
                .insert([
                    {
                        user_id: userId,
                        points: 200,
                        activity_type: 'Sent money',
                        platform_url: 'RIA Money Transfer',
                        created_at: new Date().toISOString(), // Use current time
                    },
                ]);

            if (activityError) {
                setFeedbackMessage('Error logging user activity. Please try again later.');
                setLoading(false);
                return;
            }

            // Increment the actions_completed counter in the users table
            const { error: incrementActionsError } = await supabase
                .from('users')
                .update({
                    actions_completed: userData.actions_completed + 1, // Increment the actions completed by 1
                })
                .eq('id', userId);

            if (incrementActionsError) {
                setFeedbackMessage('Error incrementing actions completed. Please try again later.');
                setLoading(false);
                return;
            }

            setFeedbackMessage(
                <span>Hello <span className="capitalize">{name}</span>, thank you for submitting the transaction ID! "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" The transaction ID has been verified, and 200 points have been added to your account. Good luck!
                </span>
            );

            // Show a toast message
            notify('Congratulations 🎉 You have been awarded 200 points. Good luck!');

            // Clear the transaction ID field after submission
            setTransactionId('');  // Reset the transaction ID input
        } else if (transactionData.status === 'Pending') {
            setFeedbackMessage(
                <span>Hello <span className="capitalize">{name}</span>, Thanks for submitting the transaction ID "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" for verification. The transaction is pending approval. Kindly check back in an hour. Once verified, 200 points will be added to your existing points. Good luck!
                </span>
            );
        }

        setLoading(false);
    };



    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className={`p-6 ${mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'} p-4 rounded-md relative w-1/2`}  // Fixed width
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-4xl text-gray-500 hover:text-gray-700"
                    aria-label="Close Modal"
                >
                    &times;
                </button>

                <div>
                    <h2 className={`${mode === 'dark' ? 'text-white' : 'text-black'} text-3xl font-semibold mb-4 text-center`}>
                        Transaction Verification
                    </h2>
                </div>

                <p className={`text-center mb-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                    Please verify your transaction by entering the transaction ID received.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label
                            className={`text-base font-bold mb-2 ${
                                mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}
                        >
                            Name
                        </label>
                        <div
                            className={`flex items-center border rounded focus:outline-none transition-all duration-300 ease-in-out ${
                                mode === 'dark'
                                    ? 'border-gray-600 text-gray-200 hover:border-teal-500 focus:border-teal-500' // Dark mode styles
                                    : 'border-[#FF930A] text-gray-700 hover:border-teal-900 focus:border-teal-900' // Light mode styles
                            }`}
                        >
                            <input
                                className={`bg-transparent py-2 px-4 block w-full rounded cursor-default ${
                                    mode === 'dark' ? 'text-gray-200' : 'text-gray-700' // Adjust text color
                                }`}
                                type="text"
                                placeholder="Enter full name as appears on your ID"
                                value={name}
                                readOnly
                            />
                        </div>
                    </div>


                    <div className="mt-4">
                        <label
                            className={`text-base font-bold mb-2 ${
                                mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}
                        >
                            Transaction ID
                        </label>
                        <div
                            className={`flex items-center border rounded focus:outline-none transition-all duration-300 ease-in-out ${
                                mode === 'dark'
                                    ? 'border-gray-600 text-gray-200 hover:border-teal-500 focus:border-teal-500' // Dark mode styles
                                    : 'border-[#FF930A] text-gray-700 hover:border-teal-900 focus:border-teal-900' // Light mode styles
                            }`}
                        >
                            <input
                                className={`bg-transparent py-2 px-4 block w-full rounded ${
                                    mode === 'dark' ? 'text-gray-200' : 'text-gray-700' // Adjust text color
                                }`}
                                type="text"
                                placeholder="RIA-20250211-123456789"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                required
                            />
                        </div>
                    </div>


                    <div className="mt-8">
                        <button
                            type="submit"
                            className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-all duration-300 ease-in-out hover:bg-[#0A8E8A]"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Submit for Verification'}
                        </button>

                    </div>
                </form>

                {/* Feedback Message (Fixed Height, Scrollable) */}
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
        </Modal>
    );
};

export default VerificationModal;
