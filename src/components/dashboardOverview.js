import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const DashboardOverview = ({ token, mode, toggleMode, notify }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [userId, setUserId] = useState('');

    // Ensure that token exists before fetching user data
    useEffect(() => {
        if (!token) {
            return; // Do nothing if token is not set
        }

        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, points')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            } else {
                setUserName(data.name);
                setUserPoints(data.points);
            }
        };

        fetchUserData();
    }, [token]);

    return (
        <div
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-6 px-4 md:px-0 hover:shadow-md transition-all duration-300 ease-in-out`}
        >
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center px-8">
                    <h3 className="font-normal text-base">
                        Dashboard Overview
                    </h3>
                    <EllipsisVerticalIcon className="w-6 h-6 text-gray-500"/>
                </div>

                <div className="w-full border-b-2 border-gray-200"></div>

                <div className="px-8 py-2">
                <div className="flex justify-between items-center pb-2">
                    <p className="font-bold text-xl">Total Points: {userPoints}</p>
                    <p className="font-bold text-xl">75% to next tier</p>
                </div>

                <div className="bg-[#cff0ed] rounded-full h-2.5 dark:bg-gray-700 mb-4">
                    <div className="bg-[#0CB4AB] h-2.5 rounded-full" style={{width: '45%'}}></div>
                </div>

                <p className="font-normal text-sm text-gray-500">
                    75% complete (250 points earned out of 500)
                </p>
            </div>
            </div>
        </div>


    );
};

export default DashboardOverview;
