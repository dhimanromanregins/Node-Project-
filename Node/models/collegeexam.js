const mongoose = require("mongoose");

const collegesubjectSchema = new mongoose.Schema({
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

const collegeexams = mongoose.model("Collegeexam", collegesubjectSchema);

module.exports = collegeexams;
