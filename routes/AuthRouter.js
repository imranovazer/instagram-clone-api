const express = require('express');

const AuthController = require('../controllers/AuthController');
const ProtectMiddleware = require('../middleware/ProtectMiddleware');
const router = express.Router();


router.post("/refresh-token", AuthController.refreshToken)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);
router.post("/echo", AuthController.isAuth)
router.post("/forgot-password", AuthController.forgotPassword);
router.patch("/reset-password/:token", AuthController.resetPassword);
router.post("/check-reset-token/:token", AuthController.checkValidityOfResetPassword)



router.use(ProtectMiddleware);

module.exports = router