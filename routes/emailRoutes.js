const express = require('express');
import nodemailer from 'nodemailer';
const router = express.Router();
router.post('/', async (req, res) => {
    const { name, email, message, signature } = req.body;
    // Validate input
    if (!name || !email || !message || !signature) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECEIVER,
            subject: 'New Submission',
            html: `<p>${message}</p><img src="${signature}" alt="Signature" />`,
        });
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});
module.exports = router;
