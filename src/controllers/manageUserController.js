const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const manageUser = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let searchUsers = await User.find().lean();
        const info = req.query.info;
        const stt = req.query["btn-stt"];
        if (info) {
            let value = new RegExp(info, 'i');
            searchUsers = await User.find({
                $or: [
                    { name: value },
                    { userId: value }
                ]
            }).lean();
        };
        if (stt) {
            if (stt === "student" || stt === "teacher" || stt === "admin") {
                let tmpArr = searchUsers.filter(ele => ele.role === stt);
                searchUsers = tmpArr;
            }
        };
        res.render("admin/manageUser", {
            title: "Quản lý người dùng",
            login: true,
            user: user,
            search: true,
            searchUsers: searchUsers
        });
    },
    renderAdd: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        res.render("admin/addUser", {
            title: "Thêm người dùng",
            login: true,
            user: user
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
            return res.render("admin/addUser", {
                title: "Thêm người dùng",
                login: true,
                warning: "Tài khoản hoặc mã người dùng đã tồn tại",
                user: user,
            });
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
            registeredCourses: []
        }
        if (role === "student" || role === "teacher") {
            obj.faculty = req.body.faculty;
        }
        const newUser = new User(obj);
        newUser.save();
        res.render("admin/addUser", {
            title: "Thêm người dùng",
            login: true,
            success: "Tạo người dùng thành công",
            user: user,
        });
    },
    renderFix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const fixUser = await User.findById(req.params.id).lean();
        res.render("admin/manageUser_fix", {
            title: "Chỉnh sửa người dùng",
            login: true,
            user: user,
            fixUser: fixUser
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const fixUser = await User.findById(req.params.id).lean();
        const obj = {
            name: req.body.name,
            userId: req.body.userId,
            role: req.body.role,
            dateOfBirth: req.body.dateOfBirth,
            address: req.body.address,
            faculty: ""
        }
        if (req.body.role == "student" || req.body.role == "teacher") {
            obj.faculty = req.body.faculty;
        } else if (req.body.role == "admin") {
            if (fixUser.faculty) fixUser.faculty = "";
        }
        await User.findByIdAndUpdate(req.params.id, {
            name: obj.name,
            userId: obj.userId,
            role: obj.role,
            dateOfBirth: obj.dateOfBirth,
            address: obj.address,
            faculty: obj.faculty
        }, { new: true });
        res.redirect("/manageUser");
    },
}

module.exports = manageUser;