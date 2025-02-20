import { useState, useEffect } from 'react';
import { supabase } from '/lib/supabase';
import { toast } from 'react-toastify';

const useAccountOpening = (token, defaultName = '') => {
    const [accountType, setAccountType] = useState('');
    const [name, setName] = useState(defaultName);
    const [referrer, setReferrer] = useState('');
    const [referralCodeValid, setReferralCodeValid] = useState(true);
    const [isSelfReferral, setIsSelfReferral] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [referrerName, setReferrerName] = useState(''); // Add this line

    // Update name when defaultName changes
    useEffect(() => {
        if (defaultName) {
            setName(defaultName);
        }
    }, [defaultName]);


    const notify = (message) => toast(message);

    const validateReferralCode = async (code) => {
        // If code is empty, it's valid (since it's optional)
        if (!code) {
            setReferralCodeValid(true);
            setIsSelfReferral(false);
            setReferrerName('');
            return true;
        }

        setIsValidating(true);

        try {
            // First check if the entered code exists in the users table
            const { data: referrerData, error: referrerError } = await supabase
                .from('users')
                .select('id, referral_code, name')
                .eq('referral_code', code)
                .single();

            if (referrerError) {
                // No user found with this referral code
                setReferralCodeValid(false);
                setIsSelfReferral(false);
                setReferrerName('');
                return false;
            }

            // Now check if this is the logged-in user's code
            const { data: currentUserData, error: currentUserError } = await supabase
                .from('users')
                .select('id, referral_code')
                .eq('id', token)
                .single();

            if (currentUserError) {
                console.error('Error fetching current user:', currentUserError.message);
                setReferralCodeValid(false);
                setReferrerName('');
                return false;
            }

            // Check if the referral code belongs to the current user
            if (currentUserData.referral_code === code) {
                setReferralCodeValid(false);
                setIsSelfReferral(true);
                setReferrerName('');
                return false;
            }

            // If we get here, the code is valid and belongs to another user
            setReferralCodeValid(true);
            setIsSelfReferral(false);
            setReferrerName(referrerData.name);
            return true;

        } catch (error) {
            console.error('Error validating referral code:', error.message);
            setReferralCodeValid(false);
            setReferrerName('');
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleReferralCodeChange = async (e) => {
        const code = e.target.value.trim();
        setReferrer(code);

        // Reset validation states when input is cleared
        if (!code) {
            setReferralCodeValid(true);
            setIsSelfReferral(false);
            return;
        }

        // Add slight delay to prevent too frequent validation calls
        setTimeout(async () => {
            await validateReferralCode(code);
        }, 300);
    };

    const handleSubmit = async (e) => {

        if (isValidating) {
            notify('Please wait while we validate the referral code...');
            return;
        }

        // Final validation check before submission
        if (referrer) {
            const isValid = await validateReferralCode(referrer);
            if (!isValid) {
                if (isSelfReferral) {
                    notify('You cannot use your own referral code');
                } else {
                    notify('Please enter a valid referral code or leave it empty');
                }
                return;
            }
        }

        if (!accountType || !name) {
            notify('Please fill in all required fields!');
            return;
        }

        // Rest of your submit logic remains the same...
        try {
            // Check for existing requests
            const { data: existingRequests, error: checkError } = await supabase
                .from('account_opening')
                .select('*')
                .eq('user_id', token)
                .eq('account_type', accountType);

            if (checkError) throw checkError;

            if (existingRequests?.length > 0) {
                notify(`You have already submitted a request for this account type.`);
                return;
            }

            // Insert account opening request
            const { error: insertError } = await supabase
                .from('account_opening')
                .insert([
                    {
                        user_id: token,
                        account_type: accountType,
                        name: name,
                        referral_code: referrer || null,
                        status: 'Pending',
                        points: 200,
                    }
                ]);

            if (insertError) throw insertError;

            notify('Account opening request submitted successfully!');

            // Reset form
            setAccountType('');
            setName('');
            setReferrer('');
            setReferralCodeValid(true);
            setIsSelfReferral(false);

        } catch (error) {
            console.error('Error opening account:', error.message);
            notify('An error occurred while processing your request.');
        }
    };

    return {
        accountType,
        setAccountType,
        name,
        setName,
        referrer,
        setReferrer,
        referralCodeValid,
        setReferralCodeValid,
        isSelfReferral,
        isValidating,
        referrerName,
        handleReferralCodeChange,
        handleSubmit,
    };
};

export default useAccountOpening;