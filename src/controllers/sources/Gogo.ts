import { Response, Request } from 'express';
import GogoANIME from '../../services/providers/anime/Gogo';

const Gogoanime = new GogoANIME();

const Gogo = {
    home: async (req: Request, res: Response) => {
        res.status(200).json({
            intro: "Welcome to the gogoanime provider: check out the provider's website @ https://gogoanimehd.io/",
            routes: [
                '/search?keyward=[name]&page=1',
                '/info/:id',
                '/watch',
                '/servers/:episodeId'
            ],
            Creator: 'Groundex-YT'
        });
    },
    search: async (req: Request, res: Response) => {
        const { keyward } = req.query;

        try {
            const rest = await Gogoanime.search(keyward.toString());

            res.json(rest);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    info: async (req: Request, res: Response) => {
        const { id } = req.params;

        try {
            const rest = await Gogoanime.fetchAnimeInfo(id);

            res.json(rest);
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },
    fetchEpisodeServers: async (req: Request, res: Response) => {
        const { episodeId } = req.params;

        try {
            const resp = await Gogoanime.fetchEpisodeServers(episodeId);

            res.status(200).json(resp);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    },
    fetchEpisodeSources: async (req: Request, res: Response) => {
        const { episodeId, server } = req.body;

        try {
            const resp = await Gogoanime.fetchEpisodeSources(
                episodeId,
                server.toLowerCase()
            );

            res.status(200).json(resp);
        } catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

export default Gogo;
