const express = require("express");
const route = express.Router();
const gpaController = require("../controllers/gpaController");
const middlewareController = require("../controllers/middlewareController");

route.get('/', middlewareController.verifyToken, middlewareController.checkStudent, gpaController.render);

module.exports = route;