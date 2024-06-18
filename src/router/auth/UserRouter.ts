import express, { Request, Response } from 'express';
import { Login, Profile } from '../../controllers/auth';
import { Protected } from '../../middleware/authMiddleware';
import axios from 'axios';

const UserRouter = express.Router();

UserRouter.post('/login', Login.signIn);
UserRouter.post('/register', Login.signUp);
UserRouter.post('/logout', Login.signOut);
UserRouter.get('/refresh_token', Login.refreshToken);
UserRouter.get('/me', Protected, Login.getMe);
UserRouter.get('/users', Protected, Login.getAllUsers);
UserRouter.post('/checker', Login.signChecker);
UserRouter.post('/token', async (req: Request, res: Response) => {
    const { client_id, client_secret, redirect_uri, code } = req.body;

    try {
        const fetch = await axios({
            method: 'post',
            url: `https://anilist.co/api/v2/oauth/token`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            data: {
                grant_type: 'authorization_code',
                client_id,
                client_secret,
                redirect_uri,
                code
            }
        });

        res.status(201).json(fetch.data);
    } catch (err) {
        res.status(500).send(err);
    }
});

export default UserRouter;
