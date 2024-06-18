import express from 'express';
const router = express.Router();

import NineAnime from '../../controllers/sources/NineAnime';

router.get('/', NineAnime.info);
router.get('/loadepisodes/:link', NineAnime.loadEpisodes);
router.post('/loadvideoservers', NineAnime.getVideoServers);
router.post('/video-extractor', NineAnime.ExtractVideo);
router.get('/search', NineAnime.search);

export default router;
