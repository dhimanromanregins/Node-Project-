const mongoose = require("mongoose");

const calssSchema = new mongoose.Schema({
    boardid: {
        type: String,
        required: true
    },
    boardname: {
        type: String,
        required: true
    },
    classname: {
        type: String,
        required: true
    }
});

const classes = mongoose.model("Class", calssSchema);

module.exports = classes;
