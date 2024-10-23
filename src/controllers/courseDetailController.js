const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const courseDetail = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const course = await Course.findById(schedule.course_Id).lean();
        const teacher = await User.findById(schedule.teacherId).lean();
        schedule.teacherName = teacher.name;
        schedule.courseName = course.courseName;
        schedule.courseId = course.courseId;
        res.render("courseDetail", {
            title: "Môn học",
            login: true,
            user: user,
            schedule: schedule
        });
    },
    addTittle: async (req, res) => {
        const imgPath = req.files.img ? `/uploads/${req.params.id}/` + req.files.img[0].filename : "";
        const videoPath = req.files.video ? `/uploads/${req.params.id}/` + req.files.video[0].filename : "";
        const schedule = await Schedule.findById(req.params.id).lean();
        const content = {
            tittle: req.body.tittle,
            subTittle: req.body.subTittle,
            img: imgPath,
            video: videoPath,
            body: req.body.body
        }
        if (!schedule.content) {
            schedule.content = [];
        }
        schedule.content.push(content);
        await Schedule.findByIdAndUpdate(schedule._id, { content: schedule.content }, { new: true });
        res.redirect("back");
    },
    renderContentFix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const content = schedule.content.filter(content => content._id.equals(req.params.contentId));
        res.render("courseDetail_fix", {
            title: "Chỉnh sửa đề mục",
            login: true,
            user: user,
            schedule: schedule,
            content: content[0]
        })
    },
    ContentFix: async (req, res) => {
        const imgPath = req.files.img ? `/uploads/${req.params.id}/` + req.files.img[0].filename : "";
        const videoPath = req.files.video ? `/uploads/${req.params.id}/` + req.files.video[0].filename : "";
        const schedule = await Schedule.findById(req.params.id).lean();
        schedule.content.forEach(content => {
            if (content._id.equals(req.params.contentId)) {
                content.tittle = req.body.tittle;
                content.subTittle = req.body.subTittle;
                content.body = req.body.body;
                if (imgPath != "") content.img = imgPath;
                if (videoPath != "") content.video = videoPath;
            }
        });
        await Schedule.findByIdAndUpdate(schedule._id, { content: schedule.content }, { new: true });
        let content = schedule.content.filter(content => content._id.equals(req.params.contentId));
        res.redirect(`/courseDetail/${schedule._id}/${content[0]._id}/detail`);
    },
    renderContentDetail: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const content = schedule.content.filter(content => content._id.equals(req.params.contentId));
        res.render("courseDetail_content", {
            title: "Chi tiết",
            login: true,
            user: user,
            schedule: schedule,
            content: content[0]
        })
    },
    ContentDelete: async (req, res) => {
        let schedule = await Schedule.findById(req.params.id).lean();
        const index = schedule.content.findIndex(content => content._id.equals(req.params.contentId));
        if (index != -1) {
            schedule.content.splice(index, 1);
            await Schedule.findByIdAndUpdate(schedule._id, { content: schedule.content }, { new: true });
        }
        res.redirect("back");
    },
    renderManageStudents: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const course = await Course.findById(schedule.course_Id).lean();
        const teacher = await User.findById(schedule.teacherId).lean();
        schedule.teacherName = teacher.name;
        schedule.courseName = course.courseName;
        schedule.courseId = course.courseId;
        const info = req.query.info;
        const students = [];
        if (info) {
            let value = new RegExp(info, 'i');
            let searchUsers = await User.find({
                role: "student",
                $or: [
                    { name: value },
                    { userId: value }
                ]
            }).lean();
            if (searchUsers.length > 0) {
                for (const searchUser of searchUsers) {
                    let index = schedule.studentIds.findIndex(studentId => studentId.studentId.equals(searchUser._id));
                    if (index != -1) {
                        searchUser.btl = schedule.studentIds[index].btl;
                        searchUser.gk = schedule.studentIds[index].gk;
                        searchUser.ck = schedule.studentIds[index].ck;
                        students.push(searchUser);
                    }
                }
            }
        } else {
            for (const studentId of schedule.studentIds) {
                const student = await User.findById(studentId.studentId).lean();
                if (student) {
                    student.btl = studentId.btl;
                    student.gk = studentId.gk;
                    student.ck = studentId.ck;
                    students.push(student);
                }
            }
        }
        res.render("courseDetail_manageStudents", {
            title: "Quản lý sinh viên",
            login: true,
            user: user,
            schedule: schedule,
            students: students
        });
    },
    fixscores: async (req, res) => {
        let schedule = await Schedule.findById(req.params.id).lean();
        schedule.studentIds.forEach(studentId => {
            if (studentId.studentId.equals(req.params.studentId)) {
                studentId.btl = req.body.btl;
                studentId.gk = req.body.gk;
                studentId.ck = req.body.ck;
            }
        });
        await Schedule.findByIdAndUpdate(schedule._id, { studentIds: schedule.studentIds }, { new: true });
        res.redirect("back");
    }
}

module.exports = courseDetail;