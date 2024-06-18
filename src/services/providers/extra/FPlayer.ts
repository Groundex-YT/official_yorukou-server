import axios from 'axios';
import {
    FileUrl,
    Video,
    VideoContainer,
    VideoFace,
    VideoType
} from '../../others/classes';
import { VideoServerPProps } from '../../others/types';

const FPlayer = async (server: VideoServerPProps) => {
    const url = server.embed?.url;
    const host = server.embed?.referer;

    const apiLink = url.replace('/v/', '/api/source/');
    const videos: VideoFace[] = [];

    try {
        const res = await axios.get(apiLink, {
            headers: {
                referer: host
            }
        });

        if (res.status == 200) {
            res.data.map((file) => {
                videos.push(
                    new Video({
                        quality: parseInt(file.label.replace('p', '')),
                        format: VideoType.CONTAINER,
                        url: new FileUrl({
                            url: file.file,
                            headers: null
                        }),
                        size: null
                    })
                );
            });
        }

        return new VideoContainer({ videos, subtitles: [] });
    } catch (err) {
        console.log(err);
    }
};

export default FPlayer;
