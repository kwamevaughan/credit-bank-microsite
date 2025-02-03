import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

const MyActivity = ({ token, mode, toggleMode, notify }) => {
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
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg px-4 md:px-0 transition-all duration-300 ease-in-out`}
        >
            <div className="flex justify-between items-center px-8 py-6">
                <h3 className="font-bold text-base">
                    My Activity
                </h3>
                <EllipsisVerticalIcon className="w-6 h-6 text-gray-500"/>
            </div>

            <div className="w-full border-b-2 border-gray-200"></div>


            <div
                className={`${mode === 'dark' ? 'bg-[#101720] text-white hover:bg-[#1a2b3d]' : 'bg-[#f4fbfb] text-black hover:bg-[#e1f0f0]'} rounded-lg px-4 md:px-0 py-6 hover:shadow-md transition-all duration-300 ease-in-out`}>
                <div className="flex justify-between px-8">
                    <p className=" ">Opened a Diaspora account</p>
                    <p className="font-bold text-[#ff9409]">+20 Points</p>
                </div>
            </div>


            <div
                className={`${mode === 'dark' ? 'bg-[#101720] text-white hover:bg-[#1a2b3d]' : 'bg-white text-black hover:bg-[#e1f0f0]'} py-6 transition-all duration-300 ease-in-out`}>
                <div className="flex justify-between px-8">
                    <p>Completed the quiz</p>
                    <p className="font-bold text-[#ff9409]">+10 Points</p>
                </div>
            </div>


            <div
                className={`${mode === 'dark' ? 'bg-[#101720] text-white hover:bg-[#1a2b3d]' : 'bg-[#f4fbfb] text-black hover:bg-[#e1f0f0]'} rounded-lg px-4 md:px-0 py-6 hover:shadow-md transition-all duration-300 ease-in-out`}>
                <div className="flex justify-between px-8">
                    <p className=" ">Sent money abroad</p>
                    <p className="font-bold text-[#ff9409]">+25 Points</p>
                </div>
            </div>


            <div
                className={`${mode === 'dark' ? 'bg-[#101720] text-white hover:bg-[#1a2b3d]' : 'bg-white text-black hover:bg-[#e1f0f0]'} py-6 transition-all duration-300 ease-in-out`}>
                <div className="flex justify-between px-8">
                    <p>Downloaded the Mobile App</p>
                    <p className="font-bold text-[#ff9409]">+15 Points</p>
                </div>
            </div>

        </div>


    );
};

export default MyActivity;
