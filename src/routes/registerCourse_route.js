const express = require("express");
const route = express.Router();
const registerCourseController = require("../controllers/registerCourseController");
const middlewareController = require("../controllers/middlewareController");

route.patch('/:id/delete', middlewareController.verifyToken, registerCourseController.unRegister);
route.patch('/:id', middlewareController.verifyToken, registerCourseController.register);
route.get('/list', middlewareController.verifyToken, registerCourseController.renderRegistred);
route.get('/', middlewareController.verifyToken, registerCourseController.render);

module.exports = route;