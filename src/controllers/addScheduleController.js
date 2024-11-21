const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const addSchedule = {
    render: async (req, res) => {
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
        let page = parseInt(req.query.page) || 1;
        let schedulesPerPage = 10;
        let totalSchedules;
        let totalPage;
        const user = await User.findById(req.user.id).lean();
        const info = req.query.info ? req.query.info : "";
        let schedules;
        if (info) {
            let value = new RegExp(info, 'i');
            let courses = await Course.find({
                $or: [
                    { courseName: value },
                    { courseId: value }
                ]
            }).lean();
            let courseIds = courses.map(course => course._id);
            schedules = await Schedule.aggregate([
                {
                    $match: { course_Id: { $in: courseIds } }
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
                        // 'courseDetails.courseId': 1
                    }
                },
                {
                    $skip: (page - 1) * schedulesPerPage
                },
                {
                    $limit: schedulesPerPage
                }
            ]);
            if (schedules.length === 0) {
                return res.render("admin/allSchedules", {
                    title: "Quản lý lịch học",
                    login: true,
                    user: user,
                    schedules: schedules,
                    warning1: "Không tìm thấy lịch học"
                });
            }
            totalSchedules = await Schedule.countDocuments({ course_Id: { $in: courseIds } });
        } else {
            totalSchedules = await Schedule.countDocuments();
            schedules = await Schedule.aggregate([
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
                        // 'courseDetails.courseId': 1
                    }
                },
                {
                    $skip: (page - 1) * schedulesPerPage
                },
                {
                    $limit: schedulesPerPage
                }
            ]);
        }
        totalPage = Math.ceil(totalSchedules / schedulesPerPage);
        for (const schedule of schedules) {
            const course = await Course.findById(schedule.course_Id).lean();
            const teacher = await User.findById(schedule.teacherId).lean();
            if (teacher) schedule.teacherName = teacher.name;
            schedule.courseId = course.courseId;
            schedule.courseName = course.courseName;
            schedule.credit = course.credit;
        }
        let totalPages = [];
        for (let i = 1; i <= totalPage; i++) {
            totalPages.push(i);
        }
        res.render("admin/allSchedules", {
            title: "Quản lý lịch học",
            login: true,
            user: user,
            schedules: schedules,
            totalPages: totalPages,
            page: page,
            info: info,
            warning: warning,
            success: success
        });
    },
    renderAdd: async (req, res) => {
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
        const user = await User.findById(req.user.id).lean();
        const teachers = await User.find({ role: "teacher" }).lean();
        const courses = await Course.find().lean();
        res.render("admin/addSchedule", {
            title: "Tạo lịch học",
            login: true,
            user: user,
            courses: JSON.stringify(courses),
            teachers: JSON.stringify(teachers),
            warning: warning,
            success: success
        });
    },
    renderFix: async (req, res) => {
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
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const teacher = await User.findById(schedule.teacherId).lean();
        const course = await Course.findById(schedule.course_Id).lean();
        const teachers = await User.find({ role: "teacher" }).lean();
        if (teacher) {
            schedule.teacherId = teacher.userId;
            schedule.teacherName = teacher.name;
        }
        schedule.courseName = course.courseName;
        schedule.courseId = course.courseId;
        res.render("admin/addSchedule_fix", {
            title: "Tạo môn học",
            login: true,
            user: user,
            schedule: schedule,
            teachers: JSON.stringify(teachers),
            warning: warning,
            success: success
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const teacher = await User.findOne({
            name: req.body.teacherName,
            userId: req.body.teacherId
        }).lean();
        if (!teacher) {
            res.cookie('warning', 'Không tìm thấy giảng viên!!!');
            return res.redirect("back");
        }
        const obj = {
            teacherId: teacher._id,
            semester: req.body.semester,
            day: req.body.day,
            period: req.body.period,
            room: req.body.room,
            state: req.body.state
        }
        await Schedule.findByIdAndUpdate(req.params.id, obj, { new: true });
        res.cookie('success', 'Đã cập nhật thành công!!!');
        return res.redirect("back");
    },
    add: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const value = new RegExp(req.body.courseName, 'i');
        const course = await Course.findOne({
            courseName: value,
            courseId: req.body.courseId
        }).lean();
        if (!course) {
            res.cookie('warning', 'Không tìm thấy môn học!!!');
            return res.redirect("back");
        }
        const teacher = await User.findOne({
            name: req.body.name,
            userId: req.body.teacherId
        }).lean();
        if (!teacher) {
            res.cookie('warning', 'Không tìm thấy giảng viên!!!');
            return res.redirect("back");
        }
        const obj = {
            course_Id: course._id,
            teacherId: teacher._id,
            studentIds: [],
            semester: req.body.semester,
            day: req.body.day,
            room: req.body.room,
            period: req.body.period
        }
        const schedule = new Schedule(obj);
        await schedule.save();
        const register = { ScheduleId: schedule._id };
        teacher.registeredCourses.push(register);
        await User.findByIdAndUpdate(teacher._id, { registeredCourses: teacher.registeredCourses }, { new: true });
        res.cookie('success', 'Tạo lịch học thành công!!!');
        return res.redirect("back");
    },
    delete: async (req, res) => {
        let schedule = await Schedule.findById(req.params.id).lean();
        let teacher = await User.findById(schedule.teacherId).lean();
        let index = -1;
        if (teacher) index = teacher.registeredCourses.findIndex(obj => obj.ScheduleId.equals(schedule._id));
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
        res.cookie('success', 'Đã xóa lịch học thành công!!!');
        res.redirect("back");
    }
}

module.exports = addSchedule;