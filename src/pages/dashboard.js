import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import Image from 'next/image';
import { toast } from 'react-toastify';  // Import react-toastify
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { imagekit } from '../utils/imageKitService';  // Import ImageKit service
import { uploadImage } from '../utils/imageKitService';  // Import the uploadImage function

const countriesJsonPath = '/assets/misc/countries.json';

const Dashboard = () => {
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [mode, setMode] = useState('light');
    const [token, setToken] = useState(null);
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [userId, setUserId] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [countries, setCountries] = useState([]);
    const [imageUrl, setImageUrl] = useState('/assets/images/placeholder.png');
    const [uploading, setUploading] = useState(false);
    const [hovering, setHovering] = useState(false);


    const notify = (message) => toast(message);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch(countriesJsonPath);
                const data = await response.json();
                setCountries(data);
            } catch (error) {
                console.error('Error loading countries data:', error);
            }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(token);
        if (token) {
            const fetchUserData = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('id, name, points, country, profile_image')
                    .eq('id', token)
                    .single();
                if (error) {
                    console.error('Error fetching user data:', error);
                } else {
                    setUserName(data.name);
                    setUserPoints(data.points);
                    setImageUrl(data.profile_image || '/assets/images/placeholder.png');

                    const country = countries.find(item => item.name === data.country);
                    if (country) {
                        setCountryCode(country.code);
                        setUserId(`CB${data.id}${country.code}`);
                    } else {
                        setCountryCode('XX');
                        setUserId(`CB${data.id}XX`);
                    }
                }
            };

            fetchUserData();
        } else {
            router.push('/');
        }
    }, [token, countries]);

    useEffect(() => {
        const savedMode = localStorage.getItem('mode');
        if (savedMode) {
            setMode(savedMode);
        } else {
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setMode(systemMode);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSidebarOpen(window.innerWidth > 768);
        }
    }, []);

    const toggleMode = () => {
        setMode(prevMode => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mode', newMode);
            return newMode;
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Function to handle file change (image upload)
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check if the file is an image and validate file types
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(file.type)) {
            notify('Please upload a valid image file (jpg, jpeg, png, gif, webp)!');
            return;
        }

        // Show "Uploading..." toast
        notify('Uploading your profile image...', { type: 'info' });

        setUploading(true);
        try {
            // Fetch the current user profile data (to check if they have an existing profile image)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('profile_image, profile_image_id') // Add profile_image_id to select query
                .eq('id', token)
                .single();

            if (userError) {
                console.error('Error fetching user profile data:', userError.message);
                return;
            }

            let imageUrl = userData.profile_image;  // Existing profile image URL
            let previousFileId = userData.profile_image_id; // Fetch the fileId for the old image

            // If the user already has a profile image, we need to delete it first
            if (imageUrl && previousFileId && imageUrl !== '/assets/images/placeholder.png') {
                // Remove the old image from ImageKit storage
                try {
                    await deleteOldImageFromImageKit(previousFileId);
                } catch (error) {
                    console.error('Error deleting previous image:', error);
                }
            }

            // Upload and compress the new image using ImageKit
            const { fileUrl, fileId } = await uploadImage(file, userName, userId);

            // Update the user's profile with the new ImageKit image URL and fileId
            const { data: updatedUserData, error: updateError } = await supabase
                .from('users')
                .update({
                    profile_image: fileUrl,           // Save the full image URL
                    profile_image_id: fileId         // Save the fileId separately
                })
                .eq('id', token);

            if (updateError) {
                console.error('Error updating user profile with image URL:', updateError.message);
                return;
            }

            // Set the new image URL for display
            setImageUrl(fileUrl);

            // Show success toast
            notify('Profile image uploaded successfully!', { type: 'success' });

            // Reset the file input to allow the same file to be selected again
            event.target.value = '';

        } catch (error) {
            console.error('Unexpected error during image upload:', error);
            notify('An unexpected error occurred. Please try again.', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

// Helper function to delete old image from ImageKit
    const deleteOldImageFromImageKit = async (fileId) => {
        try {
            // Call ImageKit's API to delete the old image using the fileId
            await imagekit.deleteFile(fileId);  // Use fileId instead of image name
            console.log(`Old image with fileId ${fileId} deleted successfully from ImageKit.`);
        } catch (error) {
            console.error(`Error deleting image with fileId ${fileId}:`, error);
            throw error;
        }
    };






    return (
        <div className={`flex flex-col bg-[#f7f1eb] h-screen ${mode === 'dark' ? 'dark' : ''}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                userName={userName}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={() => {
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        router.push('/'); // Redirect to login
                    }}
                />

                <main
                    className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-transparent text-black'}`}>

                    <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-14 px-4 md:px-8`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr]"> {/* Set left column to 2fr and right column to 1fr */}
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
                                                    className={`absolute inset-0 bg-black rounded-full transition-opacity duration-500 ease-in-out ${hovering ? 'opacity-60' : 'opacity-0'}`}
                                                    style={{zIndex: 1}} // Ensuring the dark overlay is in front of the profile picture
                                                ></div>

                                                <Image
                                                    src={imageUrl || '/assets/images/placeholder.png'}
                                                    alt="Profile Image"
                                                    width={120}
                                                    height={120}
                                                    className={`object-cover transition-transform duration-300 ease-in-out ${hovering ? 'scale-110' : 'scale-100'}`}
                                                    style={{zIndex: 0}} // Ensuring the profile image is behind the overlay
                                                />

                                                {hovering && (
                                                    <div
                                                        className="absolute flex justify-center items-center text-white text-lg z-10">
                                                        <CloudArrowUpIcon color="#fff" className="w-8 h-8"/>
                                                    </div>
                                                )}
                                            </div>

                                            <Image
                                                src="/assets/images/rank-1.png"
                                                alt="Position Ranking Image"
                                                width={50}
                                                height={50}
                                                className="relative z-10 block mt-[-3em] ml-[60%]"
                                            />
                                        </div>
                                    </div>

                                    <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#e7f8f7] text-black'} py-2 px-6 border border-[#0eb4ab] rounded-lg text-[#0eb4ab]`}>
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
                                            src="/assets/images/rank-1.png"
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
                </main>

            </div>
        </div>
    );
};

export default Dashboard;
