import { Response, Request } from 'express';
import KamyrollInfo, {
    loadEpisodes,
    search
} from '../../services/providers/anime/Kamyroll';

const Kamyroll = {
    info: (req: Request, res: Response) => {
        res.status(200).json(KamyrollInfo);
    },
    search: async (req: Request, res: Response) => {
        const { query } = req.params;

        try {
            const fetch = await search(query);

            res.status(200).json(fetch);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
            console.log(err);
        }
    }
};

export default Kamyroll;
