const Post = require('../models/Post');
const multer = require('multer');
const sharp = require('sharp');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Not an image! Please upload only images."), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});


const PostController = {
    uploadPostPhoto: upload.single("photo"),
    resizePostPhoto: async (req, res, next) => {
        try {


            if (!req.file) return next();

            const imageName = req.user._id || req.params.id

            req.file.filename = `post-${imageName}-${Date.now()}.jpeg`;

            await sharp(req.file.buffer)
                .resize(500, 500)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`public/img/posts/${req.file.filename}`);

            next();
        } catch (error) {
            console.log(error);
        }
    },
    createPost: async (req, res) => {
        try {
            const MyUserInfo = req.user;

            const { _id: userId } = MyUserInfo;

            const { name, description } = req.body;


            const newPost = await Post.create(
                {
                    name,
                    description,
                    author: userId,
                    photo: req.file.filename
                }
            );
            MyUserInfo.posts.push(newPost._id);
            await MyUserInfo.save();


            // console.log("User id who created the post", userId);

            return res.status(201).json({
                status: 'sucess',
                data: newPost
            })

        }
        catch (error) {
            return res.status(500).json({
                status: 'fail',
                error
            })

        }
    }

}

module.exports = PostController 