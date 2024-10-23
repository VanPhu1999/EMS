module.exports.logout = (req, res) => {
    res.clearCookie('access_token');
    res.redirect('/login');
}