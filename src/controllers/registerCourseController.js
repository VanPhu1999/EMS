const mongoose = require("mongoose");
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const registerCourse = {
    render: async (req, res) => {
        let page = parseInt(req.query.page) || 1;
        let schedulesPerPage = 10;
        let totalSchedules;
        let totalPage;
        const user = await User.findById(req.user.id).lean();
        const info = req.query.info;
        let warning = false;
        if (req.cookies.warning) {
            warning = req.cookies.warning;
            res.clearCookie('warning');
        }
        if (info) {
            let value = new RegExp(info, 'i');
            let courses = await Course.find({
                $or: [
                    { courseId: value },
                    { courseName: value }
                ]
            }).lean();
            let coursesIds = courses.map(course => course._id);
            let schedules = await Schedule.aggregate([
                {
                    $match: { course_Id: { $in: coursesIds }, semester: req.query.semester }
                },
                {
                    $lookup: {
                        from: 'courses',  // Tên collection 'courses'
                        localField: 'course_Id',  // Trường tham chiếu trong Schedule
                        foreignField: '_id',  // Trường _id trong collection Course
                        as: 'courseDetails'  // Lưu kết quả vào 'courseDetails'
                    }
                },
                { $unwind: '$courseDetails' },
                {
                    $sort: {
                        'courseDetails.courseId': 1
                    }
                },
                {
                    $skip: (page - 1) * schedulesPerPage
                },
                {
                    $limit: schedulesPerPage
                }
            ]);
            totalSchedules = await Schedule.countDocuments({ course_Id: { $in: coursesIds }, semester: req.query.semester });
            totalPage = Math.ceil(totalSchedules / schedulesPerPage);
            let totalPages = [];
            for (let i = 1; i <= totalPage; i++) {
                totalPages.push(i);
            }
            for (const schedule of schedules) {
                const course = await Course.findById(schedule.course_Id).lean();
                const teacher = await User.findById(schedule.teacherId).lean();
                if (teacher) schedule.teacherName = teacher.name;
                schedule.courseId = course.courseId;
                schedule.courseName = course.courseName;
                schedule.credit = course.credit;
            }
            return res.render("student/registerCourse", {
                title: "Đăng ký môn học",
                login: true,
                search: true,
                user: user,
                schedules: schedules,
                warning: warning,
                page: page,
                totalPages: totalPages,
                info: info,
                semester: req.query.semester
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
        let flag = false;
        for (const registerCourse of user.registeredCourses) {
            const scheduleCheck = await Schedule.findById(registerCourse.ScheduleId).lean();
            if (scheduleCheck.semester == schedule.semester) {
                if (scheduleCheck.course_Id.equals(schedule.course_Id)) {
                    flag = true;
                    res.cookie('warning', 'Chỉ có thể đăng ký 1 lớp của 1 môn học!!!');
                    res.redirect("back");
                }
                if (scheduleCheck.day == schedule.day && schedule.period == scheduleCheck.period) {
                    flag = true;
                    res.cookie('warning', 'Môn học có thời khóa biểu trùng với môn đã đăng ký!!!');
                    res.redirect("back");
                }
            }
        }
        if (!flag) {
            const objStudent = {
                studentId: user._id
            };
            schedule.studentIds.push(objStudent);
            const obj = { ScheduleId: schedule._id };
            user.registeredCourses.push(obj);
            await Schedule.findByIdAndUpdate(schedule._id, { studentIds: schedule.studentIds }, { new: true });
            await User.findByIdAndUpdate(user._id, { registeredCourses: user.registeredCourses }, { new: true });
            res.redirect("back");
        }
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
                if (teacher) schedule.teacherName = teacher.name;
                schedule.courseId = course.courseId;
                schedule.courseName = course.courseName;
                schedule.credit = course.credit;
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