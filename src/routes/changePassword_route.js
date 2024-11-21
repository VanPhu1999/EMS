const express = require("express");
const route = express.Router();
const changePasswordController = require("../controllers/changePasswordController");
const middlewareController = require("../controllers/middlewareController");

route.get('/', middlewareController.verifyToken, changePasswordController.render);
route.patch('/', middlewareController.verifyToken, changePasswordController.reset);

module.exports = route;