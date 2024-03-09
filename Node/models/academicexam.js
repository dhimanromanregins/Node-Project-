const mongoose = require("mongoose");

const academicsubjectSchema = new mongoose.Schema({
    academicsubjectname: {
        type: String,
        required: true
    },
    boardid: {
        type: String,
        required: true
    },
    classid: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    }
});

const academicexams = mongoose.model("Academicexam", academicsubjectSchema);

module.exports = academicexams;
