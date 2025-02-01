import nodemailer from 'nodemailer';
import { supabase } from '/lib/supabase'; // Adjust the import if necessary

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // e.g. smtp.example.com
    port: parseInt(process.env.EMAIL_PORT, 10), // e.g. 587
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS  // Your email password
    }
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if the email exists in the users table
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Extract relevant data from the user - updated to use referral_code
        const { referral_code, name } = data; // Use referral_code instead of uniqueCode

        // Check if the referral code exists
        if (!referral_code) {
            return res.status(400).json({ error: 'No referral code found for this user.' });
        }

        // Prepare the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset',
            html: `
                <p>Hello ${name},</p>
                <p>Your referral code is: <strong>${referral_code}</strong>.</p>
                <p>This referral code will also be used to refer others to join, which will earn you points.</p>
                <p>Please <a href="https://credit-bank-microsite.vercel.app/participate" target="_blank">click here to log in</a>.</p>
                <p>We look forward to seeing you on the platform and wish you the best of luck!</p>
                <p>Best regards,<br/>Credit Bank, Kenya</p>            `
        };

        try {
            // Send the email
            await transporter.sendMail(mailOptions);
            return res.status(200).json({ message: 'Email has been sent successfully.' });
        } catch (sendError) {
            console.error('Error sending email:', sendError);
            return res.status(500).json({ error: 'Error sending email. Please try again later.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}