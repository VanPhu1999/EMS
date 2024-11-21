const express = require("express");
const route = express.Router();
const userProfileController = require("../controllers//userProfileController");
const middlewareController = require("../controllers/middlewareController");

//cau hinh multer upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


route.patch('/:id', middlewareController.verifyToken, upload.fields([
    { name: 'img', maxCount: 1 }
]), userProfileController.fix);
route.get('/:id', middlewareController.verifyToken, userProfileController.render);

module.exports = route;