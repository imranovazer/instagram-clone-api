const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const ProtectMiddleware = async (req, res, next) => {
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

        // 2) Verification token
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "User doesn't exsists",
            });
        }
        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        // res.locals.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "Invalid token",
            error,
        });
    }
};

module.exports = ProtectMiddleware