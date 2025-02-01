// pages/api/sendEmail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // using environment variable for host
    port: process.env.EMAIL_PORT, // using environment variable for port
    secure: process.env.EMAIL_SECURE, // using environment variable for secure
    auth: {
        user: process.env.EMAIL_USER, // using environment variable for user
        pass: process.env.EMAIL_PASS  // using environment variable for password
    }
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, name, uniqueCode } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER, // using environment variable
            to: email,
            subject: 'Credit Bank Diaspora Champions Challenge', // updated subject
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for registering to participate in the Credit Bank Diaspora Champions Challenge!</p>
                <p>Your referral code is: <strong>${uniqueCode}</strong>.</p>
                <p>You will log in to the platform with your email: <strong>${email}</strong> and password: <strong>${uniqueCode}</strong>.</p>
                <p>This referral code will also be used to refer others to join, which will earn you points.</p>
                <p>Please <a href="https://credit-bank-microsite.vercel.app/participate" target="_blank">click here to log in</a>.</p>
                <p>We look forward to seeing you on the platform and wish you the best of luck!</p>
                <p>Best regards,<br/>Credit Bank, Kenya</p>
            ` // updated message using HTML format with login link
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}