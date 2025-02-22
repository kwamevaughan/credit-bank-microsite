import React from 'react';
import Modal from './Modal'; // Import the Modal component

const TermsAndConditionsModal = ({ isOpen, onClose, mode }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className={`p-6 ${
                    mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'
                } p-4 rounded-md `}
            >
                {/* Title with Dark Mode Support */}
                <h2
                    className={`${
                        mode === 'dark' ? 'text-white' : 'text-black'
                    } text-xl font-semibold mb-4 text-center`}
                >
                    Terms and Conditions
                </h2>

                <p>
                    By using this service, you agree to adhere to the policies set forth herein.
                </p>
            </div>
        </Modal>
    );
};

export default TermsAndConditionsModal;
