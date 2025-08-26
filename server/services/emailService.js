import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvitationEmail = (email, token) => {
  const mobileLink = `schoolbridge://activate?token=${token}`;
  const webLink = `http://192.168.0.102/activate?token=${token}`;

  const mailOptions = {
    from: 'SchoolBridge <no-reply@schoolbridge.edu.bd>',
    to: email,
    subject: 'Activate Your SchoolBridge Account',
    html: `
      <p>You've been registered with SchoolBridge!</p>
      <p>Click to activate your account on mobile:</p>
      <a href="${mobileLink}">${mobileLink}</a>
      <p>Or activate on the web:</p>
      <a href="${webLink}">${webLink}</a>
      <p><strong>Link expires in 72 hours</strong></p>
    `,
  };

  return transporter.sendMail(mailOptions);
};
