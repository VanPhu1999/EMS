const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const addCourse = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let courses = await Course.find().lean();
        const info = req.query.info;
        if (info) {
            let value = new RegExp(info, "i");
            courses = await Course.find({
                $or: [
                    { courseName: value },
                    { courseId: value }
                ]
            }).lean();
        }
        res.render("admin/allCourses", {
            title: "Danh sách môn học",
            login: true,
            user: user,
            courses: courses
        });
    },
    renderAdd: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        res.render("admin/addCourse", {
            title: "Tạo môn học",
            login: true,
            user: user
        });
    },
    add: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const obj = {
            courseId: req.body.courseId,
            courseName: req.body.courseName,
            courseFac: req.body.courseFac
        }
        const course = new Course(obj);
        course.save();
        res.render("admin/addCourse", {
            title: "Tạo môn học",
            login: true,
            success: "Tạo môn học thành công",
            user: user
        });
    },
    renderFix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const course = await Course.findById(req.params.id).lean();
        res.render("admin/addCourse_fix", {
            title: "Tạo môn học",
            login: true,
            user: user,
            course: course
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const obj = {
            courseId: req.body.courseId,
            courseName: req.body.courseName,
            courseFac: req.body.courseFac
        }
        await Course.findByIdAndUpdate(req.params.id, obj, { new: true });
        res.redirect("/addCourse");
    }
}

module.exports = addCourse;