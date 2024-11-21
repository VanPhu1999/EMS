const jwt = require('jsonwebtoken');
const User = require('../models/users')

const middleware = {
    verifyToken: async (req, res, next) => {
        const access_token = req.cookies.access_token;
        if (access_token) {
            jwt.verify(access_token, process.env.ACCESS_KEY, async (err, user) => {
                if (err) {
                    return res.redirect("login");
                }
                req.user = user;
                const userCheck = await User.findById(req.user.id);
                if (userCheck) next();
                else res.redirect("/login");
            })
        } else {
            res.redirect("/login");
        }
    },
    verifyForgotToken: async (req, res, next) => {
        const user = await User.findById(req.params.id).lean();
        const resetPassToken = user.resetPassToken;
        if (resetPassToken.length > 0) {
            jwt.verify(resetPassToken, process.env.FORGOT_PASS_KEY, (err, user) => {
                if (err) {
                    return res.render("auth/expired");
                }
                req.user = user;
                next();
            })
        } else res.render("auth/expired");
    },
    checkStudent: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "student") next();
        else {
            res.send("Chức năng này chỉ dành cho sinh viên!!!");
        }
    },
    checkTeacher: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "teacher") next();
        else {
            res.send("Chỉ dành cho giảng viên!!!");
        }
    },
    checkAdmin: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "admin") next();
        else {
            res.send("Chỉ dành cho admin!!!");
        }
    },
    checkStudentAndTeacher: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "teacher" || user.role == "student") next();
        else {
            res.send("Bạn không có quyền truy cập tới địa chỉ này!!!");
        }
    },
    checkAdminAndTeacher: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "teacher" || user.role == "admin") next();
        else {
            res.send("Bạn không có quyền truy cập tới địa chỉ này!!!");
        }
    },
    AdminToHome: async (req, res, next) => {
        const user = await User.findById(req.user.id).lean();
        if (user.role == "admin") res.redirect("/addSchedule");
        else {
            next();
        }
    },
}

module.exports = middleware;