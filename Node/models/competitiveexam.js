const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subjectname: {
        type: String,
        required: true
    },
    examid: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: true
    }
});

const Competitiveexams = mongoose.model("Competitiveexam", subjectSchema);

module.exports = Competitiveexams;
