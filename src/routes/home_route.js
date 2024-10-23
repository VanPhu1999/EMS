const express = require("express");
const route = express.Router();
const homeController = require("../controllers/homeController");
const middlewareController = require("../controllers/middlewareController");

route.get('/', middlewareController.verifyToken, homeController.render);

module.exports = route;