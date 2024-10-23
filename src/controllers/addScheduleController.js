const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const addSchedule = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let schedules = await Schedule.find().lean();
        const info = req.query.info;
        if (info) {
            let value = new RegExp(info, 'i');
            let courses = await Course.find({
                $or: [
                    { courseName: value },
                    { courseId: value }
                ]
            }).lean();
            let schedulesTemp = [];
            for (const course of courses) {
                const index = schedules.findIndex(obj => obj.course_Id.equals(course._id));
                if (index != -1) schedulesTemp.push(schedules[index]);
            }
            if (schedulesTemp.length > 0) schedules = schedulesTemp;
            else {
                return res.render("admin/allSchedules", {
                    title: "Quản lý lịch học",
                    login: true,
                    user: user,
                    schedules: schedules,
                    warning: "Không tìm thấy lịch học"
                });
            }
        }
        for (const schedule of schedules) {
            const course = await Course.findById(schedule.course_Id).lean();
            const teacher = await User.findById(schedule.teacherId).lean();
            schedule.teacherName = teacher.name;
            schedule.courseId = course.courseId;
            schedule.courseName = course.courseName;
        }
        res.render("admin/allSchedules", {
            title: "Quản lý lịch học",
            login: true,
            user: user,
            schedules: schedules
        });
    },
    renderAdd: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        res.render("admin/addSchedule", {
            title: "Tạo lịch học",
            login: true,
            user: user
        });
    },
    renderFix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const teacher = await User.findById(schedule.teacherId).lean();
        schedule.teacherId = teacher.userId;
        schedule.teacherName = teacher.name;
        res.render("admin/addSchedule_fix", {
            title: "Tạo môn học",
            login: true,
            user: user,
            schedule: schedule
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const teacher = await User.findOne({
            name: req.body.teacherName,
            userId: req.body.teacherId
        }).lean();
        const obj = {
            teacherId: teacher._id,
            semester: req.body.semester,
            day: req.body.day,
            period: req.body.period,
            state: req.body.state
        }
        await Schedule.findByIdAndUpdate(req.params.id, obj, { new: true });
        res.redirect("/addSchedule");
    },
    add: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const value = new RegExp(req.body.courseName, 'i');
        const course = await Course.findOne({
            courseName: value,
            courseId: req.body.courseId
        }).lean();
        if (!course) {
            return res.render("admin/addSchedule", {
                title: "Tạo lịch học",
                login: true,
                warning: "Không tìm thấy môn học",
                user: user
            })
        }
        const teacher = await User.findOne({
            name: req.body.name,
            userId: req.body.teacherId
        }).lean();
        if (!teacher) {
            return res.render("admin/addSchedule", {
                title: "Tạo lịch học",
                login: true,
                warning: "Không tìm thấy giảng viên",
                user: user
            })
        }
        const obj = {
            course_Id: course._id,
            teacherId: teacher._id,
            studentIds: [],
            semester: req.body.semester,
            day: req.body.day,
            period: req.body.period
        }
        const schedule = new Schedule(obj);
        await schedule.save();
        const register = { ScheduleId: schedule._id };
        teacher.registeredCourses.push(register);
        await User.findByIdAndUpdate(teacher._id, { registeredCourses: teacher.registeredCourses }, { new: true });
        res.render("admin/addSchedule", {
            title: "Tạo lịch học",
            login: true,
            success: "Tạo lịch thành công",
            user: user
        })
    },
    delete: async (req, res) => {
        let schedule = await Schedule.findById(req.params.id).lean();
        let teacher = await User.findById(schedule.teacherId).lean();
        const index = teacher.registeredCourses.findIndex(obj => obj.ScheduleId.equals(schedule._id));
        if (index != -1) {
            teacher.registeredCourses.splice(index, 1);
            await User.findByIdAndUpdate(teacher._id, { registeredCourses: teacher.registeredCourses }, { new: true });
        }
        for (const studentId of schedule.studentIds) {
            let student = await User.findById(studentId.studentId).lean();
            const i = student.registeredCourses.findIndex(obj => obj.ScheduleId.equals(schedule._id));
            if (i != -1) {
                student.registeredCourses.splice(i, 1);
                await User.findByIdAndUpdate(student._id, { registeredCourses: student.registeredCourses }, { new: true });
            }
        }
        await Schedule.findByIdAndDelete(schedule._id);
        res.redirect("back");
    }
}

module.exports = addSchedule;