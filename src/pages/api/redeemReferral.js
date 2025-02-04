// pages/api/redeemReferral.js

import { supabase } from '/lib/supabase'; // Adjust the import path as necessary

export default async function handler(req, res) {
    // Check for POST request
    if (req.method === 'POST') {
        const { name, phoneNumber, email, referredBy } = req.body;

        // Validate input
        if (!name || !phoneNumber || !email || !referredBy) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        try {
            // Check if the referredBy code exists in the users table
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('referral_code', referredBy)
                .single();

            if (userError || !user) {
                return res.status(404).json({ error: 'Referred by code is invalid.' });
            }

            // Update points for the user if the referral is valid
            const updatedPoints = user.points + 50; // Add 50 points
            const { error: updatePointsError } = await supabase
                .from('users')
                .update({ points: updatedPoints })
                .eq('referral_code', referredBy);

            if (updatePointsError) {
                return res.status(500).json({ error: 'Error updating user points: ' + updatePointsError.message });
            }

            // Increment the referral count
            const updatedReferralCount = user.referral_count + 1; // Increment by 1
            const { error: updateReferralCountError } = await supabase
                .from('users')
                .update({ referral_count: updatedReferralCount })
                .eq('referral_code', referredBy);

            if (updateReferralCountError) {
                return res.status(500).json({ error: 'Error updating referral count: ' + updateReferralCountError.message });
            }

            // Successful response
            return res.status(200).json({ message: 'Points awarded and referral count incremented successfully!' });

        } catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}