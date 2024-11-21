const User = require("../models/users");
const Course = require("../models/courses");
const Schedule = require("../models/schedules");

const infoUser = {
    render: async (req, res) => {
        res.render("gpa", {
            title: "Bảng điểm",
            login: true
        });
    }
}

module.exports = infoUser;