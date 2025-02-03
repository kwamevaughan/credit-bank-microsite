// components/AooDownloadModal.js
import React from 'react';
import Modal from './Modal'; // Import the Modal component

const AppDownloadModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Download Mobile App">
            <p>
                App download. Testing
            </p>
        </Modal>
    );
};

export default AppDownloadModal;