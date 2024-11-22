const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const home = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let schedules;
        let page = parseInt(req.query.page) || 1;
        let schedulesPerPage = 6;
        let totalSchedules;
        let totalPage;
        const stt = req.query["btn-stt"];
        let schedule_id = user.registeredCourses.map(registeredCourse => registeredCourse.ScheduleId);
        if (!stt || stt && stt === "all") {
            schedules = await Schedule.aggregate([
                {
                    $match: { _id: { $in: schedule_id } }
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
                        semester: -1,
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
            totalSchedules = await Schedule.countDocuments({ _id: { $in: schedule_id } });
        } else {
            schedules = await Schedule.aggregate([
                {
                    $match: { _id: { $in: schedule_id }, state: stt }
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
                        semester: -1,
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
            totalSchedules = await Schedule.countDocuments({ _id: { $in: schedule_id }, state: stt });
        }
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
        }
        res.render("home", {
            title: "Trang Chủ",
            login: true,
            user: user,
            schedules: schedules,
            page: page,
            totalPages: totalPages,
            stt: stt
        });
    },
}

module.exports = home;