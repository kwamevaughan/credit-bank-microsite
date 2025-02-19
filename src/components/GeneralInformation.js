import React from 'react';
import { UserIcon, EnvelopeIcon, PhoneArrowUpRightIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import ImageUpload from '@/components/ImageUpload';

const GeneralInformation = ({
                                fullName,
                                email,
                                phoneNumber,
                                selectedCountry,
                                handleInputChange,
                                handleCountryChange,
                                countriesData,
                                isLoading,
                                handleSubmit,
                                isImageLoading,
                                handleImageChange, // Receive the handleImageChange prop
                                imagePreview, // Receive the imagePreview prop
                                mode // Add mode prop to manage dark mode
                            }) => {

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <h3 className={`text-xl font-semibold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>General Information</h3>

                <ImageUpload
                    onImageChange={handleImageChange} // Pass onImageChange
                    imagePreview={imagePreview} // Pass imagePreview
                    mode={mode} // Pass mode
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    {/* Full Name */}
                    <div className="sm:col-span-4">
                        <label htmlFor="full-name" className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Full Name
                        </label>
                        <div className="relative">
                            <input
                                id="full-name"
                                name="full-name"
                                type="text"
                                value={fullName}
                                onChange={handleInputChange}
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10`} // Add padding for icon
                            />
                            <UserIcon className={`absolute left-3 top-3 h-5 w-5 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
                        </div>
                    </div>
                    {/* Email Address */}
                    <div className="sm:col-span-4">
                        <label htmlFor="email" className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10`} // Add padding for icon
                            />
                            <EnvelopeIcon className={`absolute left-3 top-3 h-5 w-5 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
                        </div>
                    </div>
                    {/* Phone Number */}
                    <div className="sm:col-span-2 sm:col-start-1">
                        <label htmlFor="phone-number" className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                                className={`mt-2 block w-full rounded-lg px-4 py-2 text-base ${mode === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border ${mode === 'dark' ? 'border-gray-600' : 'border-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 pl-10`} // Add padding for icon
                            />
                            <PhoneArrowUpRightIcon className={`absolute left-3 top-3 h-5 w-5 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
                        </div>
                    </div>
                    {/* Country */}
                    <div className="sm:col-span-2">
                        <label htmlFor="country"
                               className={`block text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Country
                        </label>
                        <div className="relative">
                            {countriesData && countriesData.length > 0 ? (
                                <div className="sm:col-span-2">
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
                                        className={`mt-2 block w-full rounded-lg ${mode === 'dark' ? 'text-white' : 'text-gray-900'} placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 transition-all duration-200`}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                backgroundColor: 'transparent', // Remove any background color
                                                color: mode === 'dark' ? 'white' : 'black', // Set text color based on mode
                                            }),
                                            singleValue: (base) => ({
                                                ...base,
                                                color: mode === 'dark' ? 'white' : 'black', // Set text color for selected value
                                            }),
                                            placeholder: (base) => ({
                                                ...base,
                                                color: mode === 'dark' ? 'white' : 'gray', // Set placeholder text color
                                            }),
                                            indicatorSeparator: (base) => ({
                                                ...base,
                                                display: 'none', // Optional: Hide the indicator separator
                                            }),
                                        }}
                                    />
                                </div>
                            ) : (
                                <p>Loading countries...</p>
                            )}
                        </div>

                    </div>
                </div>
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
    );
};

export default GeneralInformation;
