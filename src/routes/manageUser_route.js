const express = require("express");
const route = express.Router();
const manageUserController = require("../controllers/manageUserController");
const middlewareController = require("../controllers/middlewareController");

route.get('/add', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.renderAdd);
route.post('/add', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.add);
route.patch('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.fix);
route.delete('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.deleteUser);
route.get('/:id', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.renderFix);
route.get('/', middlewareController.verifyToken, middlewareController.checkAdmin, manageUserController.render);

module.exports = route;