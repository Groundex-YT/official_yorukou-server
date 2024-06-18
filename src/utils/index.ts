import axios, { AxiosRequestConfig } from 'axios';
import fetch from 'cross-fetch';
import { EpisodePatternProp, IAnimeEpisode } from '../services/others/types';

export const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
export const range = ({
    from = 0,
    to = 0,
    step = 1,
    length = Math.ceil((to - from) / step)
}) => Array.from({ length }, (_, i) => from + i * step);

const proxyHosts = ['http://localhost:3000/proxy'];

const proxyHost = () => {
    return proxyHosts[0];
};

export const proxiedGet = async (url, config: any = {}) => {
    return await axios.get(proxyHost() + '/' + url, {
        ...config,
        headers: {
            ...config.headers,
            'user-agent': USER_AGENT
        }
    });
};

export const substringAfter = (str: string, toFind: string) => {
    const index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(index + toFind.length);
};

export const substringBefore = (str: string, toFind: string) => {
    const index = str.indexOf(toFind);
    return index == -1 ? '' : str.substring(0, index);
};

// @ts-ignore
export const MakeFetch = (url: string, options = {}): Promise<string> => {
    return new Promise(function (resolve, reject) {
        fetch(url, options)
            .then((response) => response.text())
            .then((response: string) => {
                resolve(response);
            })
            .catch(function (err) {
                reject(new Error(`${err.message}: ${url}`));
            });
    });
};

async function MakeFetchTimeout(
    url,
    options = {},
    timeout = 5000
): Promise<string> {
    const controller = new AbortController();
    const signal = controller.signal;
    options['signal'] = signal;
    return new Promise(function (resolve, reject) {
        fetch(url, options)
            .then((response) => response.text())
            .then((response) => {
                resolve(response);
            })
            .catch(function (err) {
                reject(new Error(`${err.message}: ${url}`));
            });

        setTimeout(function () {
            controller.abort();
            reject(new Error('timeout'));
        }, timeout);
    });
}

export const mergeEpisodes = <T>(
    list: EpisodePatternProp[],
    list2: EpisodePatternProp[]
) => {
    const Episodes = new Map<number, IAnimeEpisode>();

    list?.map((episode, index) => {
        let kitsuFiller = list2[index];

        let d = null;
        if (kitsuFiller?.airdate) d = new Date(kitsuFiller?.airdate);

        Episodes.set(episode?.number!, {
            id: episode?.link!,
            number: episode?.number!,
            hasDub:
                (episode?.allStreams && episode?.allStreams) ||
                (kitsuFiller?.allStreams && kitsuFiller?.allStreams) ||
                false,
            dubId: (kitsuFiller?.link && kitsuFiller?.link) || null,
            isFiller:
                (episode?.filler && episode?.filler) ||
                (kitsuFiller?.filler && kitsuFiller?.filler) ||
                false,
            title:
                (episode?.title && episode?.title) ||
                (kitsuFiller?.title && kitsuFiller?.title) ||
                null,
            description:
                (episode?.desc && episode?.desc) ||
                (kitsuFiller?.desc && kitsuFiller?.desc) ||
                null,
            image:
                (episode?.thumb && episode?.thumb) ||
                (kitsuFiller?.thumb && kitsuFiller?.thumb) ||
                null,
            url:
                (episode?.extra && episode?.extra) ||
                (kitsuFiller?.extra && kitsuFiller?.extra) ||
                null,
            releaseDate:
                (episode?.airdate && episode?.airdate) ||
                (kitsuFiller?.airdate && kitsuFiller?.airdate) ||
                null
        });
    });

    return Array.from(Episodes, ([name, value]) => value);
};

export const mergeEpisodesV2 = <T>(
    list: IAnimeEpisode[],
    list2: EpisodePatternProp[]
) => {
    const Episodes = new Map<number, IAnimeEpisode>();

    list?.map((episode, index) => {
        let kitsuFiller = list2[index];

        let d = null;
        if (kitsuFiller?.airdate) d = new Date(kitsuFiller?.airdate);

        Episodes.set(episode?.number!, {
            ...episode,
            title:
                (episode?.title && episode?.title) ||
                (kitsuFiller?.title && kitsuFiller?.title) ||
                null,
            description:
                (episode?.description && episode?.description) ||
                (kitsuFiller?.desc && kitsuFiller?.desc) ||
                null,
            isFiller:
                (episode?.isFillerler && episode?.isFiller) ||
                (kitsuFiller?.filler && kitsuFiller?.filler) ||
                false,
            image:
                (episode?.image && episode?.image) ||
                (kitsuFiller?.thumb && kitsuFiller?.thumb) ||
                null,
            releaseDate:
                (episode?.releaseDate && episode?.releaseDate) ||
                (kitsuFiller?.airdate && d) ||
                null
        });
    });

    return Array.from(Episodes, ([name, value]) => value);
};
