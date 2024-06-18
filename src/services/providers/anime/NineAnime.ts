import axios from 'axios';
import cheerio from 'cheerio';
import {
    Episode,
    FileUrl,
    MediaSearchCard,
    SubtitleFace,
    Video,
    VideoContainer,
    VideoContainerFace,
    VideoFace,
    VideoServer,
    VideoType
} from '../../others/classes';
import {
    EpisodePatternProp,
    MediaSearchCardProps,
    VideoServerPProps
} from '../../others/types';
import { decode, encode } from 'ascii-url-encoder';
import StreamTape from '../extra/StreamTape';
import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

const NineAnime = {
    saveName: '9anime_ph',
    name: '9anime',
    dub: true,
    url: 'https://9anime.ph'
};

const proxy =
    'http://97788b109427863975b6936b813d0057df343092:js_render=true&antibot=true@proxy.zenrows.com:8001';
const httpAgent = new HttpProxyAgent(proxy);
const httpsAgent = new HttpsProxyAgent(proxy);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = axios.create({
    httpAgent,
    httpsAgent
});

export const search = async (query: string, dub: boolean = false) => {
    const vrf = await encodeVrf(query);

    const searchLink = `${NineAnime.url}/filter?language%5B%5D=${
        dub ? 'dubbed' : 'subbed'
    }&keyword=${encode(query)}&vrf=${vrf}&page=1`;

    const res = await client.get(searchLink);

    const body = res.data;
    const $ = cheerio.load(body);

    const results: MediaSearchCardProps[] = [];

    $(`#list-items div.ani.poster.tip > a`).each((i, elem) => {
        const $el = $(elem);
        const link = $el.attr('href').split('/')?.[2];
        const img = $el.find('img');
        const title = img.attr('alt');
        const cover = img.attr('src');

        results.push(
            new MediaSearchCard({
                name: title,
                link,
                coverImage: cover
            })
        );
    });

    return await Promise.all(results);
};

export const loadEpisodes = async (animeLink: string, dub: boolean = false) => {
    const newLink = `${NineAnime?.url}/watch/${animeLink}`;

    const res = await client.get(newLink);
    const body = res.data;

    const $ = cheerio.load(body);

    const id = $('#watch-main').attr('data-id');

    const idVrfed = await encodeVrf(id);

    const { data } = await client.get(
        `${NineAnime.url}/ajax/episode/list/${id}?vrf=${idVrfed}`
    );

    const $$ = cheerio.load(data?.result);
    const episodes: EpisodePatternProp[] = [];

    $$('ul > li > a').each((i, el) => {
        const possibleIds = $$(el).attr('data-ids')?.split(',')!;
        const id = dub ? possibleIds[1] : possibleIds[0];
        const number = parseInt($$(el).attr('data-num')?.toString()!);
        const title =
            $$(el).find('span').text().length > 0
                ? $$(el).find('span').text()
                : null;
        const filler = $$(el).hasClass('filler');

        episodes.push(
            new Episode({
                number,
                title,
                link: id,
                filler
            })
        );
    });

    return await Promise.all(episodes);
};

export const loadVideoServers = async (
    episodeLink: string
): Promise<VideoServerPProps[]> => {
    const encoded = await encodeVrf(episodeLink);
    const { data } = await client.get(
        `${NineAnime.url}/ajax/server/list/${episodeLink}?vrf=${encoded}`
    );

    const $ = cheerio.load(data?.result);

    const Promises: VideoServerPProps[] = [];

    for (const elem of $('.type > ul > li')) {
        const $el = $(elem);
        const serverId = $el.attr('data-link-id')!;
        const name = $el.text();
        const fullEpLink = await getEpisodeLinks(serverId);

        Promises.push(
            new VideoServer({
                name,
                embed: {
                    url: fullEpLink,
                    referer: NineAnime.url
                }
            })
        );
    }

    return await Promise.all(Promises);
};

export const getVideoExtractor = async (server: VideoServerPProps) => {
    if (server.name === 'Vidstream') return await extractor(server);
    if (server.name === 'MyCloud') return await extractor(server);
    if (server.name === 'Streamtape') return await StreamTape(server);
    // if (server.name === "Filemoon") return await StreamTape(server)
    // if (domain.includes('sb')) return await StreanSB(server);
    // if (domain.includes('streamta')) return await StreamTape(server);

    return null;
};

const extractor = async (server: VideoServerPProps) => {
    const slug = server.embed.url.split('e/')[1];
    const isMcloud = server.name == 'MyCloud';
    const servert = isMcloud ? 'Mcloud' : 'Vizcloud';
    const url = `https://9anime.eltik.net/raw${servert}?query=${slug}&apikey=saikou`;
    const apiUrl = (await client.get(url)).data?.rawURL;

    const video: VideoFace[] = [];
    const subtitleArr: SubtitleFace[] = [];

    if (apiUrl != null) {
        const referer = isMcloud ? 'https://mcloud.to/' : 'https://9anime.to/';
        const res = await axios.get(apiUrl, {
            headers: {
                referer: referer
                // 'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
        });

        console.log(res.data);

        res?.data?.result?.sources?.map((e) => {
            video.push(
                new Video({
                    quality: null,
                    format: VideoType.M3U8,
                    url: new FileUrl({
                        url: e.file,
                        headers: {
                            referer: url
                        }
                    }),
                    size: null
                })
            );
        });
    }

    return new VideoContainer({ videos: video, subtitles: [] });
};

const getEpisodeLinks = async (id: string) => {
    const { data } = await client.get(
        `https://9anime.eltik.net/vrf?query=${encodeURIComponent(
            id
        )}&apikey=saikou`
    );

    const serverSource = (
        await client.get(
            `${NineAnime.url}/ajax/server/${id}?vrf=${encodeURIComponent(
                data?.url
            )}`
        )
    ).data;

    const embedURL = (
        await client.get(
            `https://9anime.eltik.net/decrypt?query=${encodeURIComponent(
                serverSource.result.url
            )}&apikey=saikou`
        )
    ).data.url;

    return embedURL;
};

const encodeVrf = async (text: String): Promise<string> => {
    return (
        await client.get(
            `https://9anime.eltik.net/vrf?query=${text}&apikey=saikou`
        )
    ).data?.url;
};

const decodeVrf = async (text: String): Promise<string> => {
    return (
        await client.get(
            `https://9anime.eltik.net/decrypt?query=${text}&apikey=saikou`
        )
    ).data?.url;
};
export default NineAnime;
