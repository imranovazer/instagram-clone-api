const multer = require("multer");
const sharp = require("sharp");

const User = require('../models/User');


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Not an image! Please upload only images."), false);
    }
};

const multerStorage = multer.memoryStorage();

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});
const UserController = {

    updateMe: async (req, res, next) => {
        // 1) Create error if user POSTs password data
        try {
            if (req.body.password || req.body.passwordConfirm) {
                return res.status(400).json({
                    status: "fail",
                    message: "This route is not for password updates.",
                });
            }

            // 2) Filtered out unwanted fields names that are not allowed to be updated
            const filteredBody = filterObj(req.body, "name", "email");
            if (req.file) filteredBody.photo = req.file.filename;

            // 3) Update user document
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                filteredBody,
                {
                    new: true,
                    runValidators: true,
                }
            );

            res.status(200).json({
                status: "success",
                data: {
                    user: updatedUser,
                },
            });
        } catch (error) {
            res.status(400).json({
                status: "fail",
                error,
            });
        }
    },
    resizeUserPhoto: async (req, res, next) => {
        try {


            if (!req.file) return next();

            const imageName = req.user.id || req.params.id

            req.file.filename = `user-${imageName}-${Date.now()}.jpeg`;

            await sharp(req.file.buffer)
                .resize(500, 500)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`public/img/users/${req.file.filename}`);

            next();
        } catch (error) {
            console.log(error);
        }
    },
    uploadUserPhoto: upload.single("photo"),
    unfollowUser: async (req, res) => {

        try {
            console.log('Unfollow');

            const userToUnfollow = await User.findById(req.params.id);
            const MyUserData = req.user;
            console.log(MyUserData);


            if (JSON.stringify(MyUserData._id) == JSON.stringify(userToUnfollow._id)) {

                return res.status(400).json(
                    {
                        status: 'fail',
                        message: ' You can not unfollow yourself'
                    }
                )
            }
            userToUnfollow.followers = userToUnfollow.followers.filter(item => !item.equals(MyUserData._id));

            await userToUnfollow.save();

            MyUserData.following = MyUserData.following.filter(item => !item.equals(userToUnfollow._id));

            await MyUserData.save();

            return res.status(200).json(
                {
                    status: 'sucess',
                    message: 'User unsubscibed successfully!'
                }
            )

        } catch (error) {
            console.log(error);
            return res.status(500).json(
                {
                    status: 'fail',
                    error
                }
            )
        }

    },
    followUser: async (req, res) => {
        console.log('Follow');

        try {
            const userToFollow = await User.findById(req.params.id);
            const MyUserData = req.user;

            if (JSON.stringify(MyUserData._id) == JSON.stringify(userToFollow._id)) {
                return res.status(400).json(
                    {
                        status: 'fail',
                        message: ' You can not follow yourself'
                    }
                )
            }

            userToFollow.followers.push(MyUserData._id);
            await userToFollow.save();
            MyUserData.following.push(userToFollow._id);
            await MyUserData.save();
            return res.status(200).json(
                {
                    status: 'sucess',
                    message: 'user followed successfully!'
                }
            )

        } catch (error) {
            console.log(error);
            return res.status(500).json(
                {
                    status: 'fail',
                    error
                }
            )
        }

    }

}

module.exports = UserController; 