import { USER_AGENT } from '../../../utils';
import { VideoServerPProps } from '../../others/types';

export const Filemoon = (server: VideoServerPProps) => {
    const newUrl = new URL(server.embed.url);

    const options = {
        headers: {
            Referer: newUrl.href,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': USER_AGENT,
            'X-Requested-With': 'XMLHttpRequest'
        }
    };
};
