const express = require("express");
const route = express.Router();
const registerCourseController = require("../controllers/registerCourseController");
const middlewareController = require("../controllers/middlewareController");

route.patch('/:id/delete', middlewareController.verifyToken, middlewareController.checkStudent, registerCourseController.unRegister);
route.patch('/:id', middlewareController.verifyToken, middlewareController.checkStudent, registerCourseController.register);
route.get('/list', middlewareController.verifyToken, middlewareController.checkStudent, registerCourseController.renderRegistred);
route.get('/', middlewareController.verifyToken, middlewareController.checkStudent, registerCourseController.render);

module.exports = route;