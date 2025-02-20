import React, { useEffect, useState } from 'react';
import useUserData from '../hooks/useUserData';
import { StarIcon, ShieldExclamationIcon, TrophyIcon } from '@heroicons/react/24/outline';

const DashboardOverview = ({ userData, token, mode }) => {
    const { userName, userPoints } = userData;

    // Define tier thresholds
    const tierThresholds = {
        bronze: 0,
        silver: 500,
        gold: 2500,
    };

    // Set total points to the upper limit of the highest tier
    const totalPoints = 2500;

    // Function to determine the current tier
    const getUserTier = (points) => {
        if (points >= tierThresholds.gold) {
            return 'Gold';
        } else if (points >= tierThresholds.silver) {
            return 'Silver';
        } else {
            return 'Bronze';
        }
    };

    // Function to get the appropriate icon for each tier
    const getTierIcon = (tier) => {
        switch (tier) {
            case 'Gold':
                return <ShieldExclamationIcon className="w-8 h-8 text-yellow-500" />;
            case 'Silver':
                return <StarIcon className="w-8 h-8 text-gray-400" />;
            case 'Bronze':
            default:
                return <TrophyIcon className="w-8 h-8 text-bronze-500" />;
        }
    };

    // Calculate progress bar width percentage
    const [progressWidth, setProgressWidth] = useState(0);
    useEffect(() => {
        const percentage = (userPoints / totalPoints) * 100;
        setProgressWidth(percentage);  // Update progress width when userPoints change
    }, [userPoints, totalPoints]);

    // Get the current tier
    const userTier = getUserTier(userPoints);

    // Determine the background color based on the user's tier
    const progressBarBackground = userPoints >= tierThresholds.gold
        ? 'bg-gradient-to-r from-yellow-500 to-yellow-700'
        : userPoints >= tierThresholds.silver
            ? 'bg-gradient-to-r from-gray-400 to-gray-500'
            : 'bg-gradient-to-r from-[#0CB4AB] to-[#0A8D8B]';

    const backgroundStyle = userPoints >= tierThresholds.gold
        ? 'bg-gradient-to-r from-yellow-300 to-yellow-400'
        : userPoints >= tierThresholds.silver
            ? 'bg-gradient-to-r from-gray-200 to-gray-300'
            : 'bg-gradient-to-r from-[#A0D6D2] to-[#8AABAB]';

    return (
        <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-6 px-4 md:px-0 hover:shadow-md transition-all duration-300 ease-in-out`}>
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center px-8">
                    <h3 className="font-medium text-lg">Dashboard Overview</h3>
                </div>

                <div className="w-full border-b-2 border-gray-200"></div>

                <div className="px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center pb-2">
                        <div
                            className="relative group flex flex-col sm:flex-row items-center space-x-2 sm:space-x-2 sm:space-y-0 space-y-2">
                            {getTierIcon(userTier)}
                            <p className="font-bold text-xl">Current Tier:</p>
                            <div
                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                                {userTier} Tier
                            </div>

                            <p className="font-bold text-xl">{userTier}</p>
                        </div>

                        <p className="font-bold text-xl mt-2 sm:mt-0">
                            {userPoints === totalPoints ? 'Completed!' : `${progressWidth.toFixed(0)}% to next tier`}
                        </p>
                    </div>


                    {/* Tier Progress Bar with Milestones */}
                    <div className="relative mb-4">
                        <div className={`w-full rounded-full h-3 ${backgroundStyle}`}>
                            <div
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${progressBarBackground}`}
                                style={{ width: `${progressWidth}%` }}
                            ></div>
                        </div>
                        <div className="absolute inset-x-0 flex justify-between text-xs font-semibold text-gray-500">
                            <span>Bronze</span>
                            <span>Silver</span>
                            <span>Gold</span>
                        </div>
                    </div>

                    <p className="font-normal text-sm text-gray-500 pt-2">
                        {progressWidth.toFixed(0)}% complete ({userPoints} points earned out of {totalPoints})
                    </p>

                    {/* Celebration Animation when Completed */}
                    {userPoints === totalPoints && (
                        <div className="mt-4 text-center">
                            <p className="font-semibold text-2xl text-yellow-500">Congratulations! You've reached the
                                highest tier!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
