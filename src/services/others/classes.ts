import {
    EpisodePatternProp,
    MediaSearchCardProps,
    VideoServerPProps
} from './types';
import { Temp } from '../providers/anime/Kamyroll';

type EpisodeProops = {
    number: number;
    link?: string | null;
    title?: string | null;
    desc?: string | null;
    thumb?: string | null;
    filler?: boolean;
    selectedExtractor?: string | null;
    selectedVideo?: number;
    selectedSubtitle?: number;
    allStreams?: boolean;
    watched?: number | null;
    maxLength?: number | null;
    extra?: any | null;
    airdate?: string;
};

type VideoServerProps = {
    name: string;
    embed: EmbedProps;
};

interface EmbedProps {
    url: string;
    referer: string;
}

export class Episode implements EpisodePatternProp {
    number: number;
    link: string | null;
    title: string | null;
    desc: string | null;
    thumb: string | null;
    filler: boolean;
    selectedExtractor: string | null;
    selectedVideo: number;
    selectedSubtitle: number;
    allStreams: boolean;
    watched: number | null;
    maxLength: number | null;
    extra?: any | null;
    airdate?: string;

    constructor({
        number,
        link = null,
        title = null,
        desc = null,
        thumb = null,
        filler = false,
        selectedExtractor = null,
        selectedVideo = 0,
        selectedSubtitle = -1,
        allStreams = false,
        watched = null,
        maxLength = null,
        extra = null,
        airdate = null
    }: EpisodeProops) {
        this.number = number;
        this.link = link;
        this.title = title;
        this.desc = desc;
        this.thumb = thumb;
        this.filler = filler;
        this.selectedExtractor = selectedExtractor;
        this.selectedVideo = selectedVideo;
        this.selectedSubtitle = selectedSubtitle;
        this.allStreams = allStreams;
        this.watched = watched;
        this.maxLength = maxLength;
        this.extra = extra;
        this.airdate = airdate;
    }
}

export class VideoServer implements VideoServerPProps {
    name: string;
    embed: EmbedProps;

    constructor({ name, embed }: VideoServerProps) {
        this.name = name;
        this.embed = embed;
    }
}

export class MediaSearchCard implements MediaSearchCardProps {
    name: string;
    coverImage: string;
    link: string;

    constructor({ name, coverImage, link }: MediaSearchCardProps) {
        this.name = name;
        this.coverImage = coverImage;
        this.link = link;
    }
}

export class TempEpisode implements Temp {
    type: string;
    thumb: string;
    title: string;
    description: string;
    series: any;

    constructor({ type, thumb, title, description, series }: Temp) {
        this.type = type;
        this.thumb = thumb;
        this.title = title;
        this.description = description;
        this.series = series;
    }
}

export class FileUrl implements FileUrlFace {
    url: string;
    headers: any;

    constructor({ url, headers }: FileUrlFace) {
        this.url = url;
        this.headers = headers;
    }
}

interface FileUrlFace {
    url: string;
    headers: any | null;
}

export class Video implements VideoFace {
    quality: number | null;
    format: VideoType;
    url: FileUrlFace;
    size: number | null;
    extraNote?: any | null;

    constructor({
        quality = null,
        format,
        url,
        size = null,
        extraNote = null
    }: VideoFace) {
        this.quality = quality;
        this.format = format;
        this.url = url;
        this.size = size;
        this.extraNote = extraNote;
    }
}

export class Subtitle implements SubtitleFace {
    language: string;
    lang: string;
    file: FileUrlFace;
    type: SubtitleType;

    constructor({ language, file, lang, type }: SubtitleFace) {
        this.language = language;
        this.lang = lang;
        this.file = file;
        this.type;
    }
}

export class VideoContainer implements VideoContainerFace {
    videos: VideoFace[];
    subtitles: SubtitleFace[] | [];

    constructor({ videos, subtitles = [] }: VideoContainerFace) {
        this.videos = videos;
        this.subtitles = subtitles;
    }
}

export interface VideoContainerFace {
    videos: VideoFace[];
    subtitles: SubtitleFace[] | [];
}

export interface VideoFace {
    quality: number | null;
    format: VideoType;
    url: FileUrlFace;
    size: number | null;
    extraNote?: any | null;
}

export interface SubtitleFace {
    language: string;
    lang: string;
    file: FileUrlFace;
    type: SubtitleType;
}

export enum VideoType {
    CONTAINER,
    M3U8,
    DASH
}

export enum SubtitleType {
    VTT,
    ASS,
    SRT
}
