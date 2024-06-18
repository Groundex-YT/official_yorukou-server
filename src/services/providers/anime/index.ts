import axios from 'axios';
import Gogoanime from './Gogo';
import { kitsuEpisodesQuery } from '../../others/queries';
import { EpisodePatternProp, Episodes } from '../../others/types';
import { Episode } from '../../others/classes';
// import NineAnime from './9anime';
// import AnimePahe from './animepahe';
// import Zoro from './zoro';
// import AnimeFox from './animefox';
// import Anify from './anify';
// import Crunchyroll from './crunchyroll';
// import Bilibili from './bilibili';
// import Marin from './marin';
// import AnimeSaturn from './animesaturn';
const client_Id = process.env.SIMKL_CLIENT_ID;
const BASE_URL = 'https://api.simkl.com';

const fetchHandlerKistu = async (query: string) => {
    const url = `https://kitsu.io/api/graphql`;
    const Options = {
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/vnd.api+json'
        },
        data: {
            query: query
        }
    };

    const res = await axios(Options);

    return res.data;
};

const getKitsuEpsodes = async (id: number) => {
    const query = kitsuEpisodesQuery(id);
    let res = await fetchHandlerKistu(query);

    const EpisodesT: EpisodePatternProp[] = [];

    res?.data?.lookupMapping?.episodes?.nodes?.map((episode: any) => {
        EpisodesT.push(
            new Episode({
                number: episode?.number,
                title: episode?.titles?.canonical!,
                maxLength: episode?.length,
                airdate: episode?.releasedAt!,
                //@ts-ignore
                desc: episode?.description?.en!,
                thumb: episode?.thumbnail?.original.url
            })
        );
    });

    return EpisodesT;
};

const getSIMKL_EPISODES = async (anilistID: number) => {
    const idLookUp = await (
        await axios.get(`${BASE_URL}/search/id?anilist=${anilistID}`, {
            headers: {
                'simkl-api-key': client_Id,
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/json'
            }
        })
    ).data?.[0]?.ids?.simkl;

    if (!idLookUp) return null;

    const promises: EpisodePatternProp[] = [];

    const res = await axios(`${BASE_URL}/anime/episodes/${idLookUp}`, {
        method: 'GET',
        headers: {
            'simkl-api-key': client_Id,
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/json'
        },
        params: {
            extended: 'full'
        }
    });

    res.data
        ?.filter((e: any) => e.type === 'episode' && e?.aired)
        .map((episode: any) => {
            promises.push(
                new Episode({
                    number: episode?.episode!,
                    airdate: episode?.date!,
                    desc: episode?.description!,
                    thumb: episode?.img
                        ? `https://simkl.in/episodes/${episode?.img}_w.jpg`
                        : null,
                    title: episode?.title!
                })
            );
        });

    return await Promise.all(promises);
};

export {
    Gogoanime,
    getKitsuEpsodes,
    getSIMKL_EPISODES
    // NineAnime,
    // AnimePahe,
    // Zoro,
    // AnimeFox,
    // Anify,
    // Crunchyroll,
    // Bilibili,
    // Marin,
    // AnimeSaturn
};
