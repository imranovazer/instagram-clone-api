const User = require('../models/User');
const jwt = require("jsonwebtoken");
const Email = require('../utils/email');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');





const signToken = (id) => {
    const access = jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: 1000 * 60 * 15,

    });

    const refresh = jwt.sign({ id }, process.env.SECRET_KEY_REFRESH, {
        expiresIn: '7d'
    })
    return { access, refresh }
};

const createSendToken = (user, statusCode, req, res) => {
    const { access, refresh } = signToken(user._id);

    res.cookie("access", access, {
        expires: new Date(Date.now() + 15 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        // sameSite: 'None',

    });
    res.cookie("refresh", refresh, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
        // sameSite: 'None',

    });

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        tokens: {
            access,
            refresh
        },
        data: {
            user,
        },
    });
};

const AuthController = {
    login: async (req, res, next) => {

        console.log('Login');
        try {
            const { email, password } = req.body;
            // 1) Check if email and password exist
            if (!email || !password) {
                return res.status(400).json({
                    status: "fail",
                    message: "Please privide email and password",
                });
            }
            // 2) Check if user exists && password is correct
            const user = await User.findOne({ email }).select("+password").populate('posts followers following favoritePosts');

            if (!user || !(await user.correctPassword(password, user.password))) {
                return res.status(400).json({
                    status: "fail",
                    message: "Incorrect email or password",
                });
            }

            // 3) If everything ok, send token to client
            createSendToken(user, 200, req, res);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: "fail",
                error,
            });
        }
    },
    logout: async (req, res) => {
        console.log('Logout');

        res.cookie("access", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            // sameSite: 'None',

        });
        res.cookie("refresh", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            // sameSite: 'None',

        });
        return res.status(200).json({ status: "success" });

    }
    ,
    register: async (req, res) => {
        try {
            console.log('Register');

            const { username, email, password, passwordConfirm } = req.body;

            if (password !== passwordConfirm) {
                return res.status(401).json({
                    status: 'fail',
                    message: "Password and confirm password don't match"
                })
            }


            const hashedPassword = await bcrypt.hash(password, 12);
            const newUser = await User.create({
                username: username,
                email: email,
                password: hashedPassword,
            });
            createSendToken(newUser, 201, req, res);
        } catch (error) {
            console.log(error);
            res.status(400).json({
                status: "fail",
                error,
            });
        }
    },
    isAuth: async (req, res) => {
        try {
            // 1) Getting token and check of it's there



            let token;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith("Bearer")
            ) {
                token = req.headers.authorization.split(" ")[1];
            } else if (req.cookies.access) {
                token = req.cookies.access;
            }


            if (!token) {
                return res.status(401).json({
                    status: "fail",
                    message: "You are not logged in",
                });
            }


            const decoded = await jwt.verify(token, process.env.SECRET_KEY);

            const currentUser = await User.findById(decoded.id).populate('posts followers following favoritePosts');
            if (!currentUser) {
                return res.status(401).json({
                    status: "fail",
                    message: "User doesn't exsists",
                });
            }
            res.status(200).json({
                status: 'success',
                data: currentUser
            })
        } catch (error) {
            return res.status(401).json({
                status: "fail",
                error,
            });
        }
    },
    refreshToken: async (req, res) => {
        try {
            console.log('Refresh');


            let token;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith("Bearer")
            ) {
                token = req.headers.authorization.split(" ")[1];
            } else if (req.cookies.refresh) {
                token = req.cookies.refresh;
            }

            if (!token) {
                return res.status(400).json({
                    status: "fail",
                    message: "You don't have refresh token",
                });
            }
            const decoded = await jwt.verify(token, process.env.SECRET_KEY_REFRESH);

            // 3) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return res.status(400).json({
                    status: "fail",
                    message: "User doesn't exsists",
                });
            }
            // 4) Check if user changed password after the token was issued

            createSendToken(currentUser, 200, req, res);


        } catch (error) {
            return res.status(500).json({
                status: "fail",
                error,
            });

        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json({
                    status: "fail",
                    message: "No user with this email",
                });
            }

            // 2) Generate the random reset token
            const resetToken = user.createPasswordResetToken();
            await user.save({ validateBeforeSave: false });

            // 3) Send it to user's email
            try {

                const resetURL = `${process.env.FRONT_URL}/reset-password/${resetToken}`;
                await new Email(user, resetURL).sendPasswordReset();

                res.status(200).json({
                    status: "success",
                    message: "Token sent to email!",
                });
            } catch (err) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save({ validateBeforeSave: false });
                console.log(err);
                return res.status(500).json({
                    status: "fail",
                    message: "Error while sending email, try later",
                });
            }
        } catch (error) {
            return res.status(400).json({
                status: "fail",
                error,
            });
        }
        // 1) Get user based on POSTed email
    },
    checkValidityOfResetPassword: async (req, res) => {
        console.log("Check validity");
        try {
            const hashedToken = crypto
                .createHash("sha256")
                .update(req.params.token)
                .digest("hex");

            const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() },
            });
            if (!user) {
                return res.status(403).json({
                    status: "fail",
                    message: "You don't have access to this page",
                });

            }
            else {
                return res.status(200).json(
                    {
                        status: 'success',
                        message: 'You have access to this page'
                    }
                )

            }

        } catch (error) {
            console.log(error);
            res.status(500).json(
                {
                    staus: 'fail',
                    error
                }
            )

        }


    },
    resetPassword: async (req, res, next) => {
        try {
            // 1) Get user based on the token
            const hashedToken = crypto
                .createHash("sha256")
                .update(req.params.token)
                .digest("hex");

            const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() },
            });

            // 2) If token has not expired, and there is user, set the new password
            if (!user) {
                return res.status(400).json({
                    status: "fail",
                    message: "Token is invalid or expired",
                });
            }


            user.password = await bcrypt.hash(req.body.password, 12);

            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            return res.status(200).json(
                {
                    status: 'success',
                    message: 'Your password changed successfully'
                }
            )


        } catch (error) {
            return res.status(400).json({
                status: "fail",
                error,
            });
        }
    },
    updatePassword: async (req, res, next) => {
        try {
            // 1) Get user from collection
            const user = await User.findById(req.user.id).select("+password");


            // 2) Check if POSTed current password is correct
            if (
                !(await user.correctPassword(req.body.passwordCurrent, user.password))
            ) {
                return res.status(400).json({
                    status: "fail",
                    message: "Your current password is wrong",
                });
            }

            // 3) If so, update password
            user.password = req.body.password;

            await user.save();
            // User.findByIdAndUpdate will NOT work as intended!

            // 4) Log user in, send JWT
            createSendToken(user, 200, req, res);
        } catch (error) {
            return res.status(400).json({
                status: "fail",
                error,
            });
        }
    }

}

module.exports = AuthController