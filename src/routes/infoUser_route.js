const express = require("express");
const route = express.Router();
const infoUserController = require("../controllers/infoUserController");
const middlewareController = require("../controllers/middlewareController");

route.get('/', middlewareController.verifyToken, infoUserController.render);

module.exports = route;