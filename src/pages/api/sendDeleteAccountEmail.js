import nodemailer from 'nodemailer';

const sendDeleteAccountEmail = async (email, name) => {
    try {
        // Create a transporter using your SMTP settings
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Set up the email content
        const mailOptions = {
            from: process.env.EMAIL_USER, // sender address
            to: email, // recipient address
            subject: 'We Are Sorry to See You Go', // subject
            html: `
                <p>Dear ${name},</p>
                <p>We’re sorry to see you leave the competition. Your account has been permanently deleted.</p>
                <p>If you wish to join the competition again, you can recreate an account by visiting the following link:</p>
                <p><a href="https://credit-bank-microsite.vercel.app/participate">Join the competition again</a></p>
                <p>Best regards,<br>The Credit Bank Team</p>
            `, // HTML email content
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log('Account deletion email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send account deletion email');
    }
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and Name are required' });
        }

        try {
            // Call the function to send the email
            await sendDeleteAccountEmail(email, name);
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
