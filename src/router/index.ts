import express from 'express';
import UserRouter from './auth/UserRouter';
import ProfileRouter from './auth/ProfileRouter';
import Providers from './sources';

const router = express.Router();

router.use('/auth', UserRouter);
router.use('/profile', ProfileRouter);
router.use('/providers', Providers);

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        msg: 'AyOo 😁 !!!'
    });
});

export default router;
