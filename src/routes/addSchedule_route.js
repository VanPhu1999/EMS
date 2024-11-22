const express = require("express");
const route = express.Router();
const addScheduleController = require("../controllers/addScheduleController");
const middlewareController = require("../controllers/middlewareController");

route.post('/add', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.add);
route.get('/add', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.renderAdd);
route.delete('/:id/delete', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.delete);
route.patch('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.fix);
route.get('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.renderFix);
route.get('/', middlewareController.verifyToken, middlewareController.checkAdmin, addScheduleController.render);

module.exports = route;