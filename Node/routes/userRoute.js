const express = require("express");
const user_route = express.Router();

const { insertUser, user_login } = require('../controllers/userController');

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const userController = require("../controllers/userController");
const examController = require("../controllers/examController");

user_route.post('/register', userController.insertUser);
user_route.post('/verifyOtpAndSaveUser', userController.verifyOtpAndSaveUser);
user_route.get('/login', userController.user_login);
user_route.post('/resetsetotp', userController.sendUserPasswordResetOtp);
user_route.post('/verifyotp', userController.verifyOTP);
user_route.post('/updatepassword', userController.updatePassword);

user_route.post('/exam', examController.insertExam);
user_route.post('/board', examController.insertBoard);
user_route.post('/class', examController.insertClass);
user_route.get('/board/getdetails', examController.getBoard);
user_route.get('/class/getdetails', examController.getClass);
user_route.get('/academicexam', examController.academicExam);
user_route.post('/combinedCompetitiveExamAndInsertSubject', examController.combinedCompetitiveExamAndInsertSubject);
user_route.post('/combinedCollegeExamAndInsertSubject', examController.combinedCollegeExamAndInsertSubject);
user_route.post('/combinedAcademicExamAndInsertSubject', examController.combinedAcademicExamAndInsertSubject);

module.exports = user_route;
