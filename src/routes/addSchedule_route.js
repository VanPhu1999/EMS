const express = require("express");
const route = express.Router();
const addScheduleController = require("../controllers/addScheduleController");
const middlewareController = require("../controllers/middlewareController");

route.post('/add', middlewareController.verifyToken, addScheduleController.add);
route.get('/add', middlewareController.verifyToken, addScheduleController.renderAdd);
route.delete('/:id/delete', middlewareController.verifyToken, addScheduleController.delete);
route.patch('/:id', middlewareController.verifyToken, addScheduleController.fix);
route.get('/:id', middlewareController.verifyToken, addScheduleController.renderFix);
route.get('/', middlewareController.verifyToken, addScheduleController.render);

module.exports = route;