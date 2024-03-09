const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.google.com",
    port: 465,
    secure: true,
    auth: {
        user: "mohapatraswarupa55@gmail.com",
        pass: "swarupa@siance",
    },
    tls:{
        rejectUnauthorized:false
    }
});

const sendMail = async (email, subject, content) => {
    try {
        const mailOptions = {
            from: "mohapatraswarupa55@gmail.com",
            to: email,
            subject: subject,
            html: content
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Mail Sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error Sending Email:', error);
        throw new Error('Failed to send email: ' + error.message);
    }
}

module.exports = {
    sendMail
};
