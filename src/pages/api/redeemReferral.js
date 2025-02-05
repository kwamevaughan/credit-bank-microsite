// pages/api/redeemReferral.js

import { supabase } from '/lib/supabase'; // Adjust the import path as necessary

export default async function handler(req, res) {
    // Check for POST request
    if (req.method === 'POST') {
        const { name, phoneNumber, email, referredBy } = req.body;

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

            // Get the referer URL
            const refererUrl = req.headers['referer'] || 'Unknown Referer';

            // Log activity in the user_activities table with the referrer's name and URL
            const referrerName = name || "Unknown Referrer"; // fallback if name not provided
            const activityType = `Referred User by name, ${referrerName} from ${refererUrl}`; // Include the referrer's name and URL in the activity type

            const { error: logActivityError } = await supabase
                .from('user_activities')
                .insert({
                    user_id: user.id, // Assuming the user table has an 'id' field
                    points: 50, // Points awarded
                    activity_type: activityType, // Activity description with the referrer's name and URL
                    created_at: new Date().toISOString() // Current timestamp
                });

            if (logActivityError) {
                return res.status(500).json({ error: 'Error logging user activity: ' + logActivityError.message });
            }

            // Successful response with structured information
            return res.status(200).json({
                "Points Awarded": 50,
                "Recipient": user.name,        // Recipient's name from the user object
                "Referee": referrerName,       // Referring user's name, or "Unknown Referrer"
                "URL/Platform": refererUrl      // The URL where the referral came from
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