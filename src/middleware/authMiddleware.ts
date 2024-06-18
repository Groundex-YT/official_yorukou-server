import JWT from 'jsonwebtoken';
import User from '../models/User';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';

export const Protected = asyncHandler(
    //@ts-ignore
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer '))
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized, Invalid token'
            });

        try {
            const decoded = JWT.verify(
                token.split(' ')[1],
                process.env.JWT_ACCESS_SECRET
            );

            if (!decoded)
                return res.status(401).json({
                    success: false,
                    msg: 'Unauthorized, Invalid token'
                });

            const user = await User.findById(decoded.id)
                .select('-password')
                .select('-createdAt')
                .select('-updatedAt');

            //@ts-ignore
            req.user = user;

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized'
            });
        }
    }
);

export const IsAdmin = asyncHandler(
    //@ts-ignore
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            //@ts-ignore
            if (req.user.role !== 'admin') {
                return res.status(401).json({
                    success: false,
                    msg: 'Unauthorized, Only admin can both access and modify this model'
                });
            }

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                msg: 'Unauthorized'
            });
        }
    }
);
