export type Maybe<T> = T | null;

export interface KitsuMedia {
    id: string;
    type: string;
}

export interface IProviderStats {
    baseURL: string;
    type: string;
    supportsMalsync: boolean;
    hasNameWseason: boolean;
    disableAutoDownload: boolean;
    disabled: boolean;
    name: string;
    shortenedName: string;
    isNSFW: boolean;
}

export interface Episodes {
    airdate: string;
    canonicalTitle: string;
    createdAt: string;
    description: string;
    length: number;
    number: number;
    thumbnail: Maybe<EpisodesThumb>;
    titles: Maybe<EpisodesTitles>;
}

export interface EpisodesData {
    attributes: Maybe<Episodes>;
    id: string;
}

export interface EpisodesThumb {
    original: string;
}

export interface EpisodesTitles {
    en_jp: string;
    en_us: string;
    ja_jp: string;
}

export interface LinksConnection {
    first: string;
    last: string;
    next: string;
}

export interface EpisodePatternProp {
    number: number;
    link?: string | null;
    title?: string | null;
    desc?: string | null;
    thumb?: string | null;
    filler?: boolean;
    selectedExtractor?: string | null;
    selectedVideo?: number;
    selectedSubtitle?: number;
    // extractors: MutableList<VideoExtractor>?=null,
    allStreams?: boolean;
    watched?: number | null;
    maxLength?: number | null;
    extra?: any | null;
    airdate?: string;
}

export interface VideoServerPProps {
    name: string;
    embed: Maybe<EmbedProps>;
}

interface EmbedProps {
    url: string;
    referer: string;
}

export interface MediaSearchCardProps {
    name: string;
    link: string;
    coverImage: string;
}

export interface SearchFilter {
    type?: Maybe<SearchExtraType>;
    filter?: string;
}

export enum SearchExtraType {
    Serie = 'series',
    Movie = 'movies'
}

export enum MediaFormat {
    TV = 'TV',
    TV_SHORT = 'TV_SHORT',
    MOVIE = 'MOVIE',
    SPECIAL = 'SPECIAL',
    OVA = 'OVA',
    ONA = 'ONA',
    MUSIC = 'MUSIC',
    MANGA = 'MANGA',
    NOVEL = 'NOVEL',
    ONE_SHOT = 'ONE_SHOT'
}

export enum MediaStatus {
    ONGOING = 'Ongoing',
    COMPLETED = 'Completed',
    HIATUS = 'Hiatus',
    CANCELLED = 'Cancelled',
    NOT_YET_AIRED = 'Not yet aired',
    UNKNOWN = 'Unknown'
}

export interface IAnimeResult {
    id: string;
    title: string;
    url?: string;
    image?: string;
    cover?: string;
    status?: MediaStatus;
    rating?: number;
    type?: MediaFormat;
    releaseDate?: string;
    [x: string]: any; // other fields
}

export interface Trailer {
    id: string;
    site?: string;
    thumbnail?: string;
}

export interface FuzzyDate {
    year?: number;
    month?: number;
    day?: number;
}

export interface IAnimeInfo extends IAnimeResult {
    malId?: number | string;
    genres?: string[];
    description?: string;
    status?: MediaStatus;
    totalEpisodes?: number;
    /**
     * @deprecated use `hasSub` or `hasDub` instead
     */
    isDub?: boolean;
    hasSub?: boolean;
    hasDub?: boolean;
    synonyms?: string[];
    /**
     * two letter representation of coutnry: e.g JP for japan
     */
    countryOfOrigin?: string;
    isAdult?: boolean;
    isLicensed?: boolean;
    /**
     * `FALL`, `WINTER`, `SPRING`, `SUMMER`
     */
    season?: string;
    studios?: string[];
    color?: string;
    cover?: string;
    trailer?: Trailer;
    episodes?: IAnimeEpisode[];
    startDate?: FuzzyDate;
    endDate?: FuzzyDate;
    recommendations?: IAnimeResult[];
    relations?: IAnimeResult[];
}

export interface ISearch<T> {
    currentPage?: number;
    hasNextPage?: boolean;
    totalPages?: number;
    /**
     * total results must include results from all pages
     */
    totalResults?: number;
    results: T[];
}

export interface IAnimeEpisodeV2 {
    [x: string]: {
        id: string;
        season_number: number;
        title: string;
        image: string;
        description: string;
        releaseDate: string;
        isHD: boolean;
        isAdult: boolean;
        isDubbed: boolean;
        isSubbed: boolean;
        duration: number;
    }[];
}

export interface IAnimeEpisode {
    id: string;
    dubId?: string;
    number: number;
    title?: string;
    description?: string;
    isFiller?: boolean;
    url?: string;
    image?: string;
    releaseDate?: string;
    hasDub?: boolean;
    [x: string]: unknown; // other fields
}

export interface ProxyConfig {
    /**
     * The proxy URL
     * @example https://proxy.com
     **/
    url: string | string[];
    /**
     * X-API-Key header value (if any)
     **/
    key?: string;
    /**
     * The proxy rotation interval in milliseconds. (default: 5000)
     */
    rotateInterval?: number;
}

export interface IEpisodeServer {
    name: string;
    url: string;
}

export interface Intro {
    start: number;
    end: number;
}

export interface ISource {
    headers?: { [k: string]: string };
    intro?: Intro;
    outro?: Intro;
    subtitles?: ISubtitle[];
    sources: IVideo[];
    download?: string;
    embedURL?: string;
}

export interface ISubtitle {
    /**
     * The id of the subtitle. **not** required
     */
    id?: string;
    /**
     * The **url** that should take you to the subtitle **directly**.
     */
    url: string;
    /**
     * The language of the subtitle
     */
    lang: string;
}

export interface IVideo {
    /**
     * The **MAIN URL** of the video provider that should take you to the video
     */
    url: string;
    /**
     * The Quality of the video should include the `p` suffix
     */
    quality?: string;
    /**
     * make sure to set this to `true` if the video is hls
     */
    isM3U8?: boolean;
    /**
     * set this to `true` if the video is dash (mpd)
     */
    isDASH?: boolean;
    /**
     * size of the video in **bytes**
     */
    size?: number;
    [x: string]: unknown; // other fields
}

export enum StreamingServers {
    AsianLoad = 'asianload',
    GogoCDN = 'gogocdn',
    StreamSB = 'streamsb',
    MixDrop = 'mixdrop',
    Mp4Upload = 'mp4upload',
    UpCloud = 'upcloud',
    VidCloud = 'vidcloud',
    StreamTape = 'streamtape',
    VizCloud = 'vizcloud',
    // same as vizcloud
    MyCloud = 'mycloud',
    Filemoon = 'filemoon',
    VidStreaming = 'vidstreaming',
    SmashyStream = 'smashystream',
    StreamHub = 'streamhub',
    StreamWish = 'streamwish',
    VidMoly = 'vidmoly'
}
