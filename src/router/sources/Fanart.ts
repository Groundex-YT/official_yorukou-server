import express from 'express';
const router = express.Router();

import Fanart from '../../controllers/sources/Fanart';

router.get('/search', Fanart.test);

export default router;
