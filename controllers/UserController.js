const User = require('../models/User')
const UserController = {
    unfollowUser: async (req, res) => {

        try {
            console.log('Unfollow');

            const userToUnfollow = await User.findById(req.params.id);
            const MyUserData = req.user;
            console.log(MyUserData);


            if (JSON.stringify(MyUserData._id) == JSON.stringify(userToUnfollow._id)) {

                return res.status(400).json(
                    {
                        status: 'fail',
                        message: ' You can not unfollow yourself'
                    }
                )
            }
            userToUnfollow.followers = userToUnfollow.followers.filter(item => !item.equals(MyUserData._id));

            await userToUnfollow.save();

            MyUserData.following = MyUserData.following.filter(item => !item.equals(userToUnfollow._id));

            await MyUserData.save();

            return res.status(200).json(
                {
                    status: 'sucess',
                    message: 'User unsubscibed successfully!'
                }
            )

        } catch (error) {
            console.log(error);
            return res.status(500).json(
                {

                    status: 'failkkkkkkkk',
                    error
                }
            )
        }

    },

    followUser: async (req, res) => {
        console.log('Follow');

        try {
            const userToFollow = await User.findById(req.params.id);
            const MyUserData = req.user;

            if (JSON.stringify(MyUserData._id) == JSON.stringify(userToFollow._id)) {
                return res.status(400).json(
                    {
                        status: 'fail',
                        message: ' You can not follow yourself'
                    }
                )
            }

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
            console.log(error);
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