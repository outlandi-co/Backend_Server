const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
router.post('/', async (req, res) => {
  const { name, email, message, signature } = req.body;
  if (!name || !email || !message || !signature) {
    return res.status(400).json({ message: 'All fields are required, including a signature.' });
  }
  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER, // Your email to receive submissions
      subject: 'New Form Submission with Signature',
      html: `
        <h3>Form Details</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <h3>Signature:</h3>
        <img src="${signature}" alt="User Signature" />
      `,
    };
    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending form submission.' });
  }
});
module.exports = router;
