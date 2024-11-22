const jwt = require('jsonwebtoken');
const User = require("../models/users");

const login = {
    render: (req, res) => {
        res.render("auth/login");
    },
    login: async (req, res, next) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username }).lean();
        if (!user) return res.render("auth/login", { tb: "Tài khoản không chính xác" });
        else if (user.password != password) {
            return res.render("auth/login", { tb: "Mật khẩu không chính xác" });
        }
        else if (user.password === password) {
            const access_token = jwt.sign({
                id: user._id,
                role: user.role
            }, process.env.ACCESS_KEY, { expiresIn: "1d" });
            res.cookie('access_token', access_token, {
                httpOnly: true,  // Chỉ cho phép truy cập từ server (bảo vệ khỏi XSS)
                secure: process.env.NODE_ENV === 'production', // Chỉ dùng cookie này khi HTTPS
            });
            if (user.role == "admin") res.redirect("/manageUser");
            else res.redirect("/");
        }
    }
}

module.exports = login;