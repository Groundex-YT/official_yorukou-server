import express from 'express';
const router = express.Router();

import Crunchy from '../../controllers/sources/Crunchy';

router.get('/test', Crunchy.test);
// router.get('/loadepisodes/:link', Gogo.loadEpisodes);
// router.post('/loadvideoservers', Gogo.getVideoServers);
// router.get('/search/:query', Kamyroll.search);

export default router;
