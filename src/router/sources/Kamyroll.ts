import express from 'express';
const router = express.Router();

import Kamyroll from '../../controllers/sources/Kamyroll';

router.get('/info', Kamyroll.info);
// router.get('/loadepisodes/:link', Gogo.loadEpisodes);
// router.post('/loadvideoservers', Gogo.getVideoServers);
router.get('/search/:query', Kamyroll.search);

export default router;
