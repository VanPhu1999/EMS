const express = require("express");
const route = express.Router();
const courseDetailController = require("../controllers/courseDetailController");
const middlewareController = require("../controllers/middlewareController");
//cau hinh multer upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//cau hinh thu muc de luu
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = `src/public/uploads/${req.params.id}`;
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


route.patch('/:id/addTittle', middlewareController.verifyToken, upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), courseDetailController.addTittle);
route.patch('/:id/:contentId/fix', middlewareController.verifyToken, upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), courseDetailController.ContentFix);
route.patch('/:id/:contentId/delete', middlewareController.verifyToken, courseDetailController.ContentDelete);
route.get('/:id/:contentId/detail', middlewareController.verifyToken, courseDetailController.renderContentDetail);
route.get('/:id/:contentId/fix', middlewareController.verifyToken, courseDetailController.renderContentFix);
route.patch('/:id/:studentId/fixScores', middlewareController.verifyToken, courseDetailController.fixscores);
route.get('/:id/manageStudents', middlewareController.verifyToken, courseDetailController.renderManageStudents);
route.get('/:id', middlewareController.verifyToken, courseDetailController.render);

module.exports = route;