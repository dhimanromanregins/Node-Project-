const insertSubject = require('../controllers/examController').insertSubject;
const express = require('express');
const app = express();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Register = require("../models/register");
const Otp = require("../models/otp");
const Otpreset = require("../models/resetotp");
const mailer = require('../helpers/mailer');
const bcryptjs = require('bcryptjs');
const config = require("../config/config");

const jwt = require("jsonwebtoken");
const { reset } = require("nodemon");

app.use(express.json());


const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10); // You need to specify the salt rounds
        return passwordHash;
    } catch (error) {
        throw new Error(error.message);
    }
}

const create_token = async (id) => {
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;
    } catch (error) {
        throw new Error(error.message);
    }
}

//Login
const user_login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userloginData = await Register.findOne({ email: email });
        if (userloginData) {
            const passwordMatch = await bcryptjs.compare(password, userloginData.password);
            if (passwordMatch) {
                const tokenDta = await create_token(userloginData._id);
                const userResult = {
                    _id: userloginData._id,
                    user_name: `${userloginData.firstname} ${userloginData.lastname}`,
                    email: userloginData.email,
                    password: userloginData.password,
                    token: tokenDta
                }
                const response = {
                    success: true,
                    msg: "User Details",
                    data: userResult
                }
                res.status(200).send(response);
            } else {
                res.status(200).send({ success: false, msg: "Password incorrect" });
            }
        } else {
            res.status(200).send({ success: false, msg: "Login details are incorrect" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
}

const sendUserPasswordResetOtp = async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).send({ success: false, msg: "Email Field Required" });
    }

    try {
        const useremailData = await Register.findOne({ email: email });
        
        if (!useremailData) {
            return res.status(404).send({ success: false, msg: "Email Does not exist" });
        }

        const secret = crypto.randomBytes(20).toString('hex') + process.env.SECRET_JWT;
        const token = jwt.sign({ userID: useremailData._id }, secret, {
            expiresIn: '15m'
        });

        const resetOtp = Math.floor(100000 + Math.random() * 900000); 
        const otpcreatedtime = new Date();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohapatraswarupa55@gmail.com',
                pass: 'unlr yisu xnya oqty'
            }
        });
        const mailOptions = {
            from: 'mohapatraswarupa55@gmail.com',
            to: email,
            subject: 'Password Reset Otp',
            text: `Your OTP for registration is: ${resetOtp}`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send({ success: false, msg: "Error sending email" });
            }
            console.log('Email sent: ' + info.response);

            try {
                // Create new Otpreset instance with token and restotp
                const sendresetOtp = new Otpreset({
                    token: token,
                    restotp: resetOtp,
                    email: email,
                    createdtime: otpcreatedtime
                });

                const registeredresetOtp = await sendresetOtp.save();
                setTimeout(async () => {
                    await Otpreset.deleteOne({ restotp: resetOtp, email: email });
                    console.log('Otp deleted after 6 minutes');
                }, 6 * 60 * 1000);
                

                return res.status(200).send({ success: true, msg: "Reset Otp sent to your email" });
            } catch (error) {
                console.error(error);
                return res.status(500).send({ success: false, msg: "Error saving Otp or user data" });
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

const insertUser = async (req, res) => {
    const { email, firstname, lastname, mobile, education, dateofbirth, password, confirmpassword } = req.body;

    try {
        const existingUser = await Register.findOne({ email: email });
        if (existingUser) {
            return res.status(400).send({ success: false, msg: "Email already exists" });
        }

        const existingUserMobile = await Register.findOne({ mobile: mobile });
        if (existingUserMobile) {
            return res.status(400).send({ success: false, msg: "Mobile Number already exists" });
        }

        if (password !== confirmpassword) {
            return res.status(400).send({ success: false, msg: "Both Password and Confirm Password are not Same" });
        }


        const secret = crypto.randomBytes(20).toString('hex') + process.env.SECRET_JWT;

        const generatedOtp = Math.floor(100000 + Math.random() * 900000);
        const createdtime = new Date();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mohapatraswarupa55@gmail.com',
                pass: 'unlr yisu xnya oqty'
            }
        });
        const mailOptions = {
            from: 'mohapatraswarupa55@gmail.com',
            to: email.trim().toLowerCase(),
            subject: 'Registration OTP - Please Verify',
            text: `Your OTP for registration is: ${generatedOtp}`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).send({ success: false, msg: "Error sending email" });
            }
            console.log('Email sent: ' + info.response);

            try {
                // Save OTP to database with password and confirmpassword
                const sendOtp = new Otp({
                    otp: generatedOtp,
                    email: email,
                    firstname: firstname,
                    lastname: lastname,
                    mobile: mobile,
                    education: education,
                    dateofbirth: dateofbirth,
                    password: password,
                    confirmpassword: confirmpassword,
                    createdtime: createdtime
                });
                const registeredOtp = await sendOtp.save();
                const otpExpirationTime = new Date(createdtime.getTime() + 6 * 60 * 1000);
                setTimeout(async () => {
                    await Otp.deleteOne({ otp: generatedOtp, email: email });
                    console.log('OTP deleted after 6 minutes');
                }, 6 * 60 * 1000);

                return res.status(200).send({ success: true, msg: "OTP sent to your email" });
            } catch (error) {
                console.error(error);
                return res.status(500).send({ success: false, msg: "Error saving OTP" });
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};


