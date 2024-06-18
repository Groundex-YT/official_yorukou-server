import axios from 'axios';
import { MediaSearchCardProps, VideoServerPProps } from '../../others/types';
import { Episode, MediaSearchCard, VideoServer } from '../../others/classes';
import {
    MakeFetch,
    USER_AGENT,
    substringAfter,
    substringBefore
} from '../../../utils';
import * as CryptoJS from 'crypto-js';

const KAA = {
    saveName: 'kickassanime_am',
    name: 'KAA',
    dub: true,
    url: 'https://www1.kickassanime.mx'
};

const apiUri = `https://www1.kickassanime.mx/api`;

let headers = {
    'X-Requested-With': 'XMLHttpRequest',
    referer: KAA.url
};

export const search = async (query: string) => {
    const res = (
        await axios.post(`${apiUri}/search`, {
            query: query
        })
    ).data;

    const promises: MediaSearchCardProps[] = [];

    res?.map((data, i) => {
        const link = data?.slug;
        const cover = data?.poster?.hq
            ? `${KAA?.url}/image/poster/${data?.poster?.hq}.webp`
            : null;

        promises.push(
            new MediaSearchCard({
                link,
                name: data?.title,
                coverImage: cover
            })
        );
    });

    return await Promise.all(promises);
};

export const loadEpisodes = async (animeLink: string, dub?: true) => {
    const res = (
        await axios.get(`${apiUri}/show/${animeLink}/episodes?ep=1&lang=ja-JP`)
    ).data;

    const promises: Episode[] = [];

    const fetch = async () => {
        let episode = 1;
        let i = 1;
        while (i <= res?.pages?.length) {
            const req = (
                await axios.get(
                    `${apiUri}/show/${animeLink}/episodes?ep=${episode}&lang=ja-JP`
                )
            ).data;

            await req?.result?.map((episode) => {
                promises.push(
                    new Episode({
                        number: episode?.episode_number,
                        title: episode?.title,
                        link: `${animeLink}/episode/ep-${episode?.episode_number}-${episode?.slug}`,
                        thumb: episode?.thumbnail?.hq
                            ? `${KAA?.url}/image/thumbnail/${episode?.thumbnail?.hq}.webp`
                            : null,
                        filler: false
                    })
                );
            });

            i++;
            episode =
                Number(
                    req?.pages?.[req?.current_page - 1]?.eps[
                        req?.pages?.[req?.current_page - 1]?.eps.length - 1
                    ]
                ) + 1;
        }
    };

    await fetch();

    return await Promise.all(promises);
};

export const loadVideoServers = async (episodeLink: string) => {
    const res = (await axios.get(`${apiUri}/show/${episodeLink}`)).data;

    const Promises: VideoServerPProps[] = [];

    res?.servers?.map((server, i) => {
        Promises.push(
            new VideoServer({
                name: server?.name,
                embed: {
                    url: server?.src,
                    referer: KAA.url
                }
            })
        );
    });

    return await Promise.all(Promises);
};

export const getVideoExtractor = async (server: VideoServerPProps) => {
    if (server.name === 'VidStreaming') return await KaaExtractor(server);
    if (server.name === 'BirdStream') return await KaaExtractor(server);
    if (server.name === 'DuckStream') return await KaaExtractor(server);

    return null;
};

let options = {
    Accept: 'application/json, text/plain, */*',
    Referer: `${KAA.url}/anime`
};

const KaaExtractor = async (server: VideoServerPProps) => {
    const url = new URL(server.embed.url);
    const shortName = server.name.toLowerCase();
    let shortName2 =
        shortName === 'birdstream'
            ? 'bird'
            : shortName === 'duckstream'
            ? 'duck'
            : 'vid';
    const order = JSON.parse(
        await MakeFetch(
            `https://raw.githubusercontent.com/enimax-anime/gogo/main/KAA.json`
        )
    )[shortName2];
    const playerHTML = await MakeFetch(url.toString());
    const isBirb = shortName === 'birdstream';
    const usesMid = shortName === 'duckstream';
    const cid = playerHTML.split('cid:')[1].split("'")[1].trim();
    const metaData = CryptoJS.enc.Hex.parse(cid).toString(CryptoJS.enc.Utf8);
    const sigArray = [];

    let key = '';

    try {
        const res = await fetch(
            `https://raw.githubusercontent.com/enimax-anime/kaas/${shortName2}/key.txt`
        );
        if (res.status === 404) {
            throw new Error('Not found');
        } else {
            key = await res.text();
        }
    } catch (err) {
        key = await MakeFetch(
            `https://raw.githubusercontent.com/enimax-anime/kaas/duck/key.txt`
        );
    }

    console.log(key);

    const signatureItems = {
        SIG: playerHTML.split('signature:')[1].split("'")[1].trim(),
        USERAGENT: USER_AGENT,
        IP: metaData.split('|')[0],
        ROUTE: metaData.split('|')[1].replace('player.php', 'source.php'),
        KEY: key,
        TIMESTAMP: Math.floor(Date.now() / 1000),
        MID: url.searchParams.get(usesMid ? 'mid' : 'id')
    };

    for (const item of order) {
        sigArray.push(signatureItems[item]);
    }

    const sig = CryptoJS.SHA1(sigArray.join('')).toString(CryptoJS.enc.Hex);

    const result = JSON.parse(
        await MakeFetch(
            `${url.origin}${signatureItems.ROUTE}?${!usesMid ? 'id' : 'mid'}=${
                signatureItems.MID
            }${isBirb ? '' : '&e=' + signatureItems.TIMESTAMP}&s=${sig}`,
            {
                headers: {
                    referer: `${url.origin}${signatureItems.ROUTE.replace(
                        'source.php',
                        'player.php'
                    )}?${!usesMid ? 'id' : 'mid'}=${signatureItems.MID}`
                }
            }
        )
    ).data;

    console.log(result);
};

export default KAA;
