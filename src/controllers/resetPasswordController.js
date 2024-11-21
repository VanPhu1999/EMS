const jwt = require('jsonwebtoken');
const User = require("../models/users");
const { findByIdAndUpdate } = require('../models/courses');

const resetPassword = {
    render: async (req, res) => {
        const user = await User.findById(req.params.id).lean();
        res.render("auth/resetPassword", { user: user });
    },
    reset: async (req, res) => {
        await User.findByIdAndUpdate(req.params.id, {
            password: req.body.password,
            resetPassToken: ""
        }, { new: true });
        res.render("auth/resetPassword", { success: true });
    }
}

module.exports = resetPassword;