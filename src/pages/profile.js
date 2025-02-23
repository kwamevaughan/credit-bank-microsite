// Profile.js (Revised - Key Changes Highlighted)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '/lib/supabase';
import useUserData from '../hooks/useUserData';
import useUserActivities from '../hooks/useUserActivities';
import Header from "@/layouts/header";
import Sidebar from "@/layouts/sidebar";
import { toast } from 'react-toastify';
import UserInfo from "@/components/userInfo";
import DashboardOverview from "@/components/dashboardOverview";
import {
    FlagIcon,
    EnvelopeIcon,
    ArrowRightOnRectangleIcon,
    TrashIcon,
    UserIcon,
    UserCircleIcon,
    PhotoIcon,
    PhoneArrowUpRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';  // Import icons
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { imagekit, uploadImage, deleteImage } from '../utils/imageKitService'; // Import both
import { useUser } from '@/context/UserContext';
import useSignOut from '@/hooks/useSignOut';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useModal from '@/hooks/useModal';
import useDeleteAccount from "@/hooks/useDeleteAccount";
import Select from 'react-select'; // Import react-select
import Image from 'next/image'; // Import the Image component
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import ImageUpload from '@/components/ImageUpload';
import GeneralInformation from '@/components/GeneralInformation';
import HelpDesk from '@/components/HelpDesk';
import DangerZone from '@/components/DangerZone';

const Profile = () => {
    const router = useRouter();
    const { user, token, setToken } = useUser();
    const { mode, toggleMode } = useTheme();
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { isOpen: isVerificationModalOpen, openModal: openVerificationModal, closeModal: closeVerificationModal } = useModal();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const notify = (message, type = 'success') => toast(message, { type }); // Add type parameter
    const userData = useUserData(token);
    const activities = useUserActivities(token);
    const {
        userName: initialUserName,
        userEmail: initialUserEmail,
        userCountry: initialUserCountry,
        userPhone: initialUserPhone,
        imageUrl: profileImage,
        profile_image_id, // This will now be available
        userPoints,
        countryCode,
        countriesData,
        baseId,
        userId
    } = userData || {};
    const { handleSignOut } = useSignOut();
    const { handleDeleteAccount } = useDeleteAccount();
    const [activeTab, setActiveTab] = useState("personal-information");

    const [fullName, setFullName] = useState(initialUserName || ''); // State for Full Name
    const [email, setEmail] = useState(initialUserEmail || '');       // State for Email
    const [phoneNumber, setPhoneNumber] = useState(initialUserPhone || ''); // State for Phone Number
    const [country, setCountry] = useState(initialUserCountry || '');   // State for Country
    const [selectedCountry, setSelectedCountry] = useState(null);  // New state for the selected country object
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator
    const [isImageLoading, setIsImageLoading] = useState(false);  // State for image upload loading
    const [imageFile, setImageFile] = useState(null); // State to hold the selected image file
    const [imagePreview, setImagePreview] = useState(profileImage || "/assets/images/placeholder.png"); // State for the image preview
    const [hovering, setHovering] = useState(false); // State to control hover effect
    // New state to store the current fileId
    const [currentFileId, setCurrentFileId] = useState(profile_image_id || null);
    const [isImageChanged, setIsImageChanged] = useState(false); // Track if image has been changed

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    useEffect(() => {
        // Update state when userData changes (e.g., after a successful update)
        if (userData) {
            setFullName(userData.userName || '');
            setEmail(userData.userEmail || '');
            setPhoneNumber(userData.userPhone || '');

            // Corrected country selection logic
            if (countriesData && userData.userCountry) {
                const foundCountry = countriesData.find(c => c.name === userData.userCountry);
                setSelectedCountry(foundCountry ?
                    { value: foundCountry.name, label: `${foundCountry.emoji} ${foundCountry.name}` } :
                    null);
            }

            // Update image preview
            setImagePreview(userData.imageUrl || "/assets/images/placeholder.png");

            // Log the fileId being set from userData - use profile_image_id instead of fileId
            console.log('Setting currentFileId from userData:', userData.profile_image_id);
            setCurrentFileId(userData.profile_image_id || null);
            console.log('Updated currentFileId from userData:', userData.profile_image_id);
        }
    }, [userData, countriesData]);

    const openModal = () => {
    };
    const closeModal = () => {
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'full-name':
                setFullName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'phone-number':
                setPhoneNumber(value);
                break;
            default:
                break;
        }
    };

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);
        setCountry(selectedOption?.value || '');  // Update the 'country' state
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setIsImageLoading(true);

        console.log('=== Starting profile update ===');
        console.log('Current fileId from state:', currentFileId);
        console.log('Current fileId from userData:', userData?.profile_image_id);

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    if (!baseId || !userId) {
                        notify('User ID not available.', 'error');
                        reject();
                        return;
                    }

                    // 1. Update user data
                    const updateData = {
                        name: fullName,
                        email: email,
                        phone_number: phoneNumber,
                        country: selectedCountry?.value || '',
                    };

                    const { error: userUpdateError } = await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', baseId);

                    if (userUpdateError) {
                        console.error('Error updating user data:', userUpdateError);
                        notify('Failed to update profile information.', 'error');
                        reject();
                        return;
                    }

                    // 2. Handle image upload if a new image is selected
                    if (imageFile) {
                        console.log('Image file selected for upload. Proceeding with image update...');
                        try {
                            // Single deletion attempt for old image
                            if (currentFileId) {
                                try {
                                    console.log(`Attempting to delete old image with ID: ${currentFileId}`);
                                    await deleteImage(currentFileId);
                                    console.log('✓ Successfully deleted old image');
                                } catch (deleteError) {
                                    console.warn(`⚠ Failed to delete old image: ${deleteError.message}`);
                                    // Continue with upload even if deletion fails
                                }
                            }

                            const referralCode = "CB" + userId.replace("CB", "");
                            const { fileUrl, fileId } = await uploadImage(imageFile, fullName.replace(/\s+/g, '_'), referralCode);
                            console.log(`✓ New image uploaded successfully. New fileId: ${fileId}`);

                            console.log('Updating profile_image and profile_image_id in database...');
                            const { error: imageUpdateError } = await supabase
                                .from('users')
                                .update({
                                    profile_image: fileUrl,
                                    profile_image_id: fileId
                                })
                                .eq('id', baseId);

                            if (imageUpdateError) throw imageUpdateError;

                            console.log('✓ Database updated with new image information');
                            setImagePreview(fileUrl);
                            setCurrentFileId(fileId);
                            console.log(`Local state updated. New currentFileId: ${fileId}`);

                        } catch (error) {
                            console.error('Error during image operation:', error);
                            notify('Failed to update profile picture.', 'error');
                            reject();
                            return;
                        }
                    }

                    console.log('=== Profile update completed successfully ===');
                    resolve();
                    // notify('Profile updated successfully!', 'success');
                } catch (error) {
                    console.error('Unexpected error:', error);
                    notify('An unexpected error occurred.', 'error');
                    reject();
                }
            }),
            {
                pending: 'Updating profile...',
                success: 'Profile updated successfully! 😊',
                error: 'Failed to update profile 😞'
            }
        );

        setIsLoading(false);
        setIsImageLoading(false); // Ensure that the button is enabled after upload completes
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file); // Update the selected file
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result); // Update the image preview
                setIsImageChanged(true); // Mark the image as changed
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`flex flex-col h-screen ${mode === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f1eb]'}`}>
            <Header
                token={token}
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                mode={mode}
                toggleMode={toggleMode}
                onLogout={handleSignOut}
                userData={userData}
            />

            <div className="flex flex-1 transition-all duration-300">
                <Sidebar
                    token={token}
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    mode={mode}
                    onLogout={handleSignOut}
                    openModal={openModal}
                    openVerificationModal={openVerificationModal}
                    toggleMode={toggleMode}
                    userData={userData}
                />

                <main
                    className={`flex-1 p-4 md:p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-10 lg:ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}
                >
                    <div className="space-y-6">
                        <UserInfo
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            userData={userData}
                        />

                        <div
                            className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-2 hover:shadow-md transition-all duration-300 ease-in-out`}
                        >
                            <div className="mb-4 dark:border-gray-700">
                                <div className="overflow-x-auto">
                                    <ul
                                        className={`flex flex-col sm:flex-row sm:flex-nowrap text-sm font-medium rounded-lg py-2 px-2 relative ${mode === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                                        role="tablist"
                                    >
                                        <li className="me-2 w-full sm:w-auto" role="presentation">
                                            <button
                                                className={`w-full text-left tab-button inline-block text-base p-4 rounded-lg relative overflow-hidden ${
                                                    activeTab === "personal-information" ? "text-teal-400" : (mode === 'dark' ? 'text-white' : 'text-gray-500')
                                                }`}
                                                onClick={() => handleTabClick("personal-information")}
                                                role="tab"
                                                aria-controls="personal-information"
                                                aria-selected={activeTab === "personal-information"}
                                            >
                                                <UserIcon className="h-5 w-5 mr-2 inline-block"/> General Information
                                                <span
                                                    className="absolute inset-0 bg-teal-600 opacity-10 transition-all duration-300"
                                                    style={{
                                                        transform: `translateX(${activeTab === "personal-information" ? '0%' : activeTab === "help-desk" ? '100%' : '200%'})`,
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            </button>
                                        </li>
                                        <li className="me-2 w-full sm:w-auto" role="presentation">
                                            <button
                                                className={`w-full text-left tab-button inline-block text-base p-4 rounded-lg font-bold relative overflow-hidden ${
                                                    activeTab === "help-desk" ? "text-teal-400" : (mode === 'dark' ? 'text-white' : 'text-gray-500')
                                                }`}
                                                onClick={() => handleTabClick("help-desk")}
                                                role="tab"
                                                aria-controls="help-desk"
                                                aria-selected={activeTab === "help-desk"}
                                            >
                                                <PhoneArrowUpRightIcon className="h-5 w-5 mr-2 inline-block"/> Help Desk
                                                <span
                                                    className="absolute inset-0 bg-teal-600 opacity-10 transition-all duration-300"
                                                    style={{
                                                        transform: `translateX(${activeTab === "help-desk" ? '0%' : activeTab === "personal-information" ? '-100%' : '100%'})`,
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            </button>
                                        </li>
                                        <li className="w-full sm:w-auto" role="presentation">
                                            <button
                                                className={`w-full text-left tab-button inline-block text-base p-4 rounded-lg relative overflow-hidden ${
                                                    activeTab === "danger" ? "text-teal-400" : (mode === 'dark' ? 'text-white' : 'text-gray-500')
                                                }`}
                                                onClick={() => handleTabClick("danger")}
                                                role="tab"
                                                aria-controls="danger"
                                                aria-selected={activeTab === "danger"}
                                            >
                                                <ExclamationTriangleIcon
                                                    className="h-5 w-5 mr-2 inline-block text-red-600"/> Danger Zone
                                                <span
                                                    className="absolute inset-0 bg-red-600 opacity-10 transition-all duration-300"
                                                    style={{
                                                        transform: `translateX(${activeTab === "danger" ? '0%' : activeTab === "personal-information" ? '-200%' : '-100%'})`,
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                />
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div id="default-styled-tab-content" className="w-full">
                                <div
                                    className={`p-4 rounded-lg ${activeTab === "personal-information" ? "" : "hidden"}`}
                                    id="styled-personal-information" role="tabpanel"
                                    aria-labelledby="personal-information-tab"
                                >
                                    <GeneralInformation
                                        fullName={fullName}
                                        email={email}
                                        phoneNumber={phoneNumber}
                                        selectedCountry={selectedCountry}
                                        handleInputChange={handleInputChange}
                                        handleCountryChange={handleCountryChange}
                                        countriesData={countriesData}
                                        isLoading={isLoading}
                                        ImageUpload={ImageUpload}
                                        handleSubmit={handleSubmit}
                                        isImageLoading={isImageLoading}
                                        handleImageChange={handleImageChange}
                                        imagePreview={imagePreview}
                                        mode={mode}
                                    />
                                </div>
                                <div
                                    className={`p-4 rounded-lg ${activeTab === "help-desk" ? "" : "hidden"}`}
                                    id="styled-help-desk" role="tabpanel" aria-labelledby="help-desk-tab"
                                >
                                    <HelpDesk
                                        fullName={fullName}
                                        email={email}
                                        mode={mode}
                                        notify={notify}
                                    />
                                </div>
                                <div
                                    className={`p-4 rounded-lg ${activeTab === "danger" ? "" : "hidden"}`}
                                    id="styled-danger" role="tabpanel" aria-labelledby="danger-tab"
                                >
                                    <DangerZone
                                        mode={mode}
                                        setShowDeleteModal={setShowDeleteModal}
                                        handleDeleteAccount={handleDeleteAccount}
                                    />
                                </div>
                            </div>
                        </div>


                        <DeleteAccountModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            handleDeleteAccount={() => handleDeleteAccount(router)}  // Just pass router
                            toggleMode={toggleMode}
                            mode={mode}
                        />

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;