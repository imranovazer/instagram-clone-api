const express = require('express');

const UserController = require('../controllers/UserController');
const ProtectMiddleware = require('../middleware/ProtectMiddleware');
const router = express.Router();



router.use(ProtectMiddleware)

router.post('/updateMe', UserController.uploadUserPhoto,
    UserController.resizeUserPhoto,
    UserController.updateMe);
router.post('/follow/:id', UserController.followUser);

router.delete('/unfollow/:id', UserController.unfollowUser);




router.use(ProtectMiddleware);

module.exports = router