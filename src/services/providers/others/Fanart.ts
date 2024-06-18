import { FanartMediaType, FanartSearchResults } from '../../../types/fanart';
import Axios, { AxiosRequestConfig } from 'axios';

interface FetchHandlerProps {
    type?: FanartMediaType;
    query?: string;
    url_v2?: boolean;
    id?: string;
}

class Fanart {
    async fetchHandler<T>({
        type = FanartMediaType.TV,
        query,
        url_v2,
        id
    }: FetchHandlerProps) {
        try {
            let url: string;

            if (url_v2) {
                if (!id) throw new Error('Invalid ID');

                url = `http://webservice.fanart.tv/v3/${
                    type === FanartMediaType.TV ? 'tv' : 'movies'
                }/${id}?api_key=${process.env.FANART_API_KEY}`;
            } else {
                url = `https://fanart.tv/api/search.php`;
            }

            const options: AxiosRequestConfig = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    referer: 'https://fanart.tv/'
                },
                url: url,
                params: {}
            };

            if (!url_v2) {
                options.params = {
                    ...options.params,
                    section: type === FanartMediaType.TV ? 'tv' : 'movies',
                    s: 'naruto'
                };
            }

            const res = await Axios<T>(options);

            return res.data;
        } catch (err) {
            console.error(err);
        }
    }

    async Search(query: string): Promise<Array<FanartSearchResults>> {
        const res = await this.fetchHandler<Array<FanartSearchResults>>({
            query
        });

        //@ts-ignore
        return res!;
    }

    async GetMedia(id: string) {}
}

export default Fanart;
