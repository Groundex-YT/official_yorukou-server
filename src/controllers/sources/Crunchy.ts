import { Response, Request } from 'express';
import {
    getAccessToken,
    search,
    loadEpisodes,
    loadVideoServers
} from '../../services/providers/anime/Yomiroll';

const Crunchy = {
    // info: async (req: Request, res: Response) => {
    //     res.json(GogoInfo);
    // },
    test: async (req: Request, res: Response) => {
        const { keyward } = req.query;

        try {
            const resp = await loadVideoServers(keyward.toString());

            res.status(200).json(resp);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
    // loadEpisodes: async (req: Request, res: Response) => {
    //     const { link } = req.params;

    //     try {
    //         const resp = await loadEpisodes(link);

    //         res.status(200).json(resp);
    //     } catch (err) {
    //         res.status(500).json({
    //             success: false,
    //             message: err.message
    //         });
    //     }
    // },
    // getVideoServers: async (req: Request, res: Response) => {
    //     const { link } = req.body;

    //     try {
    //         const resp = await getVideoServers(link);

    //         res.status(200).json(resp);
    //     } catch (err) {
    //         res.status(500).json({
    //             success: false,
    //             message: err.message
    //         });
    //     }
    // },
    // ExtractVideo: async (req: Request, res: Response) => {
    //     const { server } = req.body;

    //     try {
    //         const rest = await getVideoExtractor(server);

    //         res.json(rest);
    //     } catch (err) {
    //         res.status(500).json({ success: false, message: err.message });
    //     }
    // },
    // search: async (req: Request, res: Response) => {
    //     const { keyward } = req.query;

    //     try {
    //         const rest = await search(
    //             keyward.toString(),
    //             req.query.dubbed ? req.query.dubbed.toString() : 'false'
    //         );

    //         res.json(rest);
    //     } catch (err) {
    //         res.status(500).json({ success: false, message: err.message });
    //     }
    // }
};

export default Crunchy;
