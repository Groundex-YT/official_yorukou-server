import axios from 'axios';
import cheerio from 'cheerio';
import { Episode, MediaSearchCard, VideoServer } from '../../others/classes';
import {
    EpisodePatternProp,
    MediaSearchCardProps,
    VideoServerPProps
} from '../../others/types';
import RapidCloud from '../extra/RapidCloud';
import StreanSB from '../extra/StreamSB';
import StreamTape from '../extra/StreamTape';

const Zoro = {
    saveName: 'zoro_to',
    name: 'Zoro',
    dub: true,
    url: 'https://aniwatch.to'
};

let headers = {
    'X-Requested-With': 'XMLHttpRequest',
    referer: Zoro.url
};

export const loadEpisodes = async (animeLink: string) => {
    const res = await axios.get(
        `${Zoro.url}/ajax/v2/episode/list/${animeLink}`,
        { headers }
    );
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

    if (domain.includes('megacloud')) return await RapidCloud(server);
    if (domain.includes('rapid')) return await RapidCloud(server);
    // if (domain.includes('sb')) return await StreanSB(server);
    if (domain.includes('streamta')) return await StreamTape(server);

    return null;
};

export const loadVideoServers = async (episodeLink: string) => {
    const res = await axios.get(
        `${Zoro.url}/ajax/v2/episode/servers?episodeId=${episodeLink}`,
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
            `${Zoro.url}/ajax/v2/episode/sources?id=${$el.attr('data-id')}`,
            { headers }
        );

        let link = resLink.data.link;

        Promises.push(
            new VideoServer({
                name: serverName,
                embed: {
                    url: link,
                    referer: Zoro.url
                }
            })
        );
    }

    return await Promise.all(Promises);
};

export const search = async (query: string) => {
    let url = encodeURI(query);
    const res = await axios.get(`${Zoro.url}/search?keyword=${url}`);
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

export default Zoro;
