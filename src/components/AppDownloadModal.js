import React, { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Modal from './Modal';
import Image from 'next/image';
import { toast } from 'react-toastify';

const AppDownloadModal = ({ isOpen, onClose, mode }) => {
    const [userId, setUserId] = useState(null);
    const [isAppDownloaded, setIsAppDownloaded] = useState(false);

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

    const handleDownloadApp = async (platform, url) => {
        if (!userId) {
            toast.error('User ID is not defined. Please log in again.');
            return;
        }

        // Show a "Please Wait" toast
        const waitToastId = toast.loading('Please wait while we check your download status...');

        // Check if user has already downloaded an app
        const { data, error } = await supabase
            .from('user_activities')
            .select('activity_id') // Select the correct primary key
            .eq('user_id', userId)
            .ilike('activity_type', 'Downloaded the Mobile App%');

        // Dismiss the "Please wait" toast
        toast.dismiss(waitToastId);

        // Log the check result
        console.log("Download Check Result:", data, error); // Log the result of the download check

        if (data && data.length > 0) {
            // If there's a matching entry, inform the user
            toast.info(`You have already downloaded the ${platform} app.`);
            setIsAppDownloaded(true);
            return;
        }

        // Proceed with the download process
        const { data: user, error: getUserError } = await supabase
            .from('users')
            .select('points, actions_completed')
            .eq('id', userId)
            .single();

        if (getUserError) {
            console.error('Error getting user:', getUserError);
            toast.error('Failed to get user. Please try again.');
            return;
        }

        const pointsToUpdate = user.points + 15;
        const actionsCompleted = user.actions_completed + 1;

        const { error: updateUserError } = await supabase
            .from('users')
            .update({
                points: pointsToUpdate, // Add points to the user's points
                actions_completed: actionsCompleted, // Increment the actions_completed column
            })
            .eq('id', userId);

        if (updateUserError) {
            console.error('Error updating user:', updateUserError);
            toast.error('Failed to update user. Please try again.');
            return;
        }

        const { error: logError } = await supabase
            .from('user_activities')
            .insert({
                user_id: userId,
                activity_type: `Downloaded the Mobile App (${platform})`,
                points: 15,
            });

        if (logError) {
            console.error('Error logging activity:', logError);
            toast.error('Failed to log activity. Please try again.');
            return;
        }

        setIsAppDownloaded(true);



        toast.success(
            <div className="flex items-center">
                <span>{`${platform} App Downloaded. You have earned 15 points.`}</span>
            </div>,
            {
                autoClose: 3000,
                position: "bottom-center",
            }
        );

        window.location.href = url;

    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className={`p-6 ${
                    mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'
                } p-4 rounded-md text-center`}
            >
                <div>
                    <h2
                        className={`${
                            mode === 'dark' ? 'text-white' : 'text-black'
                        } text-xl font-semibold mb-4`}
                    >
                        Download Mobile App
                    </h2>
                </div>

                <p className={`text-center mb-4 ${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                    Download the Credit Bank mobile app to earn points.
                </p>
                <div className="flex justify-center gap-x-14">
                    <div>
                        <a
                            href="https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDownloadApp('Android', 'https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank');
                            }}
                        >

                            <Image
                                src="/assets/images/android.svg"
                                alt="Android"
                                width={75}
                                height={75}
                                className={`transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out ${isAppDownloaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <span className={`${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                            {isAppDownloaded ? 'Downloaded!' : 'Android users'}
                        </span>
                        </a>
                    </div>

                    <div>
                        <a
                            href="https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();
                                handleDownloadApp('Apple', 'https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952');
                            }}
                        >

                            <Image
                                src="/assets/images/apple.svg"
                                alt="Apple"
                                width={75}
                                height={75}
                                className={`transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out ${isAppDownloaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <span className={`${mode === 'dark' ? 'text-white' : 'text-black'}`}>
                            {isAppDownloaded ? 'Downloaded!' : 'Apple users'}
                        </span>
                        </a>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AppDownloadModal;