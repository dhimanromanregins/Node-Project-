const Exams = require('../models/exam');
const Competitiveexam = require('../models/competitiveexam');
const Register = require("../models/register");
const Collegeexam = require('../models/collegeexam');
const Boards = require('../models/board');
const Class = require('../models/class');
const Academicexam = require('../models/academicexam');

const insertExam = async (req, res) => {
    try {
        const { examName, examType, exam_short_name } = req.body; // Destructure the request body

        if (!examName && !examType && !exam_short_name) {
            return res.status(400).json({ message: 'Both examName and examType are required.' });
        }

        const registerExam = new Exams({
            examname: examName, // Ensure correct field names
            examtype: examType,
            exam_short_name: exam_short_name,
        });

        const registeredExam = await registerExam.save();
        
        return res.status(200).json({ message: "Exam created successfully" });
    } catch (error) {
        console.error(error);
        return res.status(400).send(error.message);
    }
};

const insertBoard = async(req,res)=>
{
    try{
        const { boardName } = req.body; 
        if (!boardName) {
            return res.status(400).json({ message: 'boardName is required.' });
        }
        const registerBoard = new Boards({
            boardname: boardName,
        });

        const registeredBoard = await registerBoard.save();
        
        return res.status(200).json({ message: "Board created successfully" });
    }
    catch(error)
    {
        console.error(error);
        return res.status(400).send(error.message);
    }   
}

const getBoard = async (req,res)=>
{
    try
    {
        const getBoard = await Boards.find({ });
        return res.json(getBoard);
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });   
    }

}

const insertClass = async (req,res)=>
{
    try{
        const { boardId, boardName, className } = req.body;
        if(!boardId || !boardName || !className)
        {
            return res.status(400).json({ message: "All the fields are required"});
        }

        const registerClass = new Class(
            {
                boardid : boardId,
                boardname : boardName,
                classname : className,
            }
        );

        const registeredClass = await registerClass.save();
        return res.status(200).json({message: 'Class inserted Successfully'});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" }); 
    }
}

const getClass = async (req,res)=>
{
    try
    {
        const getClass = await Class.find({ boardid:req.body.boardId});
        return res.json(getClass);
    }
    catch(error){
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });   
    }

}

const combinedCompetitiveExamAndInsertSubject = async (req, res) => {
    try {
        const { action, subjects, examid, userid } = req.body;
        if (!action) {
            return res.status(400).json({ message: 'Action is required.' });
        }

        if (action === 'fetchCompetitiveExams') {
            const competitiveExams = await Exams.find({ examtype: "competitive" });
            return res.json(competitiveExams);
        } else if (action === 'insertSubject') {

            if (!subjects || !examid) {
                return res.status(400).json({ message: 'Both subjectname and examid are required.' });
            }
            if(!Array.isArray(subjects))
            {
                return res.status(400).json({ message: 'Subjects should be an array.' });
            }

            const subjectsToInsert = subjects.map(subjectname => ({
                subjectname: subjectname,
                examid: examid,
                userid: userid,
            }));

            const registeredSubjects = await Competitiveexam.insertMany(subjectsToInsert);
            const exam = await Exams.findOne({ _id: examid });
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found.' });
            }
             let examName = exam.examname;
            const updateRegister = await Register.findOneAndUpdate(
                { _id: userid },
                {
                    $push: {
                        exams: {
                            examtype: "competitive",
                            examname: examName,
                            subjects: subjectsToInsert.map(subject => subject.subjectname) // Use subjectsToInsert here
                        }
                    }
                },
                { new: true }
            );
                
            if (!updateRegister) {
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ message: "Subject created and user updated successfully" });
            // return res.status(200).json({ message: "Subject created successfully" });
        } else {
            return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const combinedCollegeExamAndInsertSubject = async (req, res) => {
    try {
        const { action, subjects, examid, userid } = req.body;

        if (!action) {
            return res.status(400).json({ message: 'Action is required.' });
        }

        if (action === 'fetchCollegeExams') {
            const collegeExams = await Exams.find({ examtype: "collegeexam" });
            return res.json(collegeExams);
        } else if (action === 'insertSubject') {

            if (!subjects || !examid) {
                return res.status(400).json({ message: 'Both subjectname and examid are required.' });
            }

            if(!Array.isArray(subjects))
            {
                return res.status(400).json({ message: 'Subjects should be an array.' });  
            }

            const registercollegeSubject = subjects.map(subjectname => ({
                subjectname: subjectname,
                examid: examid,
                userid: userid,
            }));

            const registeredcollegeExam = await  Collegeexam.insertMany(registercollegeSubject);

            const exam = await Exams.findOne({_id: examid});
            if (!exam) {
                return res.status(404).json({ message: 'Exam not found.' });
            }

            let examName = exam.examname;

            const updateRegisteredexam = await Register.findOneAndUpdate(
                {_id:userid},
                {
                    $push: {
                        exams: {
                            examtype: "collegeexam",
                            examname: examName,
                            subjects: registercollegeSubject.map(subject => subject.subjectname) // Use subjectsToInsert here
                        }
                    }
                },
                { new: true }
            );
            if (!updateRegisteredexam) {
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ message: "Subject created and user updated successfully" });
        } else {
            return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const combinedAcademicExamAndInsertSubject = async (req, res) => {
    try {
        const { action, academicsubjects, boardid, userid, classid } = req.body;

        if (!action) {
            return res.status(400).json({ message: 'Action is required.' });
        }

        if (action === 'fetchBoard') {
            const getBoard = await Boards.find({ });
            return res.json(getBoard);
        }
        else if(action === 'fetchClass'){
            const getClass = await Class.find({ boardid:req.body.boardId});
            return res.json(getClass);
        } else if (action === 'insertSubject') {

            if (!academicsubjects || !classid) {
                return res.status(400).json({ message: 'Both subjectname and examid are required.' });
            }

            if(!Array.isArray(academicsubjects))
            {
                return res.status(400).json({ message: 'Subjects should be an array.' });  
            }

            const registeracademicSubject = academicsubjects.map(academicsubjectname =>({
                academicsubjectname: academicsubjectname,
                classid: classid,
                boardid: boardid,
                userid: userid,
            })
            );

            const registeredacademicExam = await Academicexam.insertMany(registeracademicSubject);
            const board = await Boards.findOne({_id: boardid});
            if (!board) {
                return res.status(404).json({ message: 'Board not found.' });
            }

            let boardname = board.boardname;

            const className = await Class.findOne({_id: classid});
            if (!className) {
                return res.status(404).json({ message: 'Class not found.' });
            }

            let classname = className.classname;

            const updateRegisteredexam = await Register.findOneAndUpdate(
                {_id:userid},
                {
                    $push: {
                        exams: {
                            examtype: "academicexam",
                            boardname: boardname,
                            classname: classname,
                            subjects: registeracademicSubject.map(subject => subject.academicsubjectname) // Use subjectsToInsert here
                        }
                    }
                },
                { new: true }
            );
            if (!updateRegisteredexam) {
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ message: "Academic Subject created and user updated successfully" });
        } else {
            return res.status(400).json({ message: 'Invalid action.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
  

const academicExam = async (req, res) => {
try {
    const competitiveExams = await Exams.find({ examtype: "academicexam" });
    res.json(competitiveExams);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

module.exports = {
    insertExam,
    combinedCollegeExamAndInsertSubject,
    combinedCompetitiveExamAndInsertSubject,
    academicExam,
    insertBoard,
    getClass,
    insertClass,
    getBoard,
    combinedAcademicExamAndInsertSubject
};