const verifyOtpAndSaveUser = async (req, res) => {
    const { otp } = req.body;

    try {
        const storedOtp = await Otp.findOne({ otp: otp });

        if (!storedOtp) {
            return res.status(400).send({ success: false, msg: "Invalid OTP" });
        }

        const { email, firstname, lastname, mobile, education, dateofbirth } = storedOtp;
        console.log("Stored OTP:", storedOtp);

        const otpExpirationTime = 5 * 60 * 1000;
        const currentTime = new Date().getTime();
        const otpTime = new Date(storedOtp.createdtime).getTime();

        if (currentTime - otpTime < otpExpirationTime) {
            const password = storedOtp.password;
            const confirmpassword = storedOtp.confirmpassword;

            if (!password || !confirmpassword) {
                return res.status(400).send({ success: false, msg: "Stored OTP does not contain password fields" });
            }

            const spassword = await securePassword(password);
            const sconfirmpassword = await securePassword(confirmpassword);

            if (password === confirmpassword) {
                const newUser = new Register({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    mobile: mobile,
                    education: education,
                    dateofbirth: dateofbirth,
                    password: spassword,
                    confirmpassword: sconfirmpassword
                });

                const savedUser = await newUser.save();
                await storedOtp.deleteOne();
                const response = {
                    success: true,
                    msg: "User registered successfully",
                    data: savedUser
                }
                res.status(200).send(response);
            } else {
                return res.status(400).send({ success: false, msg: "Passwords do not match" });
            }
        } else {
            return res.status(400).send({ success: false, msg: "OTP has expired" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ success: false, msg: "Error saving user data" });
    }
};

const verifyOTP = async (req, res) => {
    const { restotp } = req.body;

    try {
        const storedresetOtp = await Otpreset.findOne({ restotp: restotp });

        if (!storedresetOtp) {
            return res.status(400).send({ success: false, msg: "Invalid OTP" });
        }

        const resetotpExpirationTime = 5 * 60 * 1000;
        const currentTime = new Date().getTime();
        const restotpTime = new Date(storedresetOtp.createdtime).getTime();

        if (currentTime - restotpTime < resetotpExpirationTime) {
            return res.status(200).send({ success: true, msg: "OTP verified successfully" });
        } else {
            return res.status(400).send({ success: false, msg: "OTP has expired" });
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};

const updatePassword = async (req, res) => {
    const { password, confirmpassword } = req.body;
    let email = req.query.email;

    try {
        const updatingUser = await Register.findOne({ email: email });

        if (!updatingUser) {
            return res.status(400).send({ success: false, msg: "User not found" });
        }

        if (password === confirmpassword) {
            const newPasswordHash = await securePassword(password);
            const newconfirmPasswordHash = await securePassword(confirmpassword);

            // Update password using hashed password
            const update = await Register.updateOne({ email: email }, { $set: { password: newPasswordHash, confirmpassword: newconfirmPasswordHash } });

            if (update.modifiedCount > 0) {
                res.status(200).send({ success: true, msg: "Password updated successfully" });
            } else {
                res.status(400).send({ success: false, msg: "Failed to update password" });
            }
        } else {
            res.status(400).send({ success: false, msg: "Passwords do not match" });
        }
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).send({ success: false, msg: "Internal Server Error" });
    }
};


module.exports = {
    insertUser,
    verifyOtpAndSaveUser,
    user_login,
    sendUserPasswordResetOtp,
    verifyOTP,
    updatePassword
}
