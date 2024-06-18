import { Response, Request } from 'express';
import FanArt from '../../services/providers/others/Fanart';

const Fanart = {
    test: async (req: Request, res: Response) => {
        const artwork = new FanArt();
        const { keyward } = req.query;

        try {
            const resp = await artwork.Search(keyward.toString());

            res.status(200).json(resp);
        } catch (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
};

export default Fanart;
