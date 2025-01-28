const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, signature } = req.body;

  // Validate input
  if (!name || !email || !message || !signature) {
    return res.status(400).json({ message: 'All fields are required, including a signature.' });
  }

  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable for your email
        pass: process.env.EMAIL_PASS, // Use environment variable for your app password
      },
    });

    // Define email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address (your email)
      to: email, // Recipient email (from request body)
      subject: 'New Submission',
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Signature:</strong></p>
        <img src="${signature}" alt="Signature" style="max-width: 100%; height: auto;" />
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully to:', email);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Error sending email:', err.message);
    res.status(500).json({ message: 'Failed to send email. Please try again later.' });
  }
});

module.exports = router;
