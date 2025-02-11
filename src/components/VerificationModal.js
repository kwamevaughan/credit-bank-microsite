import React, { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Modal from './Modal';
import Image from 'next/image';
import { toast } from 'react-toastify';

const VerificationModal = ({ isOpen, onClose, mode }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedSession = localStorage.getItem('supabase_session');
        if (storedSession) {
            const session = JSON.parse(storedSession);
            setUserId(session.user?.id);
            console.log("Logged in User ID:", session.user?.id); // Log the user ID
        }
    }, [isOpen]);

    useEffect(() => {
        const checkUserDownloadStatus = async () => {
            if (!userId) return;

            const { data, error } = await supabase
                .from('user_activities')
                .select('*') // Select all columns to have full detail
                .eq('user_id', userId)
                .ilike('activity_type', 'Downloaded the Mobile App%');

            // Log the fetched activity log
            console.log("Fetched Activity Log:", data, error); // Log fetched activities

            if (data && data.length > 0) {
                setIsAppDownloaded(true);
            }
        };

        checkUserDownloadStatus();
    }, [userId]);


    const handleSubmit = async (e) => {
        e.preventDefault();



    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className={`p-6 ${
                    mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'
                } p-4 rounded-md `}
            >
                <div>
                    <h2
                        className={`${
                            mode === 'dark' ? 'text-white' : 'text-black'
                        } text-2xl font-semibold mb-4 text-center`}
                    >
                        Transaction Verification
                    </h2>
                </div>

                <p className={`text-center mb-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                    Please verify your transaction by entering the transaction ID received.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="mt-4">
                        <label className="text-gray-700 text-base font-bold mb-2 ">Name</label>
                        <div
                            className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
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
                        <div
                            className="flex items-center border border-[#FF930A] rounded focus:outline-none focus:border-fuchsia-900 hover:border-fuchsia-900 transition-all duration-700 ease-in-out">
                            <input
                                className="bg-transparent text-gray-700 py-2 px-4 block w-full rounded"
                                type="text"
                                placeholder="RIA-20250211-123456789"
                            />
                        </div>
                    </div>
                    <div className="flex mt-4 w-full space-x-4">

                    </div>


                    <div className="mt-8">
                        <button
                            type="submit"
                            className="bg-[#0CB4AB] text-white font-bold py-4 px-4 w-full rounded-lg transform transition-transform duration-700 ease-in-out hover:scale-105"
                        >
                            Submit for Verification
                        </button>
                    </div>
                </form>

            </div>
        </Modal>
    );
};

export default VerificationModal;