// ImageUpload.js
import React, { useState } from 'react';
import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';

const ImageUpload = ({ onImageChange, imagePreview, mode }) => {
    const [hovering, setHovering] = useState(false);

    return (
        <label className="flex items-center gap-4 mb-8">
            <label htmlFor="photo"
                   className={`text-base font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Profile Photo
            </label>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-x-4 px-4 space-y-4">
                    <div className="block mx-auto relative">
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => onImageChange(e)} // Trigger callback on image change
                            style={{display: 'none'}}
                        />
                        <div
                            className="cursor-pointer"
                            onClick={() => document.getElementById('imageUpload').click()}
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
                                    src={imagePreview || '/assets/images/placeholder.png'}
                                    alt="Profile Image"
                                    width={120}
                                    height={120}
                                    className={`object-cover transition-transform duration-300 ease-in-out ${hovering ? 'scale-110' : 'scale-100'}`}
                                    style={{zIndex: 0}}
                                />
                                {hovering && (
                                    <div className="absolute flex justify-center items-center text-white text-lg z-10">
                                        <PhotoIcon className="w-8 h-8"/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => document.getElementById('imageUpload').click()}
                        className="h-full mt-4 rounded-full bg-teal-500 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-200"
                    >
                        Change Photo
                    </button>
                </div>
            </div>
        </label>

    );
};

export default ImageUpload;
