const User = require("../models/users");
const cloudinary = require('../config/uploadToCloudinary');

const userProfile = {
    render: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        let dateString = user.dateOfBirth.toISOString().split('T')[0];
        user.dateOfBirth = dateString;
        res.render("userProfile", {
            title: "Hồ sơ người dùng",
            login: true,
            user: user,
            userJSON: JSON.stringify(user)
        });
    },
    fix: async (req, res) => {
        const user = await User.findById(req.user.id).lean();
        const imgBuffer = req.files.img ? req.files.img[0].buffer : "";
        if (imgBuffer) {
            if (user.img_id) {
                let result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.destroy(user.img_id, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                });
            }
            const folderPath = `${req.user.id}/imgs`;
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: folderPath,
                    },
                    (error, response) => {
                        if (error) reject(error);
                        else resolve(response);
                    }
                ).end(imgBuffer);
            });
            let img_id = result.public_id;
            let img = result.secure_url;
            await User.findByIdAndUpdate(req.user.id, {
                name: req.body.name,
                email: req.body.email,
                dateOfBirth: req.body.dateOfBirth,
                address: req.body.address,
                img_id: img_id,
                img: img
            }, { new: true });

        } else {
            await User.findByIdAndUpdate(req.user.id, {
                name: req.body.name,
                email: req.body.email,
                dateOfBirth: req.body.dateOfBirth,
                address: req.body.address
            }, { new: true });
        }
        res.redirect('back');
    }
}

module.exports = userProfile;