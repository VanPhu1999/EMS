const express = require("express");
const route = express.Router();
const scheduleController = require("../controllers/scheduleController");
const middlewareController = require("../controllers/middlewareController");

route.get('/', middlewareController.verifyToken, middlewareController.checkStudentAndTeacher, scheduleController.render);

module.exports = route;