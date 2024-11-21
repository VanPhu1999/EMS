const mongoose = require("mongoose");
const User = require("./users");

const courseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true },
    courseFac: { type: String, required: true },
    credit: { type: String, required: true }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema, "courses");
module.exports = Course;