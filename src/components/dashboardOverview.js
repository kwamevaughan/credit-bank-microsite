import React, { useEffect, useState } from 'react';
import useUserData from '../hooks/useUserData';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const DashboardOverview = ({ userData, token, mode }) => {
    const { userName, userPoints } = userData;
    const totalPoints = 500;
    const [progressWidth, setProgressWidth] = useState(0); // Initialize state for progress width

    useEffect(() => {
        console.log('User Points Updated:', userPoints);
        const percentage = (userPoints / totalPoints) * 100;
        setProgressWidth(percentage);  // Update progress width when userPoints change
    }, [userPoints, totalPoints]);

    return (
        <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-6 px-4 md:px-0 hover:shadow-md transition-all duration-300 ease-in-out`}>
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center px-8">
                    <h3 className="font-normal text-base">Dashboard Overview</h3>
                    <EllipsisVerticalIcon className="w-6 h-6 text-gray-500" />
                </div>

                <div className="w-full border-b-2 border-gray-200"></div>

                <div className="px-8 py-2">
                    <div className="flex justify-between items-center pb-2">
                        <p className="font-bold text-xl">Total Points: {userPoints}</p>
                        <p className="font-bold text-xl">
                            {userPoints === totalPoints ? 'Completed!' : `${progressWidth.toFixed(0)}% to next tier`}
                        </p>
                    </div>

                    <div className="bg-[#cff0ed] rounded-full h-2.5 dark:bg-gray-700 mb-4 overflow-hidden">
                        <div
                            className="bg-[#0CB4AB] h-2.5 rounded-full transition-width duration-500 ease-in-out"
                            style={{ width: `${progressWidth}%` }}
                        ></div>
                    </div>

                    <p className="font-normal text-sm text-gray-500">
                        {progressWidth.toFixed(0)}% complete ({userPoints} points earned out of {totalPoints})
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;