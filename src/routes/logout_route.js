const express = require("express");
const route = express.Router();
const logoutController = require("../controllers/logoutController");
const middlewareController = require("../controllers/middlewareController");

route.post('/', middlewareController.verifyToken, logoutController.logout);

module.exports = route;