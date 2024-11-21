const express = require("express");
const route = express.Router();
const courseDetailController = require("../controllers/courseDetailController");
const middlewareController = require("../controllers/middlewareController");

//cau hinh multer upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


route.patch('/:id/addTittle', middlewareController.verifyToken, middlewareController.checkTeacher, upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), courseDetailController.addTittle);
route.patch('/:id/:contentId/fix', middlewareController.verifyToken, middlewareController.checkTeacher, upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), courseDetailController.ContentFix);
route.patch('/:id/:contentId/delete', middlewareController.verifyToken, middlewareController.checkTeacher, courseDetailController.ContentDelete);
route.get('/:id/:contentId/detail', middlewareController.verifyToken, courseDetailController.renderContentDetail);
route.patch('/:id/:studentId/fixScores', middlewareController.verifyToken, middlewareController.checkTeacher, courseDetailController.fixscores);
route.get('/:id/manageStudents', middlewareController.verifyToken, middlewareController.checkAdminAndTeacher, courseDetailController.renderManageStudents);
route.get('/:id', middlewareController.verifyToken, courseDetailController.render);

module.exports = route;