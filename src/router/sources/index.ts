import express from 'express';
import NineAnime from './NineAnime';
import Crunchy from './Crunchy';
import Kaido from './Kaido';
import KAA from './KAA';
import Kamyroll from './Kamyroll';
import Zoro from './Zoro';
import Gogo from './Gogo';
import Fanart from './Fanart';
const router = express.Router();

router.use('/gogo', Gogo);
router.use('/zoro', Zoro);
router.use('/kamyroll', Kamyroll);
router.use('/kickassanime', KAA);
router.use('/9anime', NineAnime);
router.use('/crunchy', Crunchy);
router.use('/kaido', Kaido);
router.use('/fanart', Fanart);

export default router;
