const express = require("express");
const route = express.Router();
const resetPasswordController = require("../controllers/resetPasswordController");
const middlewareController = require("../controllers/middlewareController");

route.get('/:id', middlewareController.verifyForgotToken, resetPasswordController.render);
route.patch('/:id', middlewareController.verifyForgotToken, resetPasswordController.reset);

module.exports = route;