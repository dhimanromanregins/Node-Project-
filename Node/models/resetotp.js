const mongoose = require("mongoose");

const resetotpSchema = new mongoose.Schema({
    restotp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    createdtime: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    }
});

const resetotps = mongoose.model("Resetotp", resetotpSchema);

module.exports = resetotps;
