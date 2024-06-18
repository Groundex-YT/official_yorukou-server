import axios from 'axios';
import cheerio from 'cheerio';
import {
    Episode,
    FileUrl,
    MediaSearchCard,
    Subtitle,
    SubtitleFace,
    Video,
    VideoContainer,
    VideoFace,
    VideoServer,
    VideoType
} from '../../others/classes';
import {
    EpisodePatternProp,
    MediaSearchCardProps,
    VideoServerPProps
} from '../../others/types';
import { DecryptionKey } from '../extra/RapidCloud';
import StreanSB from '../extra/StreamSB';
import StreamTape from '../extra/StreamTape';
import * as CryptoJS from 'crypto-js';
import { USER_AGENT } from '../../../utils';

const Kaido = {
    saveName: 'kaido_to',
    name: 'Kaido',
    dub: true,
    url: 'https://kaido.to'
};

let headers = {
    'X-Requested-With': 'XMLHttpRequest',
    referer: Kaido.url
};

export const loadEpisodes = async (animeLink: string) => {
    const res = await axios.get(`${Kaido.url}/ajax/episode/list/${animeLink}`, {
        headers
    });
    const body = res.data;
    const $ = cheerio.load(body.html);
    const promises: Episode[] = [];

    $(`.detail-infor-content > div > a`).each((i, elem) => {
        const $el = $(elem);
        const title = $el.attr('title');
        const number = parseInt(
            $el.attr('data-number').replace('\n', '').trim()
        );
        const id = $el.attr('data-id');
        const filler = $el.attr('class').includes('ssl-item-filler');

        promises.push(
            new Episode({
                number: number,
                title: title,
                link: id,
                filler: filler
            })
        );
    });

    return await Promise.all(promises);
};

export const getVideoExtractor = async (server: VideoServerPProps) => {
    const domain = new URL(server.embed.url).host;

    if (domain.includes('rapid')) return await RapidCloud(server);
    // if (domain.includes('sb')) return await StreanSB(server);
    if (domain.includes('streamta')) return await StreamTape(server);

    return null;
};

export const loadVideoServers = async (episodeLink: string) => {
    const res = await axios.get(
        `${Kaido.url}/ajax/episode/servers?episodeId=${episodeLink}`,
        { headers }
    );
    const body = res.data;
    const $ = cheerio.load(body.html);

    const Promises: VideoServerPProps[] = [];

    for (const elem of $('div.server-item')) {
        const $el = $(elem);
        const serverName = `${$el.attr('data-type').toUpperCase()} - ${$el
            .text()
            .trim()}`;
        const resLink = await axios.get(
            `${Kaido.url}/ajax/episode/sources?id=${$el.attr('data-id')}`,
            { headers }
        );

        let link = resLink.data.link;

        Promises.push(
            new VideoServer({
                name: serverName,
                embed: {
                    url: link,
                    referer: Kaido.url
                }
            })
        );
    }

    return await Promise.all(Promises);
};

export const search = async (query: string) => {
    let url = encodeURI(query);
    const res = await axios.get(`${Kaido.url}/search?keyword=${url}`);
    const body = res.data;

    const $ = cheerio.load(body);

    const promises: MediaSearchCardProps[] = [];

    $('.film_list-wrap > .flw-item > .film-poster').each((i, elem) => {
        const $el = $(elem);
        const link = $el.find('a').attr('data-id');
        const title = $el.find('a').attr('title');
        const cover = $el.find('img').attr('data-src');

        promises.push(
            new MediaSearchCard({
                link,
                name: title,
                coverImage: cover
            })
        );
    });

    return await Promise.all(promises);
};

const RapidCloud = async (server: VideoServerPProps) => {
    const videos: VideoFace[] = [];
    const subtitles: SubtitleFace[] = [];
    let decryptionKey = await DecryptionKey(0);

    try {
        const videoUrl = new URL(server.embed.url);
        const id = server.embed.url.split('/').pop().split('?')[0];

        const options = {
            headers: {
                // 'X-Requested-With': 'XMLHttpRequest',
                Referer: server.embed.referer
                // 'User-Agent': USER_AGENT
            }
        };

        const res = await axios.get(
            `https://${videoUrl.host}/ajax/embed-6-v2/getSources?id=${id}`,
            options
        );

        let {
            data: { sources, tracks, intro, encrypted, sourcesBackup }
        } = res;

        try {
            if (encrypted) {
                const sourcesArray = sources.split('');
                let extractedKey = '';

                //@ts-ignore
                for (const index of JSON.parse(decryptionKey)) {
                    for (let i = index[0]; i < index[1]; i++) {
                        extractedKey += sources[i];
                        sourcesArray[i] = '';
                    }
                }

                decryptionKey = extractedKey;
                sources = sourcesArray.join('');

                const decrypt = CryptoJS.AES.decrypt(sources, decryptionKey);
                sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                if (sourcesBackup) {
                    const decryptT = CryptoJS.AES.decrypt(
                        sourcesBackup,
                        decryptionKey
                    );

                    sourcesBackup = JSON.parse(
                        decryptT.toString(CryptoJS.enc.Utf8)
                    );
                }
            }
        } catch (err) {
            console.log(err);
            throw new Error(
                'Cannot decrypt sources. Perhaps the key is invalid.'
            );
        }

        sources.map((video) => {
            videos.push(
                new Video({
                    quality: 0,
                    format: VideoType.M3U8,
                    url: new FileUrl({
                        url: video.file,
                        headers: null
                    }),
                    size: null
                })
            );
        });

        if (sourcesBackup) {
            sourcesBackup?.map((video) => {
                videos.push(
                    new Video({
                        quality: 0,
                        format: VideoType.M3U8,
                        url: new FileUrl({
                            url: video.file,
                            headers: null
                        }),
                        size: null,
                        extraNote: 'Backup'
                    })
                );
            });
        }

        tracks.map((sub) => {
            if (
                sub.kind === 'captions' &&
                sub.label != null &&
                sub.file != null
            ) {
                subtitles.push(
                    new Subtitle({
                        language: sub.label,
                        lang: sub?.label,
                        file: sub.file,
                        type: null
                    })
                );
            }
        });

        return new VideoContainer({ videos, subtitles });
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
};

export default Kaido;
