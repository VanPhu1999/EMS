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
            if (a) return a;
            else return "–";
        },
        calcFinal: function (a, b, c) {
            if (a && b && c) {
                return ((a + b + c) / 3).toFixed(1);
            }
        },
        sum: function (a, b) {
            return a + b;
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

console.log(process.env.PORT);

//cau hinh route
const route = require("./src/routes/index");
route(app);

app.listen(process.env.PORT, () => {
    console.log(`app is running on ${process.env.PORT}`);
});