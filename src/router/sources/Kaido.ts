import express from 'express';
const router = express.Router();

import Kaido from '../../controllers/sources/Kaido';

router.get('/', Kaido.info);
router.get('/loadepisodes/:link', Kaido.loadEpisodes);
router.post('/loadvideoservers', Kaido.getVideoServers);
router.post('/video-extractor', Kaido.ExtractVideo);
router.get('/search', Kaido.search);

export default router;
