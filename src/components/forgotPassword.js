import React, { useState, useEffect } from 'react';

// Forgot Password Modal
const ForgotPasswordModal = ({ isOpen, closeModal, notify }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(''); // To show form errors

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Reset any previous errors
        notify('Please wait...');

        const response = await fetch('/api/sendPasswordReset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
            notify('A referral code has been sent to your email.');
            setEmail(''); // Clear the input after success
        } else {
            setError(data.error || 'An error occurred. Please try again.');
        }
    };

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') closeModal();
        };

        window.addEventListener('keydown', handleEscKey);

        return () => window.removeEventListener('keydown', handleEscKey);
    }, [closeModal]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={closeModal} // Close modal when clicking outside
        >
            <div
                className="bg-white rounded-lg p-6 w-96 shadow-lg relative"
                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
                {/* Close Button */}
                <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black focus:outline-none"
                >
                    X
                </button>

                <div className="mb-4">
                    <h2 className="text-xl font-bold">Forgot Password</h2>
                    <span className="text-sm text-gray-600">Enter your email to receive your password reset link.</span>
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-500 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleForgotPassword}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className={`w-full py-2 rounded focus:outline-none transition ${
                            loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0CB4AB] hover:bg-teal-600'
                        } text-white`} // Always white text
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin border-t-2 border-white w-6 h-6 rounded-full mr-2" />
                                <span>Please wait...</span>
                            </div>
                        ) : (
                            'Send Referral Code'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
