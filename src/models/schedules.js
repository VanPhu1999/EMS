const mongoose = require("mongoose");
const User = require("./users");
const Course = require("./courses");

const scheduleSchema = new mongoose.Schema({
    course_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    studentIds: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        btl: { type: Number },
        gk: { type: Number },
        ck: { type: Number }
    }],
    semester: { type: String, required: true },
    day: { type: String, required: true },
    period: { type: String, required: true },
    room: { type: String, required: true },
    content: [{
        tittle: { type: String },
        img_id: { type: String },
        img: { type: String },
        video_id: { type: String },
        video: { type: String },
        subTittle: { type: String },
        body: { type: String }
    }],
    state: { type: String, default: "Đang Học" }
}, { timestamps: true });

const schedule = mongoose.model('Schedule', scheduleSchema, "schedules");
module.exports = schedule;