import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

const DangerZone = ({ mode, setShowDeleteModal, handleDeleteAccount }) => {
    return (
        <>
            <div className="flex flex-col justify-between gap-y-2 mb-8">
                <h3 className={`font-semibold text-xl ${mode === 'dark' ? 'text-white' : 'text-black'} mb-4`}>Delete Account?</h3>
                <p className={`text-gray-500 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Deleting your account is <span className="text-red-600">permanent</span>,
                    and there’s no way to reverse it.
                </p>
                <p className={`text-gray-500 ${mode === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    All your accumulated points in the competition, including quiz scores,
                    referral points, leaderboard position and more, will be erased. Please make
                    sure you’re certain before proceeding.
                </p>
            </div>
            <button
                onClick={() => setShowDeleteModal(true)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
                    ${mode === 'dark'
                    ? 'bg-[#ef4547] text-white hover:bg-[#c0392b]'
                    : 'bg-[#ef4547] text-white hover:bg-red-600'}`}
            >
                <TrashIcon className="h-5 w-5 mr-2 text-white" />
                Delete Account
            </button>
        </>
    );
};

export default DangerZone;
