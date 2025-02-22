import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Image from 'next/image';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { imagekit } from '../utils/imageKitService';
import { uploadImage } from '../utils/imageKitService';
import countriesData from '../../public/assets/misc/countries.json';
import useUserData from '../hooks/useUserData';

const UserInfo = ({ userData, token, mode, toggleMode, notify }) => {
    const {
        userName,
        userPoints,
        actionsCompleted,
        rankImage,
        imageUrl,
        userId,
    } = userData;

    const [countryCode, setCountryCode] = useState('');
    const [uploading, setUploading] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        console.log('User Points Updated:', userPoints);
    }, [userPoints]);

    useEffect(() => {
        console.log('UserData:', userData);
    }, [userData]);

    // Set initial preview image when imageUrl changes
    useEffect(() => {
        setPreviewImage(imageUrl);
    }, [imageUrl]);

    // Ensure that token exists before fetching country code
    useEffect(() => {
        if (!token) return;

        const fetchUserCountryCode = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('country')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            } else {
                const foundCountry = countriesData.find(item => item.name === data.country);
                const code = foundCountry ? foundCountry.code : 'XX';
                setCountryCode(code);
            }
        };

        fetchUserCountryCode();
    }, [token]);

    // Handle file changes for profile image upload
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        if (!allowedImageTypes.includes(file.type)) {
            notify('Please upload a valid image file (jpg, jpeg, png, gif, webp)!');
            return;
        }

        notify('Uploading your profile image...', { type: 'info' });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            // Fetch current user data to get the current image ID
            const { data: currentUserData, error: userError } = await supabase
                .from('users')
                .select('profile_image_id')
                .eq('id', token)
                .single();

            if (userError) {
                console.error('Error fetching user profile data:', userError.message);
                throw userError;
            }

            const currentFileId = currentUserData.profile_image_id;
            console.log('Current file ID:', currentFileId);

            // If there's an existing image, try to delete it
            if (currentFileId) {
                try {
                    console.log(`Attempting to delete old image with ID: ${currentFileId}`);
                    await imagekit.deleteFile(currentFileId);
                    console.log('✓ Successfully deleted old image');
                } catch (deleteError) {
                    console.warn(`⚠ Failed to delete old image: ${deleteError.message}`);
                    // Continue with upload even if deletion fails
                }
            }

            // Upload new image
            console.log(`Uploading new image for user: ${userName}`);
            const { fileUrl, fileId } = await uploadImage(file, userName, userId);
            console.log('✓ New image uploaded successfully. New fileId:', fileId);

            // Update database with new image information
            console.log('Updating profile_image and profile_image_id in database...');
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    profile_image: fileUrl,
                    profile_image_id: fileId
                })
                .eq('id', token);

            if (updateError) {
                throw updateError;
            }

            console.log('✓ Database updated with new image information');
            notify('Profile image uploaded successfully!', { type: 'success' });

            // Clear the file input
            event.target.value = '';

        } catch (error) {
            console.error('Error during image upload process:', error);
            notify('An unexpected error occurred. Please try again.', { type: 'error' });
            // Reset preview to original image on error
            setPreviewImage(imageUrl);
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
            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-2 hover:shadow-md transition-all duration-300 ease-in-out z-10 relative`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr]">
                <div className="flex flex-col md:flex-row items-center gap-y-6 md:gap-y-0 pb-6 md:pb-0">
                    <div className="px-4 space-y-4">
                        <div className="block mx-auto relative">
                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileChange}
                                style={{display: 'none'}}
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
                                        src={previewImage || '/assets/images/placeholder.png'}
                                        alt="Profile Image"
                                        width={120}
                                        height={120}
                                        className={`object-cover transition-transform duration-300 ease-in-out ${hovering ? 'scale-110' : 'scale-100'}`}
                                        style={{zIndex: 0}}
                                    />

                                    {hovering && (
                                        <div
                                            className="absolute flex justify-center items-center text-white text-lg z-10">
                                            <CloudArrowUpIcon color="#fff" className="w-8 h-8"/>
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
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} py-2 px-6 border border-[#0eb4ab] rounded-lg text-[#0eb4ab]`}>
                            User ID: {userId || 'Loading...'}
                        </div>

                    </div>

                    <div className="px-4">
                        <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold">
                            Hi {userName} 👋,
                        </h2>
                        <p className="font-normal text-base sm:text-lg">welcome to your profile!</p>
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
                        <span className="text-2xl font-extrabold">{userPoints !== undefined && userPoints !== null ? userPoints : 'Loading...'}</span>
                    </div>

                    <div
                        className={`${
                            mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#e7f8f7] text-black'
                        } flex justify-between items-center py-4 px-4 border border-[#0eb4ab] rounded-lg font-bold 
      transition-transform transform hover:translate-y-[-5px] 
      duration-500 ease-in-out`}
                    >
                        <p>Actions Completed</p>
                        <span className="text-2xl font-extrabold">{actionsCompleted}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
