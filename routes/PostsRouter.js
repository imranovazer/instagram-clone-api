const express = require('express');
const PostController = require('../controllers/PostsController');


const ProtectMiddleware = require('../middleware/ProtectMiddleware');
const CommentController = require('../controllers/CommentController');

const router = express.Router();



router.use(ProtectMiddleware);

router.route('/').post(PostController.uploadPostPhoto, PostController.resizePostPhoto, PostController.createPost);

router.post('/like/:id', PostController.likePost);
router.delete('/unlike/:id', PostController.unlikePost);
router.post('/comment/:postId', CommentController.createComment);
router.delete('/comment/:commentId', CommentController.deleteComment);


module.exports = router