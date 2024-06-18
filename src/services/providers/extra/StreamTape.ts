import axios from 'axios';
import { load } from 'cheerio';
import {
    FileUrl,
    VideoContainer,
    VideoFace,
    VideoType,
    Video
} from '../../others/classes';
import { VideoServerPProps } from '../../others/types';

const StreamTape = async (server: VideoServerPProps) => {
    const url = server.embed?.url;
    const host = server.embed?.referer;
    const newUrl = new URL(server.embed.url);

    try {
        const videoList: VideoFace[] = [];

        const { data } = await axios.get(newUrl.href).catch(() => {
            throw new Error('Video not found');
        });

        const $ = load(data);

        let [fh, sh] = $.html()
            ?.match(/robotlink'\).innerHTML = (.*)'/)![1]
            .split("+ ('");

        sh = sh.substring(3);
        fh = fh.replace(/\'/g, '');

        const url = `https:${fh}${sh}`;

        videoList.push(
            new Video({
                quality: null,
                format: VideoType.CONTAINER,
                url: new FileUrl({
                    url,
                    headers: null
                }),
                size: null
            })
        );

        return new VideoContainer({ videos: videoList, subtitles: [] });
    } catch (err) {
        console.log(err);
        throw new Error((err as Error).message);
    }
};

export default StreamTape;
