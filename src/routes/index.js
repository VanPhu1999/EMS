const home = require("./home_route");
const login = require("./login_route");
const logout = require("./logout_route");
const addSchedule = require("./addSchedule_route");
const addCourse = require("./addCourse_route");
const registerCourse = require("./registerCourse_route");
const manageUser = require("./manageUser_route");
const courseDetail = require("./courseDetail_route");
const schedule = require("./schedule_route");

module.exports = (app) => {
    app.use("/login", login);
    app.use("/logout", logout);
    app.use("/addSchedule", addSchedule);
    app.use("/addCourse", addCourse);
    app.use("/registerCourse", registerCourse);
    app.use("/manageUser", manageUser);
    app.use("/courseDetail", courseDetail);
    app.use("/schedule", schedule);
    app.use("/", home);
}