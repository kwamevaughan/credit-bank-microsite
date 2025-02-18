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
import VerificationModal from "@/components/VerificationModal";
import { imagekit, uploadImage } from '../utils/imageKitService'; // Import both
import { useUser } from '@/context/UserContext';
import useSignOut from '@/hooks/useSignOut';
import useTheme from '@/hooks/useTheme';
import useSidebar from '@/hooks/useSidebar';
import useModal from '@/hooks/useModal';
import useDeleteAccount from "@/hooks/useDeleteAccount";
import Select from 'react-select'; // Import react-select
import Image from 'next/image'; // Import the Image component
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

const Profile = () => {
    const router = useRouter();
    const { token, setToken } = useUser();
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
        userPoints,
        countryCode,
        countriesData,
        baseId,
        userId
    } = userData || {}; // Destructure userId
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
                setSelectedCountry(foundCountry ? { value: foundCountry.name, label: `${foundCountry.emoji} ${foundCountry.name}` } : null);
            }
            setImagePreview(userData.imageUrl || "/assets/images/placeholder.png"); // Update image preview
        }
    }, [userData, countriesData]); // Re-run when userData or countriesData changes

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
                        country: selectedCountry?.value || '', // Use selectedCountry?.value or ''
                    };

                    const { error: userUpdateError } = await supabase
                        .from('users')
                        .update(updateData)
                        .eq('id', baseId);

                    if (userUpdateError) {
                        console.error('Error updating user data:', userUpdateError);
                        notify('Failed to update profile.', 'error');
                        reject();
                        return;
                    }

                    // 2. Handle image upload
                    if (imageFile) {
                        try {
                            // Construct the correct filename for image upload
                            const countryCode = selectedCountry?.value.substring(0, 2).toUpperCase() || '';
                            const referralCode = "CB" + userId.replace("CB", ""); // Corrected referral code
                            const newFileName = `${fullName.replace(/\s+/g, '_')}_${referralCode}.${imageFile.name.split('.').pop()}`;

                            const { fileUrl } = await uploadImage(imageFile, fullName.replace(/\s+/g, '_'), referralCode);

                            const { error: imageUpdateError } = await supabase
                                .from('users')
                                .update({ profile_image: fileUrl })
                                .eq('id', baseId);

                            if (imageUpdateError) {
                                console.error('Error updating image URL in Supabase:', imageUpdateError);
                                notify('Failed to update profile picture.', 'error');
                                reject();
                            } else {
                                setImagePreview(fileUrl); // Immediately update the image preview
                            }
                        } catch (error) {
                            console.error('Error uploading image to ImageKit:', error);
                            notify('Failed to upload profile picture.', 'error');
                            reject();
                        } finally {
                            document.getElementById('imageUpload').value = ''; // Clear the input field
                        }
                    }

                    resolve();
                    notify('Profile updated successfully!', 'success');
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
    };



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
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

                <main className={`flex-1 p-8 pt-14 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} ${mode === 'dark' ? 'bg-[#0a0c1d] text-white' : 'bg-[#f7f1eb] text-black'} w-full`}>
                    <div className="space-y-6">
                        <UserInfo
                            mode={mode}
                            toggleMode={toggleMode}
                            token={token}
                            notify={notify}
                            userData={userData}
                        />

                        <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-white text-black'} rounded-lg py-8 px-2 hover:shadow-md transition-all duration-300 ease-in-out`}>
                            <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                                    <li className="me-2" role="presentation">
                                        <button
                                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "personal-information" ? "text-teal-600" : "text-gray-500"}`}
                                            onClick={() => handleTabClick("personal-information")}
                                            role="tab"
                                            aria-controls="personal-information"
                                            aria-selected={activeTab === "personal-information"}
                                        >
                                            <UserIcon className="h-5 w-5 mr-2 inline-block" /> General Information
                                        </button>
                                    </li>
                                    <li className="me-2" role="presentation">
                                        <button
                                            className={`inline-block p-4 border-b-2 rounded-t-lg font-bold  ${activeTab === "help-desk" ? "text-teal-600" : "text-gray-500"}`}
                                            onClick={() => handleTabClick("help-desk")}
                                            role="tab"
                                            aria-controls="help-desk"
                                            aria-selected={activeTab === "help-desk"}
                                        >
                                            <PhoneArrowUpRightIcon className="h-5 w-5 mr-2 inline-block" /> Help Desk
                                        </button>
                                    </li>

                                    <li role="presentation">
                                        <button
                                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "danger" ? "text-teal-600" : "text-gray-500"}`}
                                            onClick={() => handleTabClick("danger")}
                                            role="tab"
                                            aria-controls="danger"
                                            aria-selected={activeTab === "danger"}
                                        >
                                            <ExclamationTriangleIcon className="h-5 w-5 mr-2 inline-block text-red-600" /> Danger Zone
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div id="default-styled-tab-content">
                                <div
                                    className={`p-4 rounded-lg ${activeTab === "personal-information" ? "" : "hidden"}`}
                                    id="styled-personal-information" role="tabpanel"
                                    aria-labelledby="personal-information-tab">
                                    <form onSubmit={handleSubmit}>
                                        <div className="space-y-8">
                                            {/* General Information Section */}
                                            <h3 className="text-xl font-semibold text-gray-900">General
                                                Information</h3>

                                            {/* Profile Photo Section */}
                                            <div className="flex items-center gap-4 mb-8">
                                                <label htmlFor="photo"
                                                       className="block text-sm font-medium text-gray-900">Profile
                                                    Photo</label>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-x-4 px-4 space-y-4">
                                                        <div className="block mx-auto relative">
                                                            <input
                                                                id="imageUpload"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleImageChange}
                                                                style={{ display: 'none' }}
                                                            />
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => document.getElementById('imageUpload').click()}
                                                                onMouseEnter={() => setHovering(true)}
                                                                onMouseLeave={() => setHovering(false)}
                                                            >
                                                                <div
                                                                    className="w-[120px] h-[120px] rounded-full overflow-hidden relative flex justify-center items-center transition-all duration-300 ease-in-out">
                                                                    <div
                                                                        className={`absolute inset-0 bg-black rounded-full transition-opacity duration-500 ease-in-out z-10 ${hovering ? 'opacity-60' : 'opacity-0'}`}></div>

                                                                    <Image
                                                                        src={imagePreview || '/assets/images/placeholder.png'}
                                                                        alt="Profile Image"
                                                                        width={120}
                                                                        height={120}
                                                                        className={`object-cover transition-transform duration-300 ease-in-out ${hovering ? 'scale-110' : 'scale-100'}`}
                                                                        style={{ zIndex: 0 }}
                                                                    />

                                                                    {hovering && (
                                                                        <div
                                                                            className="absolute flex justify-center items-center text-white text-lg z-10">
                                                                            <PhotoIcon className="w-8 h-8" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => document.getElementById('imageUpload').click()}
                                                            className="h-10 mt-4 rounded-full bg-teal-500 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200"
                                                        >
                                                            Change Photo
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                                {/* Full Name */}
                                                <div className="sm:col-span-4">
                                                    <label htmlFor="full-name"
                                                           className="block text-sm font-medium text-gray-900">
                                                        Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id="full-name"
                                                            name="full-name"
                                                            type="text"
                                                            value={fullName}
                                                            onChange={handleInputChange}
                                                            className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10" // Add padding for icon
                                                        />
                                                        <UserIcon
                                                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                                                            aria-hidden="true" />
                                                    </div>
                                                </div>

                                                {/* Email Address */}
                                                <div className="sm:col-span-4">
                                                    <label htmlFor="email"
                                                           className="block text-sm font-medium text-gray-900">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            value={email}
                                                            onChange={handleInputChange}
                                                            autoComplete="email"
                                                            className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10" // Add padding for icon
                                                        />
                                                        <EnvelopeIcon
                                                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                                                            aria-hidden="true" />
                                                    </div>
                                                </div>

                                                {/* Phone Number */}
                                                <div className="sm:col-span-2 sm:col-start-1">
                                                    <label htmlFor="phone-number"
                                                           className="block text-sm font-medium text-gray-900">
                                                        Phone Number
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id="phone-number"
                                                            name="phone-number"
                                                            type="text"
                                                            value={phoneNumber}
                                                            onChange={handleInputChange}
                                                            autoComplete="phone-number"
                                                            className="mt-2 block w-full rounded-lg bg-white px-4 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10 border " // Add padding for icon
                                                        />
                                                        <PhoneArrowUpRightIcon
                                                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                                                            aria-hidden="true" />
                                                    </div>
                                                </div>

                                                {/* Country */}
                                                <div className="sm:col-span-2">
                                                    <label htmlFor="country"
                                                           className="block text-sm font-medium text-gray-900">
                                                        Country
                                                    </label>
                                                    <div className="relative">
                                                        {countriesData && countriesData.length > 0 ? (
                                                            <div className="sm:col-span-2 ">
                                                                <Select
                                                                    id="country"
                                                                    name="country"
                                                                    value={selectedCountry}
                                                                    onChange={handleCountryChange}
                                                                    options={countriesData.map(country => ({
                                                                        value: country.name,
                                                                        label: `${country.emoji} ${country.name}`
                                                                    }))}
                                                                    placeholder="Select your country"
                                                                    isSearchable
                                                                    isClearable
                                                                    isDisabled
                                                                    className="mt-2 block w-full rounded-lg bg-white text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200" // Add padding for icon
                                                                />

                                                            </div>
                                                        ) : (
                                                            <p>Loading countries...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="mt-8 flex gap-x-6">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading || isImageLoading} // Disable while loading
                                                    className={`rounded-lg px-6 py-3 text-sm font-semibold shadow-lg focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200 ${isLoading ? 'bg-gray-400 text-gray-50' : 'bg-teal-500 text-white hover:bg-teal-600'} ${isImageLoading ? 'bg-gray-400 text-gray-50' : ''}`}
                                                >
                                                    {isLoading ? 'Saving...' : isImageLoading ? 'Uploading...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>


                                </div>
                                <div className={`p-4 rounded-lg ${activeTab === "help-desk" ? "" : "hidden"}`}
                                     id="styled-help-desk" role="tabpanel" aria-labelledby="help-desk-tab">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Temporarily unavailable. Please check back later.
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg ${activeTab === "danger" ? "" : "hidden"}`}
                                     id="styled-danger" role="tabpanel" aria-labelledby="danger-tab">
                                    <div className="flex flex-col justify-between gap-y-2 mb-8">
                                        <h3 className="font-normal text-lg">Delete Account</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Once you delete the account, there is no going back. Please be certain.
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 ease-in-out
            ${mode === 'dark'
                                            ? 'bg-[#ef4547] text-white hover:bg-[#c0392b]'
                                            : 'bg-[#ef4547] text-white hover:bg-red-600'}`
                                        }>
                                        <TrashIcon className="h-5 w-5 mr-2 text-white" />
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-x-4 pt-4">
                            <button
                                onClick={handleSignOut}
                                className={`flex items-center px-4 py-4 rounded-lg transition-all duration-300 ease-in-out
            ${mode === 'dark'
                                    ? 'bg-[#2a3a48] text-[#0eb4ab] hover:bg-[#3e4b5d]'
                                    : 'bg-white text-[#0eb4ab] hover:bg-gray-200'}`
                                }>
                                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-[#ff9409]" />
                                Sign out
                            </button>

                        </div>

                        <DeleteAccountModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            handleDeleteAccount={handleDeleteAccount}
                            toggleMode={toggleMode}
                            mode={mode}
                        />

                        <VerificationModal
                            isOpen={isVerificationModalOpen}
                            onClose={closeVerificationModal}
                            token={token}
                            toggleMode={toggleMode}
                            mode={mode}
                            notify={notify}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;