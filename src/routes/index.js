const home = require("./home_route");
const login = require("./login_route");
const logout = require("./logout_route");
const addSchedule = require("./addSchedule_route");
const addCourse = require("./addCourse_route");
const registerCourse = require("./registerCourse_route");
const manageUser = require("./manageUser_route");
const courseDetail = require("./courseDetail_route");
const schedule = require("./schedule_route");
const gpa = require("./gpa_route");
const infoUser = require("./infoUser_route");
const forgotPassword = require("./forgotPassword_route");
const resetPassword = require("./resetPassword_route");
const changePassword = require("./changePassword_route");
const userProfile = require("./userProfile_route");

module.exports = (app) => {
    app.use("/login", login);
    app.use("/logout", logout);
    app.use("/addSchedule", addSchedule);
    app.use("/addCourse", addCourse);
    app.use("/registerCourse", registerCourse);
    app.use("/manageUser", manageUser);
    app.use("/courseDetail", courseDetail);
    app.use("/schedule", schedule);
    app.use("/gpa", gpa);
    app.use("/infoUser", infoUser);
    app.use("/forgotPassword", forgotPassword);
    app.use("/resetPassword", resetPassword);
    app.use("/changePassword", changePassword);
    app.use("/userProfile", userProfile);
    app.use("/", home);
}