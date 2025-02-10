import Modal from './Modal';

const DeleteAccountModal = ({ handleDeleteAccount, isOpen, onClose, mode }) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div
                className={`p-6 ${
                    mode === 'dark' ? 'bg-[#0f1720] text-white' : 'bg-white text-black'
                } p-4 rounded-md text-center`}
            >
                <div>
                    <h2
                        className={`${
                            mode === 'dark' ? 'text-white' : 'text-black'
                        } text-xl font-semibold mb-4`}
                    >
                        Delete Account?
                    </h2>
                </div>

                <p className="mb-4">
                    This action is irreversible. Your account will be permanently deleted.
                </p>
                <div className="flex justify-between">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${mode === 'dark' ? 'bg-gray-200 text-black hover:bg-gray-500' : 'bg-gray-300 text-black hover:bg-gray-400'}`}>
                        Cancel
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${mode === 'dark' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                        Delete Account
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteAccountModal;