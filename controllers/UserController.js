const User = require('../models/User')

const UserController = {
    unfollowUser: async (req, res) => {
        const userToUnfollow = await User.findById(req.params.id);
        const MyUserData = req.user;







    },


    followUser: async (req, res) => {

        try {
            const userToFollow = await User.findById(req.params.id);
            const MyUserData = req.user;

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