import { Request, Response } from 'express';
import KaidoInfo, {
    loadEpisodes,
    loadVideoServers,
    getVideoExtractor,
    search
} from '../../services/providers/anime/Kaido';

const Kaido = {
    info: async (req: Request, res: Response) => {
        res.json(KaidoInfo);
    },
    loadEpisodes: async (req: Request, res: Response) => {
        const { link } = req.params;

        try {
            const resp = await loadEpisodes(link);

            res.status(200).json(resp);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },
    getVideoServers: async (req: Request, res: Response) => {
        const { link } = req.body;

        try {
            const resp = await loadVideoServers(link);

            res.status(200).json(resp);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },
    ExtractVideo: async (req: Request, res: Response) => {
        const { server } = req.body;

        try {
            const rest = await getVideoExtractor(server);

            res.json(rest);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    search: async (req: Request, res: Response) => {
        const { keyward } = req.query;

        try {
            const rest = await search(keyward.toString());

            res.json(rest);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

export default Kaido;
