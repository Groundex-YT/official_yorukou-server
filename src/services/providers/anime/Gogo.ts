import axios from 'axios';
import cheerio from 'cheerio';
import { Episode, MediaSearchCard, VideoServer } from '../../others/classes';
import {
    EpisodePatternProp,
    IAnimeEpisode,
    IAnimeInfo,
    IAnimeResult,
    IEpisodeServer,
    ISearch,
    ISource,
    MediaFormat,
    MediaSearchCardProps,
    MediaStatus,
    StreamingServers,
    VideoServerPProps
} from '../../others/types';
import { decode, encode } from 'ascii-url-encoder';
import { getKitsuEpsodes, getSIMKL_EPISODES } from '.';

import FPlayer from '../extra/FPlayer';
import GogoCDN from '../extra/GogoCND';
import StreanSB from '../extra/StreamSB';
import AnimeParser from '../../models/AnimeParser';
import {
    MakeFetch,
    USER_AGENT,
    mergeEpisodes,
    mergeEpisodesV2
} from '../../../utils';

class Gogoanime extends AnimeParser {
    override readonly name = 'Gogoanime';
    protected override baseURL = 'https://gogoanimehd.io';
    override readonly type: 'anime';
    override readonly supportsMalsync = true;
    override readonly hasNameWseason = false;
    override readonly disableAutoDownload = false;
    override readonly disabled = false;
    override readonly shortenedName = 'Gogo';
    private readonly ajaxUrl = 'https://ajax.gogo-load.com/ajax';

    /**
     *
     * @param query search query string
     * @param page page number (default 1) (optional)
     */

