import express from 'express';
const router = express.Router();

import KAA from '../../controllers/sources/KAA';

router.get('/', KAA.info);
router.get('/loadepisodes/:link', KAA.loadEpisodes);
router.post('/loadvideoservers', KAA.getVideoServers);
router.post('/video-extractor', KAA.ExtractVideo);
router.get('/search', KAA.search);

export default router;
