const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    education: {
        type: String,
        required: true
    },
    dateofbirth: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    exams: [
        {
            examtype: {
                type: String,
                required: true
            },
            examname: {
                type: String
            },
            boardname: {
                type: String
            },
            classname: {
                type: String
            },
            subjects: [String]
        }
    ]
});

const Register = mongoose.model("User", userSchema);

module.exports = Register;
