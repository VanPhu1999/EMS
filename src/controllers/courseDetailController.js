const jwt = require('jsonwebtoken');
const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");
const cloudinary = require('../config/uploadToCloudinary');

const courseDetail = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const schedule = await Schedule.findById(req.params.id).lean();
        const course = await Course.findById(schedule.course_Id).lean();
        const teacher = await User.findById(schedule.teacherId).lean();
        if (teacher) schedule.teacherName = teacher.name;
        schedule.courseName = course.courseName;
        schedule.courseId = course.courseId;
        if (schedule.content.length > 0) {
            schedule.content.sort((a, b) => {
                const tittleA = a.tittle.split(" ").slice(-1)[0];
                const tittleB = b.tittle.split(" ").slice(-1)[0];
                return tittleA.localeCompare(tittleB);
            });
        }
        res.render("courseDetail", {
            title: "Môn học",
            login: true,
            user: user,
            schedule: schedule
        });
    },
    addTittle: async (req, res) => {
        const schedule = await Schedule.findById(req.params.id).lean();
        const content = {
            tittle: req.body.tittle,
            subTittle: req.body.subTittle,
            body: req.body.body
        }
        const imgBuffer = req.files.img ? req.files.img[0].buffer : "";
        const videoBuffer = req.files.video ? req.files.video[0].buffer : "";
        if (imgBuffer) {
            const folderPath = `${req.params.id}/imgs`;
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: folderPath,
                    },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                ).end(imgBuffer);
            });
            content.img_id = result.public_id;
            content.img = result.secure_url;
        }
        if (videoBuffer) {
            const folderPath = `${req.params.id}/videos`;
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        folder: folderPath,
                    },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                ).end(videoBuffer);
            });
            content.video_id = result.public_id;
            content.video = result.secure_url;
        }
        if (!schedule.content) {
            schedule.content = [];
        }
        schedule.content.push(content);
        await Schedule.findByIdAndUpdate(schedule._id, { content: schedule.content }, { new: true });
        res.redirect("back");
    },
    ContentFix: async (req, res) => {
        const schedule = await Schedule.findById(req.params.id).lean();
        if (!schedule.content) {
            schedule.content = [];
        }
        let content = {
            tittle: req.body.tittle,
            subTittle: req.body.subTittle,
            body: req.body.body
        }
        const imgBuffer = req.files.img ? req.files.img[0].buffer : "";
        const videoBuffer = req.files.video ? req.files.video[0].buffer : "";
        if (imgBuffer) {
            const folderPath = `${req.params.id}/imgs`;
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: folderPath,
                    },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                ).end(imgBuffer);
            });
            content.img_id = result.public_id;
            content.img = result.secure_url;
        }
        if (videoBuffer) {
            const folderPath = `${req.params.id}/videos`;
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'video',
                        folder: folderPath,
                    },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                ).end(videoBuffer);
            });
            content.video_id = result.public_id;
            content.video = result.secure_url;
        }
        for (const contentOfSchedule of schedule.content) {
            if (contentOfSchedule._id.equals(req.params.contentId)) {
                contentOfSchedule.tittle = content.tittle;
                contentOfSchedule.subTittle = content.subTittle;
                contentOfSchedule.body = content.body;
                if (content.video_id) {
                    if (contentOfSchedule.video_id) {
                        let result = await new Promise((resolve, reject) => {
                            cloudinary.uploader.destroy(contentOfSchedule.video_id, (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            });
                        });
                    }
                    contentOfSchedule.video_id = content.video_id;
                }
                if (content.video) contentOfSchedule.video = content.video;
                if (content.img_id) {
                    if (contentOfSchedule.img_id) {
                        let result = await new Promise((resolve, reject) => {
                            cloudinary.uploader.destroy(contentOfSchedule.img_id, (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            });
                        });
                    }
                    contentOfSchedule.img_id = content.img_id;
                }
                if (content.img) contentOfSchedule.img = content.img;
            }
        }
        await Schedule.findByIdAndUpdate(schedule._id, { content: schedule.content }, { new: true });
        let content1 = schedule.content.filter(content => content._id.equals(req.params.contentId));
        res.redirect(`/courseDetail/${schedule._id}/${content1[0]._id}/detail`);
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
            const img_id = schedule.content[index].img_id;
            const video_id = schedule.content[index].video_id;
            if (img_id) {
                let result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.destroy(img_id, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                });
            }
            if (video_id) {
                let result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.destroy(video_id, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                });
            }
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
        if (teacher) schedule.teacherName = teacher.name;
        schedule.courseName = course.courseName;
        schedule.courseId = course.courseId;
        const info = req.query.info;
        let students = [];
        if (info) {
            let value = new RegExp(info, 'i');
            let searchUsers = await User.find({
                role: "student",
                $or: [
                    { name: value },
                    { userId: value }
                ]
            })
                .sort({ userId: 1 })
                .lean();
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
        students.sort((a, b) => a.userId.localeCompare(b.userId));
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