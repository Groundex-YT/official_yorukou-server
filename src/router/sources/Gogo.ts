import express from 'express';
const router = express.Router();

import Gogo from '../../controllers/sources/Gogo';

router.get('/', Gogo.home);
router.get('/search', Gogo.search);
router.get('/info/:id', Gogo.info);
router.get('/servers/:episodeId', Gogo.fetchEpisodeServers);
router.post('/watch', Gogo.fetchEpisodeSources);

export default router;
