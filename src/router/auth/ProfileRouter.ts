import express from 'express';
import { Profile } from '../../controllers/auth';
import { Protected } from '../../middleware/authMiddleware';
const ProfileRouter = express.Router();

ProfileRouter.post('/add', Protected, Profile.createProfile);
ProfileRouter.post('/delete/:id', Protected, Profile.deleteProfile);

export default ProfileRouter;
