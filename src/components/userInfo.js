import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { imagekit } from '../utils/imageKitService';
import { uploadImage } from '../utils/imageKitService';
import countriesData from '../../public/assets/misc/countries.json';

const UserInfo = ({ token, mode, toggleMode, notify }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [countryCode, setCountryCode] = useState('');
    const [userId, setUserId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [rankImage, setRankImage] = useState('/assets/images/position-default.png'); // Default rank image

    // Ensure that token exists before fetching user data
    useEffect(() => {
        if (!token) {
            return; // Do nothing if token is not set
        }

        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, points, country')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            } else {
                setUserName(data.name);
                setUserPoints(data.points);

                // Map country name to code
                const foundCountry = countriesData.find((item) => item.name === data.country);
                const countryCode = foundCountry ? foundCountry.code : 'XX';

                setUserId(`CB${data.id}${countryCode}`);
            }
        };

        fetchUserData();
    }, [token]);

    // Ensure that token exists before fetching user profile
    useEffect(() => {
        if (!token) {
            return; // Do nothing if token is not set
        }

        const fetchUserProfile = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('profile_image')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
            } else {
                setImageUrl(data.profile_image || '/assets/images/placeholder.png');
            }
        };

        fetchUserProfile();
    }, [token]);

    // Fetch all users and determine rank
    useEffect(() => {
        if (!token) {
            console.error('No token found');
            return; // Do nothing if token is not set
        }

        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, points')
                .order('points', { ascending: false });

            if (error) {
                console.error('Error fetching leaderboard:', error);
                return;
            }

            console.log('Leaderboard data:', data);  // Log all leaderboard data
            console.log('Logged-in user token:', token); // Log the token
            const highestPoints = data[0]?.points;
            console.log('Highest points in leaderboard:', highestPoints);

            // Check for possible type mismatch between token and user id
            const user = data.find(user => user.id === parseInt(token)); // Ensure matching types
            console.log('Logged-in user data:', user); // Log the user data to confirm matching

            if (!user) {
                console.error('Logged-in user not found in leaderboard');
                return; // Exit if no user is found
            }

            // Proceed to rank calculation
            const userRank = data.findIndex((u) => u.points === user.points);
            console.log('User Rank:', userRank);

            // Set rank image based on the rank position
            if (userRank === 0) {
                console.log('User is ranked 1st');
                setRankImage('/assets/images/position-1.png');
            } else if (userRank === 1) {
                console.log('User is ranked 2nd');
                setRankImage('/assets/images/position-2.png');
            } else if (userRank === 2) {
                console.log('User is ranked 3rd');
                setRankImage('/assets/images/position-3.png');
            } else {
                console.log('User is not in top 3');
                setRankImage('/assets/images/position-default.png');
            }
        };

        fetchLeaderboard();
    }, [token]);


    // Handle file changes for profile image upload
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(file.type)) {
            notify('Please upload a valid image file (jpg, jpeg, png, gif, webp)!');
            return;
        }

        notify('Uploading your profile image...', { type: 'info' });

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result);
        };

        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('profile_image, profile_image_id')
                .eq('id', token)
                .single();

            if (userError) {
                console.error('Error fetching user profile data:', userError.message);
                return;
            }

            let imageUrl = userData.profile_image;
            let previousFileId = userData.profile_image_id;

            if (imageUrl && previousFileId && imageUrl !== '/assets/images/placeholder.png') {
                try {
                    await deleteOldImageFromImageKit(previousFileId);
                } catch (error) {
                    console.error('Error deleting previous image:', error);
                }
            }

            const { fileUrl, fileId } = await uploadImage(file, userName, userId);

            const { data: updatedUserData, error: updateError } = await supabase
                .from('users')
                .update({
                    profile_image: fileUrl,
                    profile_image_id: fileId
                })
                .eq('id', token);

            if (updateError) {
                console.error('Error updating user profile with image URL:', updateError.message);
                return;
            }

            notify('Profile image uploaded successfully!', { type: 'success' });
            event.target.value = '';

        } catch (error) {
            console.error('Unexpected error during image upload:', error);
            notify('An unexpected error occurred. Please try again.', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const deleteOldImageFromImageKit = async (fileId) => {
        try {
            await imagekit.deleteFile(fileId);
            console.log(`Old image with fileId ${fileId} deleted successfully from ImageKit.`);
        } catch (error) {
            console.error(`Error deleting image with fileId ${fileId}:`, error);
            throw error;
        }
    };

    return (
        <div
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-14 px-4 md:px-8`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr]">
                <div className="flex flex-col md:flex-row items-center gap-y-6 md:gap-y-0 pb-6 md:pb-0">
                    <div className="px-4 space-y-4">
                        <div className="block mx-auto relative">
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <div
                                className="cursor-pointer"
                                onClick={() => document.getElementById('file-input').click()}
                                onMouseEnter={() => setHovering(true)}
                                onMouseLeave={() => setHovering(false)}
                            >
                                <div
                                    className="w-[120px] h-[120px] rounded-full overflow-hidden relative flex justify-center items-center transition-all duration-300 ease-in-out"
                                >
                                    <div
                                        className={`absolute inset-0 bg-black rounded-full transition-opacity duration-500 ease-in-out z-10 ${hovering ? 'opacity-60' : 'opacity-0'}`}
                                    ></div>

                                    <Image
                                        src={imageUrl || '/assets/images/placeholder.png'}
                                        alt="Profile Image"
                                        width={120}
                                        height={120}
                                        className={`object-cover transition-transform duration-300 ease-in-out ${hovering ? 'scale-110' : 'scale-100'}`}
                                        style={{ zIndex: 0 }}
                                    />

                                    {hovering && (
                                        <div className="absolute flex justify-center items-center text-white text-lg z-10">
                                            <CloudArrowUpIcon color="#fff" className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                <Image
                                    src={rankImage}
                                    alt="Position Ranking Image"
                                    width={50}
                                    height={50}
                                    className="relative z-10 block mt-[-3em] ml-[60%]"
                                />
                            </div>
                        </div>

                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#e7f8f7] text-black'} py-2 px-6 border border-[#0eb4ab] rounded-lg text-[#0eb4ab]`}>
                            User ID: {userId || 'Loading...'}
                        </div>
                    </div>

                    <div className="px-4">
                        <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold">
                            Hi {userName} 👋,
                        </h2>
                        <p className="font-normal text-base sm:text-2xl">welcome to your profile!</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center px-4 space-y-4">
                    <div
                        className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#f7f1eb] text-black'} 
                            flex justify-between items-center py-2 px-4 border border-[#FF930A] rounded-lg font-bold 
                            transition-transform transform hover:translate-y-[-5px] 
                            duration-500 ease-in-out`}
                    >
                        <div className="flex items-center">
                            <Image
                                src={rankImage}
                                alt="Position Ranking Image"
                                width={50}
                                height={50}
                            />
                            <p>Points</p>
                        </div>
                        <span className="text-2xl font-extrabold">{userPoints || 'Loading...'}</span>
                    </div>

                    <div
                        className={`${
                            mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#e7f8f7] text-black'
                        } flex justify-between items-center py-4 px-4 border border-[#0eb4ab] rounded-lg font-bold 
      transition-transform transform hover:translate-y-[-5px] 
      duration-500 ease-in-out`}
                    >
                        <p>Actions Completed</p>
                        <span className="text-2xl font-extrabold">120</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
