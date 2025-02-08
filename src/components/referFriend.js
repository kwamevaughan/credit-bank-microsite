import { useEffect, useState } from 'react';
import { supabase } from '/lib/supabase';
import Image from 'next/image';
import TermsAndConditionsModal from './TermsAndConditionsModal';

const Referral = ({ token, mode, toggleMode, notify }) => {
    const [userName, setUserName] = useState('');
    const [userPoints, setUserPoints] = useState(0);
    const [referralCode, setReferralCode] = useState('');
    const [copied, setCopied] = useState(false); // State to track copy action
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility


    useEffect(() => {
        if (!token) {
            return; // Do nothing if token is not set
        }

        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, points, referral_code')
                .eq('id', token)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
            } else {
                setUserName(data.name);
                setUserPoints(data.points);
                setReferralCode(data.referral_code);
            }
        };

        fetchUserData();
    }, [token]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true); // Set copied state to true
            notify && notify("Referral code copied!");

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const getShareLinks = (referralCode) => {
        if (typeof window !== 'undefined') {
            // Only use window if running on the client
            const baseUrl = `/participate?referralCode=${referralCode}`;
            const fullUrl = `${window.location.origin}${baseUrl}`; // Get the full URL dynamically

            const message = `Hi 👋, Join the Credit Bank Diaspora Campaign and stand a chance to win exciting prizes! Follow the link: ${fullUrl} or use my referral code *${referralCode}* when signing up.`;
            return {
                whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
                instagram: `https://www.instagram.com/?url=${encodeURIComponent(fullUrl)}`,
                email: `mailto:?subject=Check+out+this+platform&body=${encodeURIComponent(message)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
                twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(message)}`,
            };
        } else {
            // Provide fallback links in case of SSR (server-side rendering)
            return {
                whatsapp: `https://wa.me/?text=Join+the+Credit+Bank+Diaspora+Campaign!`,
                instagram: `https://www.instagram.com/`,
                email: `mailto:?subject=Check+out+this+platform&body=Join+the+Credit+Bank+Diaspora+Campaign!`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=`,
                twitter: `https://twitter.com/intent/tweet?url=&text=Join+the+Credit+Bank+Diaspora+Campaign!`,
            };
        }
    };


    const shareLinks = getShareLinks(referralCode);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };


    return (
        <div className={`${mode === 'dark' ? 'bg-[#101720] text-white' : 'bg-[#0CB4AB] text-black'} rounded-lg py-6 px-4 md:px-0 transition-all duration-300 ease-in-out`}>
            <div className="flex flex-col space-y-2">
                <div className="px-8 py-2">
                    <div className="flex pb-4 justify-center">
                        <h2 className="text-3xl sm:text-3xl md:text-3xl font-extrabold text-white text-center">
                            Refer a Friend & Earn <br/> Bonus Points!
                        </h2>
                    </div>

                    <p className="font-normal text-sm text-white text-center pb-4">
                        Share your referral link and get 15 points for every successful invite.
                    </p>
                </div>

                <div className="flex justify-center pb-4">
                    <span
                        className={`${mode === 'dark' ? 'bg-[#2a3b4f] text-white border-[#ff9409]' : 'bg-white text-black border-[#ff9409]'} 
            uppercase font-bold border-2 rounded-lg py-2 w-3/5 px-4`}>
        {referralCode}
    </span>

                    <button onClick={handleCopy}
                            className="bg-[#ff9409] text-white rounded-lg py-2 px-8 transition-all duration-300 ease-in-out hover:bg-[#ff7f00]">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div className="flex justify-center">
                    <p className="font-normal text-sm text-white text-center pb-4">
                        Or share via
                    </p>
                </div>

                <div className="flex justify-center pb-4 gap-x-2">
                    <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">
                        <Image src="/assets/images/social/whatsapp.svg" alt="WhatsApp" width={50} height={50}
                               className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"/>
                    </a>
                    <a href={shareLinks.instagram} target="_blank" rel="noopener noreferrer" title="Share on Instagram">
                        <Image src="/assets/images/social/instagram.svg" alt="Instagram" width={50} height={50}
                               className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"/>
                    </a>
                    <a href={shareLinks.email} target="_blank" rel="noopener noreferrer" title="Share via Email">
                        <Image src="/assets/images/social/email.svg" alt="Email" width={50} height={50}
                               className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"/>
                    </a>
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" title="Share on Facebook">
                        <Image src="/assets/images/social/facebook.svg" alt="Facebook" width={50} height={50}
                               className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"/>
                    </a>
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" title="Share on Twitter">
                        <Image src="/assets/images/social/x.svg" alt="X" width={50} height={50}
                               className="transition-transform transform hover:translate-y-[-5px] duration-500 ease-in-out"/>
                    </a>
                </div>
                <div className="flex justify-center">
                    <p
                        className="font-bold text-sm text-white text-center pb-4 cursor-pointer hover:underline"
                        onClick={openModal} // Open modal on click
                    >
                        Terms and Conditions
                    </p>
                </div>
                <TermsAndConditionsModal isOpen={isModalOpen} onClose={closeModal} />
            </div>
        </div>
    );
};

export default Referral;