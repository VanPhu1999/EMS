const express = require("express");
const route = express.Router();
const forgotPasswordController = require("../controllers/forgotPasswordController");

route.get('/', forgotPasswordController.render);
route.post('/', forgotPasswordController.sendEmail);

module.exports = route;