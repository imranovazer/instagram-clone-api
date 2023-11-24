const express = require('express');
const PostController = require('../controllers/PostsController');

const { route } = require('./UserRoutes');
const ProtectMiddleware = require('../middleware/ProtectMiddleware');

const router = express.Router();



router.use(ProtectMiddleware);

router.route('/').post(PostController.uploadPostPhoto, PostController.resizePostPhoto, PostController.createPost);


module.exports = router