const mongoose = require("mongoose");
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const registerCourse = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const info = req.query.info;
        if (info) {
            let value = new RegExp(info, 'i');
            let courses = await Course.find({
                $or: [
                    { courseId: value },
                    { courseName: value }
                ]
            }).lean();
            let schedules = [];
            for (const course of courses) {
                let schedule = await Schedule.find({
                    course_Id: course._id,
                    semester: req.query.semester
                }).lean();
                if (schedule) schedules = schedules.concat(schedule);
            };
            for (const schedule of schedules) {
                const course = await Course.findById(schedule.course_Id).lean();
                const teacher = await User.findById(schedule.teacherId).lean();
                schedule.teacherName = teacher.name;
                schedule.courseId = course.courseId;
                schedule.courseName = course.courseName;
            }
            return res.render("student/registerCourse", {
                title: "Đăng ký môn học",
                login: true,
                search: true,
                user: user,
                schedules: schedules
            });
        };
        res.render("student/registerCourse", {
            title: "Đăng ký môn học",
            login: true,
            user: user
        });
    },
    register: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id);
        const check = schedule.studentIds.some(obj => obj.studentId.equals(user._id));
        if (!check) {
            const objStudent = {
                studentId: user._id
            };
            schedule.studentIds.push(objStudent);
            const obj = { ScheduleId: schedule._id };
            user.registeredCourses.push(obj);
            await Schedule.findByIdAndUpdate(schedule._id, { studentIds: schedule.studentIds }, { new: true });
            await User.findByIdAndUpdate(user._id, { registeredCourses: user.registeredCourses }, { new: true });
        };
        res.redirect("back");
    },
    renderRegistred: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let schedules = [];
        for (const register of user.registeredCourses) {
            let schedule = await Schedule.findById(register.ScheduleId).lean();
            if (schedule) {
                let flag = false;
                const course = await Course.findById(schedule.course_Id).lean();
                const teacher = await User.findById(schedule.teacherId).lean();
                schedule.teacherName = teacher.name;
                schedule.courseId = course.courseId;
                schedule.courseName = course.courseName;
                for (const obj of schedules) {
                    if (obj.semester === schedule.semester) {
                        obj.schedule.push(schedule);
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    const obj = {
                        semester: schedule.semester,
                        schedule: [schedule]
                    }
                    schedules.push(obj);
                }
            }
        }
        if (schedules.length > 0) {
            schedules.sort((a, b) => {
                if (a.semester > b.semester) return -1;
                if (a.semester < b.semester) return 1;
                return 0;
            });
        }
        res.render("student/registerCourseList", {
            title: "Danh sách đăng ký",
            login: true,
            user: user,
            schedules: schedules,
            semesterCheck: req.query.semester
        });
    },
    unRegister: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        let index = user.registeredCourses.findIndex(obj => obj.ScheduleId.equals(req.params.id));
        if (index != -1) {
            user.registeredCourses.splice(index, 1);
            const i = schedule.studentIds.findIndex(obj => obj.studentId.equals(user._id));
            if (i != -1) {
                schedule.studentIds.splice(i, 1);
                await Schedule.findByIdAndUpdate(schedule._id, { studentIds: schedule.studentIds }, { new: true });
                await User.findByIdAndUpdate(user._id, { registeredCourses: user.registeredCourses }, { new: true });
            }
        }
        res.redirect("back");
    },
}

module.exports = registerCourse;