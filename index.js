//app tu express
const express = require("express");
const app = express();

//thu vien dotenv
require("dotenv").config();

//method-override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//lay du lieu tu cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//lay du lieu tu form
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cau hinh handlebars
const { engine } = require('express-handlebars');
const path = require('path');
app.engine('hbs', engine({
    extname: '.hbs',
    partialsDir: path.join(__dirname, 'src/views/layouts'), //đường dẫn tới partial
    layoutsDir: path.join(__dirname, 'src/views/layouts'), //đường dẫn tới thư mục layouts
    helpers: {
        checkRegister: function (a, b) {
            const check = (b.length > 0) ? b.some(obj => obj.studentId.equals(a)) : null;
            if (check) return true;
            else return false;
        },
        roletoString: function (a) {
            switch (a) {
                case "student": return "Sinh viên";
                case "teacher": return "Giảng viên";
                case "admin": return "Admin";
            }
        },
        checkRoleFix: function (a, b) {
            if (a == b) return true;
            else return false;
        },
        defaultImg: function (a, b) {
            if (a && a != "") return a;
            else return b
        },
        showEmptyData: function (a) {
            if (typeof a === 'number' && !isNaN(a)) return a;
            else return "–";
        },
        calcFinal: function (a, b, c) {
            if ((typeof a === 'number' && !isNaN(a)) &&
                (typeof b === 'number' && !isNaN(b)) &&
                (typeof c === 'number' && !isNaN(c))) {
                return Number((a * 0.2 + b * 0.3 + c * 0.5).toFixed(1));
            }
        },
        sum: function (a, b) {
            return a + b;
        },
        subtract: function (a, b) {
            return a - b;
        },
        avg: function (a, b) {
            if (b == 0) return "–";
            else return (a / b).toFixed(1);
        },
        checkPre: function (a, b) {
            if (a > b) return false;
            return true;
        },
        checkNext: function (a, b) {
            if (a < b) return false;
            return true;
        },
        calcIndex: function (a, b, c) {
            return a + 1 + (b - 1) * c;
        },
        checkToshowFac: function (a) {
            if (a == "student" || a == "teacher") return true;
            return false;
        },
        checkAdmin: function (a) {
            if (a == "admin") return true;
            return false;
        },
        checkTeacher: function (a) {
            if (a == "teacher") return true;
            return false;
        },
        checkStudent: function (a) {
            if (a == "student") return true;
            return false;
        },
        checkStudentAndTeacher: function (a) {
            if (a == "student" || a == "teacher") return true;
            return false;
        },
        checkAdminAndTeacher: function (a) {
            if (a == "admin" || a == "teacher") return true;
            return false;
        },
        checkScheduleContinue: function (a) {
            if (a == "Đang Học") return true;
            return false;
        }
    },
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views/body'));
//cau hinh file static public
app.use(express.static(path.join(__dirname, 'src/public')));

//cau hinh database
const db = require("./src/config/database");
db.connect();

//cau hinh route
const route = require("./src/routes/index");
route(app);

app.listen(process.env.PORT, () => {
    console.log(`app is running on ${process.env.PORT}`);
});