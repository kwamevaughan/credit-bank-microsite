import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    auth: {
        user: process.env.EMAIL_USER,  // Your authenticated sender email
        pass: process.env.EMAIL_PASS,  // Your email password or app-specific password
    }
});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, email, issue, message } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_USER, // This is the authenticated sender email
            to: 'analytics.growthpad@gmail.com',  // Set recipient to the correct email
            subject: `Support Request from ${name}, Credit Bank Diaspora Challenge`,  // Email subject
            html: `
                <p>Hello Credit Bank Support Team,</p>

                <p>We have received a support request from user, ${name} on the Diaspora challenge platform. Below are the details of their issue/complaint:</p>

                <table>
                    <tr>
                        <td><strong>Name:</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>Email:</strong></td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td><strong>Issue/Complaint:</strong></td>
                        <td>${issue}</td>
                    </tr>
                    <tr>
                        <td><strong>Message:</strong></td>
                        <td>${message}</td>
                    </tr>
                </table>
                <p></p>

                <p>Please review and respond to the user accordingly. If there are any additional details needed, do not hesitate to contact the user directly at ${email}.</p>

                <p>Best regards,<br/>Growthpad Consulting Group<br/>https://growthpad.co.ke</p>
            `,
            replyTo: email,  // Set Reply-To to the user's email
        };

        try {
            // Send the email
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
