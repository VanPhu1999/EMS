const mongoose = require("mongoose");
const Schedule = require("./schedules");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student', 'teacher'], required: true },
    name: { type: String, required: true },
    email: { type: String },
    resetPassToken: { type: String },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    faculty: { type: String },
    img_id: { type: String },
    img: { type: String },
    registeredCourses: [{
        ScheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
        state: { type: String, default: "Đang Học" }
    }]
})

const User = mongoose.model('User', userSchema, "users");
module.exports = User;