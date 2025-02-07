import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import useUserActivities from '../hooks/useUserActivities'; // Adjust the import path accordingly

const MyActivity = ({ token, mode }) => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');

    const { activities, loading, error } = useUserActivities(userId); // Get activities from the custom hook

    useEffect(() => {
        if (!token) return;

        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            } else {
                setUserName(data.name);
                setUserId(data.id); // Set userId for the useUserActivities hook
            }
        };

        fetchUserData();
    }, [token]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    return (
        <div
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg px-4 md:px-0 transition-all duration-300 ease-in-out`}
        >
            <div className="flex justify-between items-center px-8 py-6">
                <h3 className="font-bold text-base">My Activity</h3>
                <EllipsisVerticalIcon className="w-6 h-6 text-gray-500"/>
            </div>

            <div className="w-full border-b-2 border-gray-200"></div>

            {loading && (
                <div className="text-center py-4">Loading your activities...</div>
            )}

            {error && (
                <div className="text-center py-4 text-red-600">{error}</div>
            )}

            {!loading && !error && activities.length > 0 ? (
                <div
                    className=""
                    style={{overflowY: 'auto', height: '300px'}}>
                    {activities.slice(0, 5).map((activity, index) => { // Limit to 5 activities
                        return (
                            <div
                                key={activity.activity_id}
                                className={`${
                                    index % 2 === 0
                                        ? 'bg-[#f4fbfb] hover:bg-[#cff0ed]'
                                        : 'bg-white hover:bg-[#cff0ed]'
                                } py-6 transition-all duration-300 ease-in-out group relative`}
                            >
                                <div className="flex justify-between px-8">
                                    <p>{activity.activity_type}</p>
                                    <p className="font-bold text-[#ff9409]">+{activity.points} Points</p>
                                </div>
                                <div
                                    className="absolute left-1/2 transform -translate-x-1/2  bottom-0 flex items-center mb-2 opacity-0 group-hover:opacity-75 transition-opacity duration-300 bg-gray-800 text-white text-sm rounded px-4 py-2 shadow-lg"
                                >
                                    {`Task completed on ${formatDate(activity.created_at)}`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-4">No activities yet!</div>
            )}
        </div>
    );
};

export default MyActivity;
