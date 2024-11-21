const express = require("express");
const route = express.Router();
const addCourseController = require("../controllers/addCourseController");
const middlewareController = require("../controllers/middlewareController");

route.patch('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, addCourseController.fix);
route.post('/add', middlewareController.verifyToken, middlewareController.checkAdmin, addCourseController.add);
route.get('/add', middlewareController.verifyToken, middlewareController.checkAdmin, addCourseController.renderAdd);
route.get('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, addCourseController.renderFix);
route.get('/', middlewareController.verifyToken, middlewareController.checkAdmin, addCourseController.render);

module.exports = route;