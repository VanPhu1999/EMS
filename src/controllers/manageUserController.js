const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const manageUser = {
    render: async (req, res) => {
        let page = parseInt(req.query.page) || 1;
        let usersPerPage = 10;
        let totalUsers;
        let totalPage;
        const user = await User.findById(req.user.id).lean();
        let searchUsers;
        const info = req.query.info;
        const stt = req.query["btn-stt"];
        let warning = false;
        let success = false;
        if (req.cookies.warning) {
            warning = req.cookies.warning;
            res.clearCookie('warning');
        }
        if (req.cookies.success) {
            success = req.cookies.success;
            res.clearCookie('success');
        }
        if (info) {
            let value = new RegExp(info, 'i');
            if (stt && stt != "all") {
                totalUsers = await User.countDocuments({
                    role: stt,
                    $or: [
                        { name: value },
                        { userId: value }
                    ]
                });
                searchUsers = await User.find({
                    role: stt,
                    $or: [
                        { name: value },
                        { userId: value }
                    ]
                })
                    .skip((page - 1) * usersPerPage)
                    .limit(usersPerPage)
                    .sort({ userId: 1 })
                    .lean();
            } else {
                totalUsers = await User.countDocuments({
                    $or: [
                        { name: value },
                        { userId: value }
                    ]
                });
                searchUsers = await User.find({
                    $or: [
                        { name: value },
                        { userId: value }
                    ]
                })
                    .skip((page - 1) * usersPerPage)
                    .limit(usersPerPage)
                    .sort({ userId: 1 })
                    .lean();
            }
        } else {
            if (stt && stt != "all") {
                totalUsers = await User.countDocuments({ role: stt });
                searchUsers = await User.find({ role: stt })
                    .skip((page - 1) * usersPerPage)
                    .limit(usersPerPage)
                    .sort({ userId: 1 })
                    .lean();
            } else {
                totalUsers = await User.countDocuments();
                searchUsers = await User.find()
                    .skip((page - 1) * usersPerPage)
                    .limit(usersPerPage)
                    .sort({ userId: 1 })
                    .lean();
            }
        }
        totalPage = Math.ceil(totalUsers / usersPerPage);
        let totalPages = [];
        for (let i = 1; i <= totalPage; i++) {
            totalPages.push(i);
        }
        res.render("admin/manageUser", {
            title: "Quản lý người dùng",
            login: true,
            user: user,
            search: true,
            searchUsers: searchUsers,
            totalPages: totalPages,
            page: page,
            stt: stt,
            info: info,
            warning: warning,
            success: success
        });
    },
    renderAdd: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const users = await User.find().lean();
        let warning = false;
        let success = false;
        if (req.cookies.warning) {
            warning = req.cookies.warning;
            res.clearCookie('warning');
        }
        if (req.cookies.success) {
            success = req.cookies.success;
            res.clearCookie('success');
        }
        res.render("admin/addUser", {
            title: "Thêm người dùng",
            login: true,
            user: user,
            users: JSON.stringify(users),
            warning: warning,
            success: success
        });
    },
    add: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const check = await User.find({
            $or: [
                { username: req.body.username },
                { userId: req.body.userId }
            ]
        });
        if (check.length > 0) {
            res.cookie('warning', 'Tài khoản hoặc mã người dùng đã tồn tại!!!');
            return res.redirect("back");
        }
        const role = req.body.role;
        let obj = {
            username: req.body.username,
            password: req.body.password,
            userId: req.body.userId,
            name: req.body.name,
            role: req.body.role,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            email: req.body.email,
            registeredCourses: []
        }
        if (role === "student" || role === "teacher") {
            obj.faculty = req.body.faculty;
        }
        const newUser = new User(obj);
        newUser.save();
        res.cookie('success', 'Tạo người dùng thành công!!!');
        return res.redirect("back");
    },
    renderFix: async (req, res) => {
        let success = false;
        if (req.cookies.success) {
            success = req.cookies.success;
            res.clearCookie('success');
        }
        const user = await User.findById(req.user.id).lean();
        const fixUser = await User.findById(req.params.id).lean();
        const dateOfBirth = fixUser.dateOfBirth;
        let dateString = dateOfBirth.toISOString().split('T')[0];
        fixUser.dateOfBirth = dateString;
        res.render("admin/manageUser_fix", {
            title: "Chỉnh sửa người dùng",
            login: true,
            user: user,
            fixUser: fixUser,
            success: success
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const fixUser = await User.findById(req.params.id).lean();
        const obj = {
            name: req.body.name,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            email: req.body.email,
            faculty: ""
        }
        if (req.body.role == "student" || req.body.role == "teacher") {
            obj.faculty = req.body.faculty;
        } else if (req.body.role == "admin") {
            if (fixUser.faculty) fixUser.faculty = "";
        }
        await User.findByIdAndUpdate(req.params.id, {
            name: obj.name,
            dateOfBirth: obj.dateOfBirth,
            email: obj.email,
            address: obj.address,
            faculty: obj.faculty
        }, { new: true });
        res.cookie('success', 'Cập nhật thông tin thành công!!!');
        return res.redirect("back");
    },
    deleteUser: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const dltUser = await User.findById(req.params.id).lean();
        const role = dltUser.role;
        const schedules = dltUser.registeredCourses.map(registeredCourse => registeredCourse.ScheduleId);
        if (role == "teacher") {
            const teachings = await Schedule.find({ _id: { $in: schedules } }).lean();
            for (const teaching of teachings) {
                await Schedule.findByIdAndUpdate(teaching._id, { teacherId: null }, { new: true });
            }
        } else if (role == "student") {
            const studings = await Schedule.find({ _id: { $in: schedules } }).lean();
            for (const studing of studings) {
                const index = studing.studentIds.findIndex(studentId => studentId.studentId.equals(dltUser._id));
                if (index != -1) {
                    studing.studentIds.splice(index, 1);
                    await Schedule.findByIdAndUpdate(studing._id, { studentIds: studing.studentIds }, { new: true });
                }
            }
        }
        await User.findByIdAndDelete(dltUser._id);
        res.cookie('success', 'Xóa người dùng thành công!!!');
        res.redirect('back');
    }
}

module.exports = manageUser;