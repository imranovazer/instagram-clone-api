const express = require('express');
const PostController = require('../controllers/PostsController');


const ProtectMiddleware = require('../middleware/ProtectMiddleware');

const router = express.Router();



router.use(ProtectMiddleware);

router.route('/').post(PostController.uploadPostPhoto, PostController.resizePostPhoto, PostController.createPost);

router.post('/like/:id', PostController.likePost);
router.post('/unlike/:id', PostController.unlikePost);


module.exports = router