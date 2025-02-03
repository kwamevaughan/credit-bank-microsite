import React, { useEffect, useCallback } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOutsideClick = useCallback((e) => {
        if (e.target.id === 'modal-overlay') {
            onClose(); // Close the modal if the overlay is clicked
        }
    }, [onClose]);

    const handleEscapeKey = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose(); // Close the modal when Escape key is pressed
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [handleEscapeKey]);

    return (
        <div
            id="modal-overlay"
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={handleOutsideClick} // Close on overlay click
        >
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-xl font-bold text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                    X
                </button>
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};

export default Modal;
