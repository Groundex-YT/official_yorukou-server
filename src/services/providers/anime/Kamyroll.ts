import axios from 'axios';
import cheerio from 'cheerio';
import {
    Episode,
    FileUrl,
    MediaSearchCard,
    Subtitle,
    SubtitleFace,
    SubtitleType,
    TempEpisode,
    Video,
    VideoContainer,
    VideoFace,
    VideoServer,
    VideoType
} from '../../others/classes';
import {
    EpisodePatternProp,
    SearchFilter,
    VideoServerPProps
} from '../../others/types';

const KamyRoll = {
    saveName: 'kamy_roll',
    name: 'Kamyroll',
    dub: false,
    url: 'https://api.kamyroll.tech'
};

const channel = 'crunchyroll';

const subLocal = (e) => {
    let select: string;

    switch (e) {
        case e === 0 || e === 2:
            select = 'en-US';
            break;
        case e === 1:
            select = 'ja-JP';
            break;
        case e === 3:
            select = 'de-DE';
            break;
        case e === 4:
            select = 'es-419';
            break;
        case e === 5:
            select = 'es-ES';
            break;
        case e === 6:
            select = 'fr-FR';
            break;
        case e === 7:
            select = 'it-IT';
            break;
        case e === 8:
            select = 'ar-SA';
            break;
        case e === 9:
            select = 'ar-ME';
            break;
        case e === 10:
            select = 'pt-BR';
            break;
        case e === 11:
            select = 'pt-PT';
            break;
        case e === 12:
            select = 'ru-RU';
            break;
        case e === 13:
            select = 'zh-CN';
            break;
        case e === 14:
            select = 'tr-TR';
            break;
        case e === 15:
            select = 'ar-SA';
            break;
        case e === 16:
            select = 'uk-UK';
            break;
        case e === 17:
            select = 'he-IL';
            break;
        case e === 18:
            select = 'pl-PL';
            break;
        case e === 19:
            select = 'ro-RO';
            break;
        case e === 20:
            select = 'sv-SE';
            break;
        default:
            select = 'en-US';
    }

    return select;
};

const locale = (subtitle, defaultLocal) => {
    let select;
    switch (subtitle) {
        case subtitle === true:
            select = subLocal(defaultLocal);
            break;
        case subtitle === false:
            select = '';
            break;
    }

    return select;
};

export const loadEpisodes = async (
    animeLink: string,
    filter: SearchFilter,
    sub: boolean = true,
    defLocal: any = 31
) => {
    const token = await getToken();
    const localle = locale(sub, defLocal);

    if (filter.type === 'series') {
        const eps = await axios.get<EpisodeResponse>(
            `${KamyRoll.url}/content/v1/seasons`,
            {
                params: {
                    id: animeLink,
                    channel_id: channel,
                    locale: localle
                },
                headers: {
                    Authorization: token.authorization
                }
            }
        );

        const dataList: [number, Temp][] = [];
        const epMap = new Map<number, Temp>();

        eps.data.items.map((item, i) => {
            let tit = item.title;
            item.episodes.map((episode, i) => {
                dataList.push([
                    episode.sequence_number,
                    new TempEpisode({
                        type: episode.type,
                        thumb: episode.images?.thumbnail[6]?.source,
                        title: episode?.title,
                        description: episode?.description,
                        series: new Map().set(tit, episode.id)
                    })
                ]);
            });
        });

        dataList.forEach((it) => {
            let key = it[0];
            epMap.set(key, epMap.get(key) ? epMap.get(key) : it[1]);

            for (let [keys, value] of it[1]?.series) {
                epMap.get(key).series.set(keys, value);
            }
        });

        const promises: Episode[] = [];

        for (let [key, value] of epMap) {
            if (value.thumb != null) {
                promises.push(
                    new Episode({
                        number: key,
                        link: value.type,
                        title: value.title,
                        thumb: value.thumb,
                        desc: epMap.size < 700 ? value.description : null,
                        extra: Array.from(value.series, function (entry) {
                            return { key: entry[0], value: entry[1] };
                        })
                    })
                );
            } else {
                promises.push(
                    new Episode({
                        number: key,
                        link: value.type,
                        title: value.title,
                        extra: Array.from(value.series, function (entry) {
                            return { key: entry[0], value: entry[1] };
                        })
                    })
                );
            }
        }

        return promises;
    } else {
        const eps = await axios.get<MovieResponse>(
            `${KamyRoll.url}/content/v1/seasons`,
            {
                params: {
                    id: animeLink,
                    channel_id: channel,
                    locale: localle
                },
                headers: {
                    Authorization: token.authorization
                }
            }
        );

        let ep = eps.data.items.sort((a, b) => {
            // @ts-ignore
            return b - a;
        });

        return [
            new Episode({
                number: 1,
                link: ep[0].id,
                thumb: ep[0].images.thumbnail[6]?.source
            })
        ];
    }
};

