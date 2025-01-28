import nodemailer from 'nodemailer';

const sendTestEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'recipient-email@gmail.com', // Replace with your test recipient email
            subject: 'Test Email',
            text: 'This is a test email sent from the server.',
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', result.response);
    } catch (error) {
        console.error('❌ Error sending test email:', error.message);
    }
};

sendTestEmail();
