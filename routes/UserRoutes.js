const express = require('express');

const UserController = require('../controllers/UserController');
const ProtectMiddleware = require('../middleware/ProtectMiddleware');
const AuthController = require('../controllers/AuthController');
const router = express.Router();



router.use(ProtectMiddleware)


router.patch("/updateMyPassword", AuthController.updatePassword);

router.patch('/updateMe', UserController.uploadUserPhoto,
    UserController.resizeUserPhoto,
    UserController.updateMe);
router.post('/follow/:id', UserController.followUser);

router.delete('/unfollow/:id', UserController.unfollowUser);
router.get('/unfollowing-users', UserController.getUnfollowingUsers)
router.route('/:id').get(UserController.getUser);



router.use(ProtectMiddleware);

module.exports = router