export const KamyrollExtractor = async (
    server: VideoServerPProps,
    subTypeT = 0
) => {
    const KamySub = (subType) => {
        let select;
        switch (subType) {
            case subType === 0:
                select = 'ass';
                break;
            case subType === 1:
                select = 'vtt';
                break;
            case subType === 2:
                select = 'srt';
                break;
            default:
                select = 'vtt';
        }

        return select;
    };

    const SubType = (e) => {
        let select;
        switch (e) {
            case e === 0:
                select = SubtitleType.ASS;
                break;
            case e === 1:
                select = SubtitleType.VTT;
                break;
            case e === 2:
                select = SubtitleType.SRT;
                break;
            default:
                select = SubtitleType.VTT;
        }

        return select;
    };

    const token = await getToken();
    const res = await axios<StreamResponses>(
        `${KamyRoll.url}/videos/v1/streams`,
        {
            params: {
                channel_id: 'crunchyroll',
                id: server.embed.url,
                type: 'adaptive_hls',
                format: KamySub(subTypeT)
            },
            headers: {
                Authorization: token.authorization
            }
        }
    );

    const video: VideoFace[] = [];
    const subtitleArr: SubtitleFace[] = [];

    res.data.streams.map((stream) => {
        if (stream.url.includes('pstream.net')) {
            console.log('here');
            return [];
        } else {
            video.push(
                new Video({
                    quality: null,
                    format: VideoType.M3U8,
                    url: new FileUrl({
                        url: stream.url,
                        headers: {
                            accept: '*/*',
                            'accept-encoding': 'utf-8'
                        }
                    }),
                    size: null
                })
            );
        }
    });

    res.data.subtitles.map((subtitle) => {
        subtitleArr.push(
            new Subtitle({
                language: subtitle.locale,
                lang: subtitle.locale,
                file: subtitle.url,
                type: SubType(subTypeT)
            })
        );
    });

    return new VideoContainer({
        videos: video,
        subtitles: subtitleArr
    });

    interface StreamResponses {
        subtitles: Subtitle[];
        streams: Stream[];
    }

    interface Stream {
        hardsub_locale: string;
        url: string;
    }

    interface Subtitle {
        locale: string;
        url: any;
        format: string;
    }
};

export const getToken = async () => {
    interface TokenArgs {
        access_token: string;
        token_type: string;
        expires_in: number;
    }

    const res = await axios.get<TokenArgs>(`${KamyRoll.url}/auth/v1/token`, {
        params: {
            device_id: 'com.service.data',
            device_type: 'ani.saikou',
            access_token: 'HMbQeThWmZq4t7w'
        }
    });

    return {
        authorization: `${res.data.token_type} ${res.data.access_token}`
    };
};

export const search = async (query: string) => {
    const token = await getToken();
    const Data = [];

    const res = await axios(`${KamyRoll.url}/content/v1/search`, {
        params: {
            channel_id: 'crunchyroll',
            limit: '25',
            query: query
        },
        headers: {
            Authorization: token.authorization
        }
    });

    const data = res.data.items[0].items;

    data.map((data, i) => {
        Data.push(
            new MediaSearchCard({
                name: data?.title,
                coverImage: data?.images?.poster_tall.slice(-1)[0].source,
                link: data?.id
            })
        );
    });

    return Data;
};

export default KamyRoll;

// types

interface MovieResponse {
    items: KamyEpisodes[];
}

interface EpisodeResponse {
    total: number;
    items: Items[];
}

interface Items {
    title: string;
    season_number: number;
    episode_count: number;
    episodes: KamyEpisodes[];
}

interface KamyEpisodes {
    id: string;
    type: string;
    season_number: number;
    episode: string;
    sequence_number: number;
    title: string;
    description: string;
    is_subbed: boolean;
    is_dubbed: boolean;
    images: Images;
    duration_ms: number;
}

interface Images {
    thumbnail: Thumbnail[];
}

interface Thumbnail {
    width: number;
    height: number;
    source: string;
}

// additional

export interface Temp {
    type: string;
    thumb: string;
    title: string;
    description: string;
    series: any;
}
