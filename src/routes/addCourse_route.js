const express = require("express");
const route = express.Router();
const addCourseController = require("../controllers/addCourseController");
const middlewareController = require("../controllers/middlewareController");

route.patch('/:id', middlewareController.verifyToken, addCourseController.fix);
route.post('/add', middlewareController.verifyToken, addCourseController.add);
route.get('/add', middlewareController.verifyToken, addCourseController.renderAdd);
route.get('/:id', middlewareController.verifyToken, addCourseController.renderFix);
route.get('/', middlewareController.verifyToken, addCourseController.render);

module.exports = route;