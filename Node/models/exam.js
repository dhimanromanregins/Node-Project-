const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    examname: {
        type: String,
        required: true
    },
    exam_short_name:
    {
        type: String,
        require: true
    },
    examtype: {
        type: String,
        required: true,
        enum: ["competitive", "collegeexam", "academicexam"]
    }
});

const Exams = mongoose.model("Exam", examSchema);

module.exports = Exams;
