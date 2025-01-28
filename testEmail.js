const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
});

transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'recipient-email@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
}, (err, info) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Email sent:', info.response);
  }
});
