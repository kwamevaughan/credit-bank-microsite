import React, { useEffect, useCallback } from 'react';

const Modal = ({ isOpen, onClose, title, children, mode }) => {
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
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 !m-0"
            onClick={handleOutsideClick} // Close on overlay click
        >

                <button
                    onClick={onClose}
                    className={`${
                        mode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    } absolute top-2 right-2 text-xl font-bold focus:outline-none`}
                >
                    X
                </button>

                {children}

        </div>
    );
};

export default Modal;
