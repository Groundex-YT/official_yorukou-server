import axios from 'axios';
import {
    MakeFetch,
    substringAfter,
    substringBefore,
    USER_AGENT
} from '../../../utils/index';
import {
    FileUrl,
    Subtitle,
    SubtitleFace,
    SubtitleType,
    Video,
    VideoContainer,
    VideoFace,
    VideoType
} from '../../others/classes';
import { VideoServerPProps } from '../../others/types';
import * as CryptoJS from 'crypto-js';

const fallbackKey = 'c1d17096f2ca11b7';

const RapidCloud = async (server: VideoServerPProps) => {
    const video: VideoFace[] = [];
    const subtitleArr: SubtitleFace[] = [];

    try {
        const videoUrl = new URL(server.embed.url);
        const id = server.embed.url.split('/').pop().split('?')[0];
        let decryptionKey = await DecryptionKey(6);

        const options = {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Referer: server.embed.referer,
                'User-Agent': USER_AGENT
            }
        };

        const res = await axios.get(
            `https://${videoUrl.hostname}/embed-2/ajax/e-1/getSources?id=${id}`,
            options
        );

        let {
            data: { sources, tracks, intro, encrypted, sourcesBackup }
        } = res;

        try {
            if (encrypted) {
                const sourcesArray = sources.split('');
                let extractedKey = '';

                //@ts-ignore
                for (const index of JSON.parse(decryptionKey)) {
                    for (let i = index[0]; i < index[1]; i++) {
                        extractedKey += sources[i];
                        sourcesArray[i] = '';
                    }
                }

                decryptionKey = extractedKey;
                sources = sourcesArray.join('');

                const decrypt = CryptoJS.AES.decrypt(sources, decryptionKey);
                sources = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
                if (sourcesBackup) {
                    const decryptT = CryptoJS.AES.decrypt(
                        sourcesBackup,
                        decryptionKey
                    );

                    sourcesBackup = JSON.parse(
                        decryptT.toString(CryptoJS.enc.Utf8)
                    );
                }
            }
        } catch (err) {
            throw new Error(
                'Cannot decrypt sources. Perhaps the key is invalid.'
            );
        }

        sources.map((videos) => {
            video.push(
                new Video({
                    quality: 0,
                    format: VideoType.M3U8,
                    url: new FileUrl({
                        url: videos.file,
                        headers: null
                    }),
                    size: null
                })
            );
        });

        if (sourcesBackup) {
            sourcesBackup?.map((videos) => {
                video.push(
                    new Video({
                        quality: 0,
                        format: VideoType.M3U8,
                        url: new FileUrl({
                            url: videos.file,
                            headers: null
                        }),
                        size: null,
                        extraNote: 'Backup'
                    })
                );
            });
        }

        tracks.map((sub) => {
            if (
                sub.kind === 'captions' &&
                sub.label != null &&
                sub.file != null
            ) {
                subtitleArr.push(
                    new Subtitle({
                        language: sub.label,
                        lang: sub?.label,
                        file: sub.file,
                        type: null
                    })
                );
            }
        });

        return new VideoContainer({ videos: video, subtitles: subtitleArr });
    } catch (err) {
        console.log(err);
    }
};

export const DecryptionKey = async (id: number = 6) => {
    return new Promise(async function (resolve, reject) {
        try {
            let gitHTML = await MakeFetch(
                `https://github.com/enimax-anime/key/blob/e${id}/key.txt`
            );

            let key = substringBefore(
                substringAfter(
                    // @ts-ignore
                    gitHTML,
                    '"blob-code blob-code-inner js-file-line">'
                ),
                '</td>'
            );

            if (!key) {
                key = substringBefore(
                    substringAfter(
                        // @ts-ignore
                        gitHTML,
                        '"rawBlob":"'
                    ),
                    '"'
                );
            }
            if (!key) {
                // @ts-ignore
                key = await MakeFetch(
                    `https://raw.githubusercontent.com/enimax-anime/key/e${id}/key.txt`
                );
            }
            resolve(key);
        } catch (err) {
            reject(err);
        }
    });
};

export default RapidCloud;
