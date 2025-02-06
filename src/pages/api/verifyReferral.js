// pages/api/verifyReferral.js

import { supabase } from '/lib/supabase'; // Adjust the import path as necessary

export default async function handler(req, res) {
    // Check for POST request
    if (req.method === 'POST') {
        const { referredBy } = req.body;

        // Validate input — only referredBy is mandatory
        if (!referredBy) {
            return res.status(400).json({ error: 'The referredBy field is required.' });
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

            // Successful response with user information
            return res.status(200).json({
                "isValid": true,
                "userId": user.id,
                "name": user.name,
                "email": user.email,
                "phoneNumber": user.phoneNumber,
            });

        } catch (error) {
            return res.status(500).json({ error: 'An unexpected error occurred: ' + error.message });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}