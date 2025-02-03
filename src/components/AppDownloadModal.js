// components/AooDownloadModal.js
import React from 'react';
import Modal from './Modal'; // Import the Modal component
import Image from 'next/image';

const AppDownloadModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Download Mobile App">
            <p>
                Download our mobile app to earn points.
            </p>
            <div className="flex ">
                <Image src="/assets/images/android.svg" alt="Android"
                       width={75}
                       height={75}
                       className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"
                />

                <Image src="/assets/images/apple.svg" alt="Apple"
                       width={75}
                       height={75}
                       className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"
                />
            </div>
        </Modal>
    );
};

export default AppDownloadModal;