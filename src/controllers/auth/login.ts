import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import { Types } from 'mongoose';
import JWT from 'jsonwebtoken';
import Profile from '../../models/Profile';
import { Pagination } from '../../utils/types';

const EmailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

const isProduction = process.env.NODE_ENV === 'procution';

const Login = {
    signChecker: async (req: Request, res: Response) => {
        const body = req.body;

        try {
            if (!body.username || body.username.length <= 0) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Username`
                });
            }

            if (
                !body.email ||
                body.email.length <= 0 ||
                !(body.email as string).match(EmailRegex)
            ) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email or Password`
                });
            }

            const user = await User.findOne({
                email: body.email.toLowerCase()
            });

            if (user)
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email or Password`
                });

            if (!body.password || (body.password as string).length < 6) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email or Password (Password is 6+ char long)`
                });
            }

            return res.status(200).json({
                sucess: true,
                message: 'passed'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    signUp: async (req: Request, res: Response) => {
        const body = req.body;

        try {
            const { userId, username, avatar, bg, isAdult, accessToken } =
                body.profile;

            if (!body.username || body.username.length <= 0) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Username`
                });
            }

            if (
                !body.email ||
                body.email.length <= 0 ||
                !(body.email as string).match(EmailRegex)
            ) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email & Password`
                });
            }

            const user = await User.findOne({ email: body.email });

            if (user)
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email & Password`
                });

            if (!body.password || (body.password as string).length < 6) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid Email & Password (Password is 6+ char long)`
                });
            }

            const password = await bcrypt.hash(body.password, 12);

            const newSave = new User({
                username: body.username,
                email: body.email,
                password: password
            });

            const profile = await Profile.findOne({ userId: userId });

            if (profile) {
                return res.status(400).json({
                    success: false,
                    msg: `Profile is on some other persons account.`
                });
            }

            const newProfile = new Profile({
                userId,
                owner: newSave._id,
                username,
                avatar,
                bg,
                isAdult,
                accessToken
            });

            await newSave.save();
            await newProfile.save();

            const token = generateActiveToken({ id: newSave._id });

            return res.status(200).json({
                sucess: true,
                data: newSave,
                activeToken: token
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    signIn: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email: email });

            if (!user)
                return res.status(400).json({
                    success: false,
                    msg: `Account doesn't exist`
                });

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch)
                return res.status(400).json({
                    success: false,
                    msg: `Invalid email or password.`
                });

            const accessToken = generateAccessToken({ id: user._id });
            const refreshToken = generateRefreshToken({ id: user._id });

            res.cookie('refjwt', refreshToken, {
                httpOnly: true,
                path: '/api/v1/auth/refresh_token',
                maxAge: 30 * 24 * 60 * 60 * 1000,
                secure: isProduction ? true : false
            });

            res.json({
                success: true,
                msg: 'successfully logged in',
                accessToken
                //@ts-ignore
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    signOut: async (req: Request, res: Response) => {
        try {
            await res.clearCookie('refjwt', {
                path: '/api/v1/auth/refresh_token'
            });

            res.json({
                success: true,
                msg: 'Logged out'
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    refreshToken: async (req: Request, res: Response) => {
        try {
            const refJWT = req.cookies.refjwt;
            if (!refJWT)
                return res.status(400).json({
                    success: false,
                    msg: `Please login first`
                });

            const decoded = await (<{ id: Types.ObjectId }>(
                JWT.verify(refJWT, process.env.JWT_REFRESH_SECRET)
            ));

            if (!decoded)
                return res.status(400).json({
                    success: false,
                    msg: `Please login first`
                });

            const user = await User.findById(decoded.id).select('-password');
            if (!user)
                return res.status(400).json({
                    success: false,
                    msg: `Account no longer exist`
                });

            const accessToken = generateAccessToken({ id: user._id });

            res.status(200).json({
                success: true,
                accessToken
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    getMe: async (req: Request, res: Response) => {
        try {
            //@ts-ignore
            const user: User = req.user as any;
            const { _id, username, email, avatar, role } = user;

            const profiles = await Profile.find({ owner: user._id });

            const newUser = { _id, username, email, avatar, role, profiles };

            res.status(200).json({
                success: true,
                user: newUser
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    },
    getAllUsers: async (req: Request, res: Response) => {
        try {
            const { pg = '1', size = '10' } = req.query;

            const page: number = parseInt(pg as string),
                limit: number = parseInt(size as string);

            let data: Pagination<Array<typeof User | {}>> = {
                success: true,
                data: [{}],
                per_page: limit,
                total: 0,
                total_pages: 0,
                current_page: page,
                has_next: false,
                has_prev: false
            };

            const count = await User.countDocuments({}).exec();

            data.total_pages = Math.ceil(count / limit);
            data.total = count;

            if (page < 0 || page === 0 || page > data.total_pages) {
                return res.status(400).json({
                    success: false,
                    msg: `Invalid page number`
                });
            }

            if (page * limit < data.total) {
                data.has_next = true;
            }

            if ((page - 1) * limit > 0) {
                data.has_prev = true;
            }

            //@ts-ignore
            data.data = await User.find({})
                .sort({ dateCreated: 1, dateModified: -1 })
                .skip(limit * (page - 1))
                .limit(limit)
                .exec();

            res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({
                success: false,
                msg: `${err.message}`
            });
        }
    }
};

const generateActiveToken = (payload: Object): string => {
    const token = JWT.sign(payload, process.env.JWT_ACTIVE_SECRET, {
        expiresIn: '5m'
    });

    return token;
};

const generateAccessToken = (payload: Object): string => {
    const token = JWT.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m'
    });

    return token;
};

const generateRefreshToken = (payload: Object): string => {
    const token = JWT.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d'
    });

    return token;
};

export default Login;
