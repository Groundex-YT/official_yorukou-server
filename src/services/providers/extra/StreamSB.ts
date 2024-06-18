import axios from 'axios';
import { FileUrl, Video, VideoFace, VideoType } from '../../others/classes';
import { IVideo, VideoServerPProps } from '../../others/types';
import { MakeFetch, USER_AGENT } from '../../../utils';

const StreanSB = async (server: URL, isAlt = false) => {
    const videoList: IVideo[] = [];

    const url = server.href;
    const host = 'https://streamsss.net/sources50';
    const host2 = 'https://watchsb.com/sources50';

    let id;

    if (url.includes('.html')) {
        id = url.split('/e/')[1].replace('.html', '');
    } else {
        id = url.split('/e/')[1];
    }

    const bytes = new TextEncoder().encode(id);

    const jsonLink = `${isAlt ? host2 : host}/${PAYLOAD(
        Buffer.from(bytes).toString('hex')
    )}`;

    const json: any = await MakeFetch(jsonLink, {
        headers: {
            watchsb: 'sbstream',
            'User-Agent': USER_AGENT,
            Referer: url
        }
    });

    if (!json?.stream_data)
        throw new Error('No source found. Try a different server.');

    const m3u8Urls: any = await MakeFetch(json.stream_data.file, {
        headers: {
            'User-Agent': USER_AGENT,
            Referer: url.split('e/')[0]
        }
    });

    const videoList1 = m3u8Urls.split('#EXT-X-STREAM-INF:');

    for (const video of videoList1 ?? []) {
        if (!video.includes('m3u8')) continue;

        const url = video.split('\n')[1];
        const quality = video
            .split('RESOLUTION=')[1]
            .split(',')[0]
            .split('x')[1];

        videoList.push({
            url: url,
            quality: `${quality}p`,
            isM3U8: true
        });
    }

    videoList.push({
        quality: 'auto',
        url: json.stream_data.file,
        isM3U8: json.stream_data.file.includes('.m3u8')
    });

    return videoList;
};

const PAYLOAD = (hex: string) =>
    `566d337678566f743674494a7c7c${hex}7c7c346b6767586d6934774855537c7c73747265616d7362/6565417268755339773461447c7c346133383438333436313335376136323337373433383634376337633465366534393338373136643732373736343735373237613763376334363733353737303533366236333463353333363534366137633763373337343732363536313664373336327c7c6b586c3163614468645a47617c7c73747265616d7362`;

export default StreanSB;
