const jwt = require('jsonwebtoken');

const middleware = {
    verifyToken: (req, res, next) => {
        const access_token = req.cookies.access_token;
        if (access_token) {
            jwt.verify(access_token, process.env.ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.redirect("login");
                }
                req.user = user;
                next();
            })
        } else {
            res.redirect("/login");
        }
    }
}

module.exports = middleware;