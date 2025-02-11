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
                setFeedbackMessage(`Hello ${name}, unfortunately, we couldn't match the transaction ID with our records. Kindly double-check and try again.`);
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
            setFeedbackMessage(`Hello ${name}, unfortunately, we couldn't match the transaction ID with our records. Kindly double-check and try again.`);
            setLoading(false);
            return;
        }

        // Check if the transaction has already been redeemed
        if (transactionData.redeemed) {
            setFeedbackMessage(
                <span>
                Hello {name}, the transaction ID "<span style={{ fontWeight: 'bold', color: '#0eb4ab' }}>{transactionId}</span>" you've entered has already been redeemed for points. Please check the details and try again if needed.
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

            setFeedbackMessage(`Hello ${name}, thank you for submitting the transaction ID! The transaction ID has been verified, and 200 points have been added to your account. Good luck!`);

            // Show a toast message
            notify('Congratulations 🎉 You have been awarded 200 points. Good luck!');
        } else if (transactionData.status === 'Pending') {
            setFeedbackMessage('Hello, Thanks for submitting the transaction ID for verification. The transaction is pending approval. Kindly check back in an hour. Once verified, 200 points will be added to your existing points. Good luck!');
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
                        <label className="text-gray-700 text-base font-bold mb-2">Name</label>
                        <div className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                            <input
                                className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                                type="text"
                                placeholder="Enter full name as appears on your ID"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-gray-700 text-base font-bold mb-2">Transaction ID</label>
                        <div className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                            <input
                                className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                                type="text"
                                placeholder="RIA-20250211-123456789"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-105"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>

                {/* Feedback Message (Fixed Height, Scrollable) */}
                {feedbackMessage && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-100 text-gray-700 h-32 overflow-y-auto">
                        <p>{feedbackMessage}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default VerificationModal;
