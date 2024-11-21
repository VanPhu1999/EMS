const jwt = require('jsonwebtoken');
const User = require("../models/users");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const forgotPassword = {
    render: (req, res) => {
        res.render("auth/forgotPassword");
    },
    sendEmail: async (req, res) => {
        const user = await User.findOne({ email: req.body.email }).lean();
        if (!user) {
            res.render("auth/forgotPassword", { tb: "Không tìm thấy email, vui lòng kiểm tra lại!!!" });
        } else {
            const resetPassToken = jwt.sign({
                id: user._id,
                role: user.role
            }, process.env.FORGOT_PASS_KEY, { expiresIn: "10min" });
            await User.findByIdAndUpdate(user._id, { resetPassToken: resetPassToken }, { new: true });
            const resetLink = req.protocol + '://' + req.get('host') + `/resetPassword/${user._id}`;
            const info = await transporter.sendMail({
                from: `"EMS TESTING" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Lấy lại mật khẩu",
                text: `Gửi: ${user.name}.\nĐây là email để khôi phục lại mật khẩu, vui lòng bấm vào link dưới đây để khôi phục mật khẩu: ${resetLink}\nLink này chỉ tồn tại trong 10 phút. Nếu bạn không thực hiện yêu cầu này xin vui lòng bỏ qua email này.\nTrân trọng,\nCám ơn.
                `,
            });
            res.render("auth/forgotPassword", { success: true });
        }
    }
}

module.exports = forgotPassword;