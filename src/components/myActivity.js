import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import useUserActivities from '../hooks/useUserActivities'; // Adjust the import path accordingly

const MyActivity = ({ token, mode, notify }) => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

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

    // Human-readable date format for UI
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = {
            weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    // Date format for CSV export in DD/MM/YYYY format
    const formatExportDate = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0'); // Add leading zero for single digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero for single digits
        const year = date.getFullYear();

        // Return the date in "DD/MM/YYYY" format
        return `${day}/${month}/${year}`;
    };

    const handleExport = () => {
        // Filename format: "User Name - Activity Log - Challenge Name.csv"
        const filename = `${userName} - Activity Log - Diaspora Champions Challenge.csv`;

        // Create the CSV content with headers
        const csvContent = [
            'Activity Type,Points,Task Completed On', // Header row
            ...activities.map(activity => {
                const formattedDate = formatExportDate(activity.created_at); // Use formatExportDate for CSV
                console.log('Exporting:', activity.activity_type, activity.points, formattedDate); // Log the exported values

                // Ensure we only have three columns per row, and the date is correctly formatted in one string
                return `${activity.activity_type},${activity.points},${formattedDate}`;
            }),
        ].join("\n");

        // Log the entire CSV content to check what is being created
        console.log('CSV Content:', csvContent);

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        // Show success toast notification
        notify('Activity log exported successfully!', { type: 'success' });
    };

    return (
        <div
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg px-4 md:px-0 transition-all duration-300 ease-in-out`}
        >
            <div className="flex justify-between items-center px-8 py-6">
                <h3 className="font-bold text-base">My Activity</h3>
                <div className="relative z-10">
                    <EllipsisVerticalIcon
                        className="w-6 h-6 text-gray-500 cursor-pointer"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    />
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-200 w-40">
                            <ul className="text-sm">
                                <li
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={handleExport}
                                >
                                    Export Activity Log
                                </li>
                                {/* Add other options if needed */}
                            </ul>
                        </div>
                    )}
                </div>
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
                    style={{overflowY: 'auto', height: '300px'}}
                >
                    {activities.slice(0, 5).map((activity, index) => {
                        return (
                            <div
                                key={activity.activity_id}
                                className={`${
                                    index % 2 === 0
                                        ? mode === 'dark'
                                            ? 'bg-[#0a0c1d] hover:bg-[#2a3b4f]'  // Dark mode alternative
                                            : 'bg-[#f4fbfb] hover:bg-[#cff0ed]'
                                        : mode === 'dark'
                                            ? 'bg-[#1b2937] hover:bg-[#2a3b4f]'  // Dark mode alternative
                                            : 'bg-white hover:bg-[#cff0ed]'
                                } py-6 transition-all duration-300 ease-in-out group relative`}
                            >
                                <div className="flex justify-between px-8">
                                    <p>{activity.activity_type}</p>
                                    <p className="font-bold text-[#ff9409]">+{activity.points} Points</p>
                                </div>
                                <div
                                    className={`absolute left-1/2 transform -translate-x-1/2 bottom-0 w-30 p-2 rounded-lg flex items-center mb-2 opacity-0 group-hover:opacity-75 transition-opacity duration-300 ${mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} text-sm rounded px-4 py-2 shadow-lg`}
                                >
                                    {`Task completed on ${formatDate(activity.created_at)}`} {/* Human-readable format */}
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
