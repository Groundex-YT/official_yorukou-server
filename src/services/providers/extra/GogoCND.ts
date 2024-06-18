import axios from 'axios';
import cheerio from 'cheerio';
import { IVideo, VideoServerPProps } from '../../others/types';
import * as CryptoJS from 'crypto-js';
import { MakeFetch, proxiedGet, USER_AGENT } from '../../../utils/index';

const Keys = {
    key: CryptoJS.enc.Utf8.parse('37911490979715163134003223491201'),
    secondKey: CryptoJS.enc.Utf8.parse('54674138327930866480207815084989'),
    iv: CryptoJS.enc.Utf8.parse('3134003223491201')
};

export const GogoCDN = async (server: URL) => {
    const videoList: IVideo[] = [];

    const url = server.href;
    const newUrl = new URL(url);

    const res = await axios.get(newUrl.href, {
        headers: {
            referer: newUrl.href,
            'User-Agent': USER_AGENT
        }
    });
    let body = res.data;

    const $ = cheerio.load(body);

    const it = $('script[data-name="episode"]').data().value as string;
    const id = newUrl.searchParams.get('id') ?? '';

    const encyptedParams = await generateEncryptedAjaxParams(it, id);

    const encryptedData = await axios.get(
        `${newUrl.protocol}//${newUrl.hostname}/encrypt-ajax.php?${encyptedParams}`,
        {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }
    );

    const decryptedData = await decryptAjaxData(encryptedData.data.data);
    if (!decryptedData.source)
        throw new Error('No source found. Try a different server.');

    if (decryptedData.source[0].file.includes('.m3u8')) {
        const resResult = await MakeFetch(
            decryptedData.source[0].file.toString()
        );
        const resolutions = resResult.match(/(RESOLUTION=)(.*)(\s*?)(\s*.*)/g);
        resolutions?.forEach((res: string) => {
            const index = decryptedData.source[0].file.lastIndexOf('/');
            const quality = res.split('\n')[0].split('x')[1].split(',')[0];
            const url = decryptedData.source[0].file.slice(0, index);
            videoList.push({
                url: url + '/' + res.split('\n')[1],
                isM3U8: (url + res.split('\n')[1]).includes('.m3u8'),
                quality: quality + 'p'
            });
        });

        decryptedData.source.forEach((source: any) => {
            videoList.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
                quality: 'default'
            });
        });
    } else {
        decryptedData.source.forEach((source: any) => {
            videoList.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
                quality: source.label.split(' ')[0] + 'p'
            });
        });

        decryptedData.source_bk.forEach((source: any) => {
            videoList.push({
                url: source.file,
                isM3U8: source.file.includes('.m3u8'),
                quality: 'backup'
            });
        });
    }

    return videoList;
};

const generateEncryptedAjaxParams = async (
    text,
    id: string
): Promise<string> => {
    const encryptedKey = CryptoJS.AES.encrypt(id, Keys.key, {
        iv: Keys.iv
    });

    const decryptedToken = CryptoJS.AES.decrypt(text, Keys.key, {
        iv: Keys.iv
    }).toString(CryptoJS.enc.Utf8);

    return `id=${encryptedKey}&alias=${id}&${decryptedToken}`;
};

const decryptAjaxData = async (encryptedData: string): Promise<any> => {
    const decryptedData = CryptoJS.enc.Utf8.stringify(
        CryptoJS.AES.decrypt(encryptedData, Keys.secondKey, {
            iv: Keys.iv
        })
    );

    return JSON.parse(decryptedData);
};

interface SourceResponse {
    source: Source[];
    source_bk: Source[];
}

interface Source {
    file: string;
    label: string;
    type: string;
}

export default GogoCDN;