    override async search(query: string, page: number = 1) {
        const Result: ISearch<IAnimeResult> = {
            currentPage: page,
            hasNextPage: false,
            results: []
        };

        try {
            const res = await MakeFetch(
                `${this.baseURL}/search.html?keyword=${query}`
            );
            const body = res;
            const $ = cheerio.load(body);

            Result.hasNextPage =
                $(
                    'div.anime_name.new_series > div > div > ul > li.selected'
                ).next().length > 0;

            $(`.last_episodes > ul > li`).each((e, elem) => {
                const $el = $(elem);
                const id = $el.find('p.name > a').attr('href')?.split('/')[2]!;
                const title = $el.find('p.name > a').attr('title');
                const cover = $el.find('img').attr('src');
                const url = `${this.baseURL}${$el
                    .find('p.name > a')
                    .attr('href')}`;
                const releaseDate = $el.find('p.released').text().trim();
                const isDub = $el
                    .find('p.name > a')
                    .text()
                    .toLowerCase()
                    .includes('dub');

                Result.results.push({
                    id,
                    title,
                    url,
                    cover,
                    releaseDate,
                    isDub
                });
            });

            return Result;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    /**
     *
     * @param id anime id
     */

    override async fetchAnimeInfo(
        animeId: string,
        dub: boolean = false,
        aniID?: string,
        exhaust: boolean = true,
        oneway = true
    ): Promise<IAnimeInfo> {
        let id = animeId;
        if (!id.includes('gogoanime'))
            id = `${this.baseURL}/category/${animeId}`;

        const animeInfo: IAnimeInfo = {
            id: '',
            title: '',
            url: '',
            genres: [],
            totalEpisodes: 0
        };

        try {
            const res = await MakeFetch(id);
            const $ = cheerio.load(res);

            animeInfo.id = new URL(id).pathname.split('/')[2];
            animeInfo.title = $(
                'section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1'
            )
                .text()
                .trim();
            animeInfo.url = id;
            animeInfo.image = $('div.anime_info_body_bg > img').attr('src');
            animeInfo.releaseDate = $('div.anime_info_body_bg > p:nth-child(7)')
                .text()
                .trim()
                .split('Released: ')[1];
            animeInfo.description = $('div.anime_info_body_bg > p:nth-child(5)')
                .text()
                .trim()
                .replace('Plot Summary: ', '');

            animeInfo.isDub = animeInfo.title.toLowerCase().includes('dub');

            animeInfo.type = $('div.anime_info_body_bg > p:nth-child(4) > a')
                .text()
                .trim()
                .toUpperCase() as MediaFormat;

            animeInfo.status = MediaStatus.UNKNOWN;

            switch (
                $('div.anime_info_body_bg > p:nth-child(8) > a').text().trim()
            ) {
                case 'Ongoing':
                    animeInfo.status = MediaStatus.ONGOING;
                    break;
                case 'Completed':
                    animeInfo.status = MediaStatus.COMPLETED;
                    break;
                case 'Upcoming':
                    animeInfo.status = MediaStatus.NOT_YET_AIRED;
                    break;
                default:
                    animeInfo.status = MediaStatus.UNKNOWN;
                    break;
            }
            animeInfo.otherName = $('div.anime_info_body_bg > p:nth-child(9)')
                .text()
                .replace('Other name: ', '')
                .replace(/;/g, ',');

            console.log(
                $('div.anime_info_body_bg > p:nth-child(9)')
                    .text()
                    .replace('Other name: ', '')
                    .replace(/;/g, ',')
            );

            $('div.anime_info_body_bg > p:nth-child(6) > a').each((i, el) => {
                animeInfo.genres?.push($(el).attr('title')!.toString());
            });

            const ep_start = $('#episode_page > li')
                .first()
                .find('a')
                .attr('ep_start');
            const ep_end = $('#episode_page > li')
                .last()
                .find('a')
                .attr('ep_end');
            const movie_id = $('#movie_id').attr('value');
            const alias = $('#alias_anime').attr('value');

            const html = await MakeFetch(
                `${
                    this.ajaxUrl
                }/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
            );
            const $$ = cheerio.load(html);

            animeInfo.episodes = [];

            $$('#episode_related > li').each((i, el) => {
                animeInfo.episodes?.push({
                    id: $(el).find('a').attr('href')?.split('/')[1]!,
                    number: parseFloat(
                        $(el).find(`div.name`).text().replace('EP ', '')
                    ),
                    url: `${this.baseURL}${$(el)
                        .find(`a`)
                        .attr('href')
                        ?.trim()}`
                });
            });

            animeInfo.episodes = animeInfo.episodes.reverse();

            animeInfo.totalEpisodes = parseInt(ep_end ?? '0');

            let dubbedEpisodes: EpisodePatternProp[] = [];
            let subbedEpisodes: EpisodePatternProp[] = [];

            if (oneway) {
                const res = await this.getDubbedEpisodes(
                    animeInfo.title,
                    animeInfo
                );

                res.map((episode) => {
                    dubbedEpisodes.push(
                        new Episode({
                            number: episode.number,
                            link: episode.id,
                            extra: episode.url,
                            allStreams: episode.hasDub,
                            filler: episode.isFiller
                        })
                    );
                });

                animeInfo.episodes.map((episode) => {
                    subbedEpisodes.push(
                        new Episode({
                            number: episode.number,
                            link: episode.id,
                            extra: episode.url
                        })
                    );
                });
            }

            if (exhaust) {
                let anilistID: number;

                if (!isNaN(parseInt(aniID))) {
                    anilistID = parseInt(aniID);
                }

                if (!anilistID) {
                    try {
                        anilistID = JSON.parse(
                            await MakeFetch(
                                `https://raw.githubusercontent.com/bal-mackup/mal-backup/master/page/Gogoanime/${animeId}.json`
                            )
                        ).aniId;
                    } catch (err) {
                        try {
                            anilistID = JSON.parse(
                                await MakeFetch(
                                    `https://api.malsync.moe/page/Gogoanime/${animeId}`
                                )
                            ).aniId;
                        } catch (err) {
                            // anilistID will be undefined
                        }
                    }
                }

                if (anilistID) {
                    const promises = [
                        getKitsuEpsodes(anilistID),
                        getSIMKL_EPISODES(anilistID)
                    ];

                    const promiseResponses = await Promise.allSettled(promises);

                    const subDub = mergeEpisodes(
                        subbedEpisodes,
                        dubbedEpisodes
                    );

                    animeInfo.episodes = subDub;

                    if (promiseResponses[0].status === 'fulfilled') {
                        const EpsToKitsu = mergeEpisodesV2(
                            subDub,
                            promiseResponses[0].value
                        );
                        animeInfo.episodes = EpsToKitsu;

                        if (promiseResponses[1].status === 'fulfilled') {
                            const EpsToSimkl = mergeEpisodesV2(
                                EpsToKitsu,
                                promiseResponses[1].value
                            );
                            animeInfo.episodes = EpsToSimkl;
                        }
                    }
                } else {
                    const subDub = mergeEpisodes(
                        subbedEpisodes,
                        dubbedEpisodes
                    );

                    animeInfo.episodes = subDub;
                }
            }
            return animeInfo;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    async getDubbedEpisodes(subTitle: string, animeInfo: IAnimeInfo) {
        let episodes: IAnimeEpisode[] = [];

        try {
            const res = await this.search(subTitle);

            const filteredRes = async () => {
                const resV1 = res.results.filter((anime) =>
                    anime.title.includes('(Dub)')
                );

                return resV1.filter(async (anime) => {
                    const dubInfo = await this.DubPrecision(anime.id);
                    const found = dubInfo.otherName
                        .split(',')
                        .some((r) =>
                            animeInfo.otherName.split(',').includes(r)
                        );

                    return found;
                });
            };

            let promises = await filteredRes();

            if (promises.length === 0) return episodes;

            const html = await MakeFetch(
                `${this.baseURL}/category/${promises[0].id}`
            );

            const $ = cheerio.load(html);

            const ep_start = $('#episode_page > li')
                .first()
                .find('a')
                .attr('ep_start');
            const ep_end = $('#episode_page > li')
                .last()
                .find('a')
                .attr('ep_end');
            const movie_id = $('#movie_id').attr('value');
            const alias = $('#alias_anime').attr('value');

            const html1 = await MakeFetch(
                `${
                    this.ajaxUrl
                }/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
            );
            const $$ = cheerio.load(html1);

            $$('#episode_related > li').each((i, el) => {
                episodes?.push({
                    id: $(el).find('a').attr('href')?.split('/')[1]!,
                    number: parseFloat(
                        $(el).find(`div.name`).text().replace('EP ', '')
                    ),
                    url: `${this.baseURL}${$(el)
                        .find(`a`)
                        .attr('href')
                        ?.trim()}`,
                    hasDub: true,
                    isFiller: null
                });
            });

            episodes = episodes.reverse();

            return episodes;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    async DubPrecision(animeId: string) {
        if (!animeId.includes('gogoanime'))
            animeId = `${this.baseURL}/category/${animeId}`;

        const animeInfo: IAnimeInfo = {
            id: '',
            title: '',
            url: '',
            genres: [],
            totalEpisodes: 0
        };

        try {
            const res = await MakeFetch(animeId);
            const $ = cheerio.load(res);

            animeInfo.otherName = $('div.anime_info_body_bg > p:nth-child(9)')
                .text()
                .replace('Other name: ', '')
                .replace(/;/g, ',');

            return animeInfo;
        } catch (err) {
            throw new Error((err as Error).message);
        }
    }

    override async fetchEpisodeServers(
        episodeId: string
    ): Promise<IEpisodeServer[]> {
        if (!episodeId.startsWith(this.baseURL))
            episodeId = `${this.baseURL}/${episodeId}`;

        try {
            const res = await MakeFetch(episodeId);

            const $ = cheerio.load(res);

            const serverList: IEpisodeServer[] = [];

            $('div.anime_muti_link > ul > li').each((i, element) => {
                const name = $(element)
                    .find('a')
                    .text()
                    .replace('Choose this server', '')
                    .trim();
                let url = $(element).find('a').attr('data-video');
                if (url?.startsWith('//')) {
                    url = `https:${url}`;
                }

                serverList.push({
                    name: name,
                    url: url
                });
            });

            return serverList;
        } catch (err) {
            throw new Error('Episode not found.');
        }
    }

    override async fetchEpisodeSources(
        episodeId: string,
        server: StreamingServers = StreamingServers.VidStreaming
    ): Promise<ISource> {
        if (episodeId.startsWith('http')) {
            const serverUrl = new URL(episodeId);
            switch (server) {
                case StreamingServers.GogoCDN:
                    return {
                        headers: { Referer: serverUrl.href },
                        sources: await GogoCDN(serverUrl),
                        download: `https://gogohd.net/download${serverUrl.search}`
                    };
                case StreamingServers.StreamSB:
                    return {
                        headers: {
                            Referer: serverUrl.href,
                            watchsb: 'streamsb',
                            'User-Agent': USER_AGENT
                        },
                        sources: await StreanSB(serverUrl),
                        download: `https://gogohd.net/download${serverUrl.search}`
                    };
                default:
                    return {
                        headers: { Referer: serverUrl.href },
                        sources: await GogoCDN(serverUrl),
                        download: `https://gogohd.net/download${serverUrl.search}`
                    };
            }
        }
    }
}

export default Gogoanime;
