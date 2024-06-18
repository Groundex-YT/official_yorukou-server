import axios, { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { Episode, MediaSearchCard, TempEpisode } from '../../others/classes';
import { EpisodePatternProp, SearchFilter } from '../../others/types';
import { substringAfter, substringBefore } from '../../../utils';

const Yomiroll = {
    saveName: 'crunchy',
    name: 'Crunchy',
    dub: true,
    url: 'https://crunchyroll.com',
    api: 'https://beta-api.crunchyroll.com'
};

const client = axios.create({
    baseURL: Yomiroll.api,
    headers: {
        'Content-Type': 'application/json'
    }
});

client.interceptors.request.use(async (config) => config);
client.interceptors.response.use(
    (res) => {
        if (res && res.data) {
            return res.data;
        }

        return res.data;
    },
    (err) => {
        throw err;
    }
);

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
    filter: boolean = true,
    sub: boolean = true,
    defLocal: any = 31
) => {
    const token = await getAccessToken();
    const localle = locale(sub, defLocal);

    try {
        const mediaSeason = await client(
            `/content/v2/cms/series/${animeLink}/seasons`,
            {
                headers: {
                    Authorization: token.authorization
                },
                params: {
                    locale: localle
                }
            }
        );

        const promises: Episode[] = [];

        for (const serie of mediaSeason.data) {
            const serieTitle = serie.title;
            const eps = await getEpisode(serie.id);

            eps?.map((episode) => {
                promises.push(
                    new Episode({
                        number:
                            Number(episode.episode) === 0
                                ? 1
                                : Number(episode.episode),
                        link: substringBefore(
                            substringAfter(episode.streams_link, 'videos/'),
                            '/streams'
                        ),
                        title: episode.title,
                        thumb: episode.images?.thumbnail
                            .slice(-1)?.[0]
                            ?.reverse()?.[0].source,
                        desc: episode?.description ? episode.description : null,
                        extra:
                            episode.episode_number > 0 &&
                            isNumber(episode.episode)
                                ? {
                                      season: episode.season_number,
                                      serie: serieTitle,
                                      episode_count: 12
                                  }
                                : {
                                      Movie: serieTitle
                                  }
                    })
                );
            });
        }

        return promises;
    } catch (err) {
        const eps = await client(
            `/content/v2/cms/movie_listings/${animeLink}/movies`,
            {
                params: {
                    locale: localle
                },
                headers: {
                    Authorization: token.authorization
                }
            }
        );

        let ep = eps.data?.sort((a, b) => {
            // @ts-ignore
            return b - a;
        });

        return [
            new Episode({
                number: 1,
                link: ep[0].id,
                title: 'Full',
                thumb: ep[0].images.thumbnail.slice(-1)?.[0].reverse()?.[0]
                    .source
            })
        ];
    }
};

const getEpisode = async (id: string) => {
    const token = await getAccessToken();

    const res = await client(`/content/v2/cms/seasons/${id}/episodes`, {
        headers: {
            Authorization: token.authorization
        }
    });

    return res.data;
};

export const getAccessToken = async () => {
    const refreshToken = await (
        await axios.get(
            `https://raw.githubusercontent.com/Samfun75/File-host/main/aniyomi/refreshToken.txt`
        )
    ).data.trim();

    const options: AxiosRequestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:
                'Basic a3ZvcGlzdXZ6Yy0teG96Y21kMXk6R21JSTExenVPVnRnTjdlSWZrSlpibzVuLTRHTlZ0cU8='
        },
        data: qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            scope: 'offline_access'
        })
    };

    const res = await axios(`${Yomiroll.api}/auth/v1/token`, options);

    return {
        authorization: `${res.data.token_type} ${res.data.access_token}`
    };
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export const search = async (query: string) => {
    const token = await getAccessToken();
    const Data = [];

    const res = await client(`/content/v2/discover/search`, {
        headers: {
            Authorization: token.authorization
        },
        params: {
            q: query,
            n: 25,
            type: 'top_results'
        }
    });

    const data = res?.data?.[0]?.items;

    data?.map((data, i) => {
        Data.push(
            new MediaSearchCard({
                name: data?.title,
                coverImage: data?.images?.poster_tall
                    ?.slice(-1)?.[0]
                    .reverse()?.[0].source,
                link: data?.id
            })
        );
    });

    return Data;
};

export const loadVideoServers = async (episodeLink: string) => {
    const token = await getAccessToken();

    const res = await client(`/content/v2/cms/objects/${episodeLink}`, {
        headers: {
            Authorization: token.authorization
        },
        params: {
            ratings: true
            // locale: 'en-US'
        }
    });

    return res;
};

export default Yomiroll;

interface MovieResponse {
    items: KamyEpisodes[];
}

interface EpisodeResponse {
    total: number;
    data: KamyEpisodes[];
    meta: unknown;
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
    thumbnail: Thumbnail[][];
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
