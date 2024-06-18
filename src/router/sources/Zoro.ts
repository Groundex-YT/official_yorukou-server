import express from 'express';
const router = express.Router();

import Zoro from '../../controllers/sources/Zoro';

router.get('/', Zoro.info);
router.get('/loadepisodes/:link', Zoro.loadEpisodes);
router.post('/loadvideoservers', Zoro.getVideoServers);
router.post('/video-extractor', Zoro.ExtractVideo);
router.get('/search', Zoro.search);

export default router;
