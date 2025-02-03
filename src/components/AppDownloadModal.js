import React from 'react';
import Modal from './Modal'; // Import the Modal component
import Image from 'next/image';
import Link from 'next/link'; // Import Link from nextjs

const AppDownloadModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Download Mobile App">
            <p className="text-center mb-4">
                Download the Credit Bank mobile app to earn points.
            </p>
            <div className="flex justify-center gap-x-14">
                <div>
                    <Link
                        href="https://play.google.com/store/apps/details?id=co.ke.ekenya.creditbank"
                        passHref
                    >
                        <Image
                            src="/assets/images/android.svg"
                            alt="Android"
                            width={75}
                            height={75}
                            className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"
                        />
                        <span>Android users</span>
                    </Link>
                </div>

                <div>
                    <Link
                        href="https://apps.apple.com/us/app/credit-bank-cb-konnect/id1469515952"
                        passHref
                    >
                        <Image
                            src="/assets/images/apple.svg"
                            alt="Apple"
                            width={75}
                            height={75}
                            className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"
                        />
                        <span>Apple users</span>
                    </Link>
                </div>
            </div>
        </Modal>
    );
};

export default AppDownloadModal;
