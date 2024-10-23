const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const home = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let schedules = [];
        const stt = req.query["btn-stt"];
        if (!stt || stt && stt === "all") {
            for (const register of user.registeredCourses) {
                let schedule = await Schedule.findById(register.ScheduleId).lean();
                if (schedule) schedules = schedules.concat(schedule);
            }
        } else {
            for (const register of user.registeredCourses) {
                let schedule = await Schedule.find({
                    _id: register.ScheduleId,
                    state: stt
                }).lean();
                if (schedule) schedules = schedules.concat(schedule);
            }
        }
        for (const schedule of schedules) {
            const course = await Course.findById(schedule.course_Id).lean();
            const teacher = await User.findById(schedule.teacherId).lean();
            schedule.teacherName = teacher.name;
            schedule.courseId = course.courseId;
            schedule.courseName = course.courseName;
        }
        res.render("home", {
            title: "Trang Chủ",
            login: true,
            user: user,
            schedules: schedules
        });
    },
}

module.exports = home;