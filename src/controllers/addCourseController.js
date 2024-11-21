const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const addCourse = {
    render: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const coursesPerPage = 10;
        let totalCourses;
        let totalPage;
        const user = await User.findById(req.user.id).lean();
        let courses;
        const info = req.query.info;
        if (info) {
            let value = new RegExp(info, "i");
            totalCourses = await Course.countDocuments({
                $or: [
                    { courseName: value },
                    { courseId: value }
                ]
            });
            courses = await Course.find({
                $or: [
                    { courseName: value },
                    { courseId: value }
                ]
            })
                .skip((page - 1) * coursesPerPage)
                .limit(coursesPerPage)
                .sort({ courseFac: 1, courseId: 1 })
                .lean();

        } else {
            totalCourses = await Course.countDocuments();
            courses = await Course.find()
                .skip((page - 1) * coursesPerPage)
                .limit(coursesPerPage)
                .sort({ courseFac: 1, courseId: 1 })
                .lean();
        }
        totalPage = Math.ceil(totalCourses / coursesPerPage);
        let totalPages = [];
        for (let i = 1; i <= totalPage; i++) {
            totalPages.push(i);
        }
        res.render("admin/allCourses", {
            title: "Danh sách môn học",
            login: true,
            user: user,
            courses: courses,
            page: page,
            totalPages: totalPages,
            info: info
        });
    },
    renderAdd: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let success = false;
        if (req.cookies.success) {
            success = req.cookies.success;
            res.clearCookie('success');
        }
        let warning = false;
        if (req.cookies.warning) {
            warning = req.cookies.warning;
            res.clearCookie('warning');
        }
        res.render("admin/addCourse", {
            title: "Tạo môn học",
            login: true,
            user: user,
            success: success,
            warning: warning
        });
    },
    add: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const courseCheck = await Course.find({ courseId: req.body.courseId }).lean();
        if (courseCheck) {
            res.cookie('warning', 'Mã môn học đã tồn tại!!!');
            return res.redirect("back");
        }
        const obj = {
            courseId: req.body.courseId,
            courseName: req.body.courseName,
            courseFac: req.body.courseFac,
            credit: req.body.credit
        }
        const course = new Course(obj);
        course.save();
        res.cookie('success', 'Đã tạo môn học thành công!!!');
        res.redirect("back");
    },
    renderFix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const course = await Course.findById(req.params.id).lean();
        let success = false;
        if (req.cookies.success) {
            success = req.cookies.success;
            res.clearCookie('success');
        }
        let warning = false;
        if (req.cookies.warning) {
            warning = req.cookies.warning;
            res.clearCookie('warning');
        }
        res.render("admin/addCourse_fix", {
            title: "Tạo môn học",
            login: true,
            user: user,
            course: course,
            success: success,
            warning: warning
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const courseCheck = await Course.find({ courseId: req.body.courseId }).lean();
        if (courseCheck) {
            res.cookie('warning', 'Mã môn học đã tồn tại!!!');
            return res.redirect("back");
        }
        const obj = {
            courseId: req.body.courseId,
            courseName: req.body.courseName,
            courseFac: req.body.courseFac,
            credit: req.body.credit
        }
        await Course.findByIdAndUpdate(req.params.id, obj, { new: true });
        res.cookie('success', 'Đã chỉnh sửa thành công!!!');
        res.redirect("back");
    }
}

module.exports = addCourse;