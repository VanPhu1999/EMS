const jwt = require('jsonwebtoken');
const User = require("../models/users");
const { findByIdAndUpdate } = require('../models/courses');

const changePassword = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        res.render("changePassword", {
            title: "Đổi mật khẩu",
            login: true,
            user: user
        });
    },
    reset: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        if (req.body.passwordOld === user.password) {
            await User.findByIdAndUpdate(user._id, {
                password: req.body.password
            }, { new: true });
            res.render("changePassword", {
                title: "Đổi mật khẩu",
                login: true,
                user: user,
                tc: "Mật khẩu mới đã được cập nhật!!!"
            });
        } else {
            res.render("changePassword", {
                title: "Đổi mật khẩu",
                login: true,
                user: user,
                tb: "Mật khẩu không chính xác!!!"
            });
        }
    }
}

module.exports = changePassword;