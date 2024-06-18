import { Request, Response } from 'express';
import Profile from '../../models/Profile';
import User from '../../models/User';

const Profiles = {
    createProfile: async (req: Request, res: Response) => {
        const { userId, username, avatar, bg, isAdult, accessToken } = req.body;

        try {
            //@ts-ignore
            const user: User = req.user as any;
            const { _id } = user;

            const owner = _id;

            const newProfile = new Profile({
                userId,
                owner,
                username,
                avatar,
                bg,
                isAdult,
                accessToken
            });

            await newProfile.save();

            res.status(200).json({
                success: true,
                profile: newProfile
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    deleteProfile: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            //@ts-ignore
            const user: User = req.user as any;
            const { _id, role } = user;

            const isProfile = await Profile.findOne({ userId: id });

            if (!isProfile)
                return res.status(400).json({
                    success: false,
                    msg: `Profile does not exist`
                });

            if (`${isProfile.owner}` !== `${_id}` && role !== 'admin')
                return res.status(400).json({
                    success: false,
                    msg: `Error Unauthorized`
                });

            await Profile.findByIdAndDelete(isProfile._id);

            res.status(200).json({
                success: true,
                msg: 'Profile was successfully deleted'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    }
};

export default Profiles;
