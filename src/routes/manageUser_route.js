const express = require("express");
const route = express.Router();
const manageUserController = require("../controllers/manageUserController");
const middlewareController = require("../controllers/middlewareController");

route.get('/add', middlewareController.verifyToken, manageUserController.renderAdd);
route.post('/add', middlewareController.verifyToken, manageUserController.add);
route.patch('/:id', middlewareController.verifyToken, manageUserController.fix);
route.get('/:id', middlewareController.verifyToken, manageUserController.renderFix);
route.get('/', middlewareController.verifyToken, manageUserController.render);

module.exports = route;