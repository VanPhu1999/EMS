const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const schedule = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let schedules = [];
        for (const registeredCourse of user.registeredCourses) {
            let schedule = await Schedule.findById(registeredCourse.ScheduleId).lean();
            if (schedule) {
                const course = await Course.findById(schedule.course_Id).lean();
                const teacher = await User.findById(schedule.teacherId).lean();
                schedule.teacherName = teacher.name;
                schedule.courseName = course.courseName;
                schedule.courseId = course.courseId;
                let flag = false;
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
        res.render("schedule", {
            title: "Thời khóa biểu",
            login: true,
            user: user,
            schedules: schedules
        });
    }
}

module.exports = schedule;