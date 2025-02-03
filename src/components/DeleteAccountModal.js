import Modal from './Modal'; // Import the generic Modal component

const DeleteAccountModal = ({ isOpen, onClose, handleDeleteAccount }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Account"
        >
            <p className=" mb-4">
                This action is irreversible. Your account will be permanently deleted.
            </p>
            <div className="flex justify-between">
                <button
                    onClick={onClose}
                    className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-300 ease-in-out">
                    Cancel
                </button>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 ease-in-out">
                    Delete Account
                </button>
            </div>
        </Modal>
    );
};

export default DeleteAccountModal;
