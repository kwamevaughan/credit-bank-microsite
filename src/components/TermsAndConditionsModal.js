// components/TermsAndConditionsModal.js
import React from 'react';
import Modal from './Modal'; // Import the Modal component

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Terms and Conditions">
            <p>
                This is a dummy content for the Terms and Conditions. By using this service, you agree to adhere to the policies set forth herein.
            </p>
        </Modal>
    );
};

export default TermsAndConditionsModal;