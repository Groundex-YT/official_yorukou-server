export type Maybe<T> = T | null;

export enum FanartMediaType {
    TV = 'TV Show',
    MOVIE = 'Movie'
}

export interface FanartSearchResults {
    id: Maybe<string>;
    image_count: Maybe<string>;
    link: Maybe<string>;
    poster: Maybe<string>;
    title: Maybe<string>;
    type: Maybe<FanartMediaType>;
}

export interface FanartFields {
    id: Maybe<string>;
    url: Maybe<string>;
    lang: Maybe<string>;
    likes: Maybe<string>;
    season?: Maybe<string>;
}

export interface FanartTVMedia {
    name: Maybe<string>;
    thetvdb_id: Maybe<string>;
    hdtvlogo: Maybe<FanartFields[]>;
    showbackground: Maybe<FanartFields[]>;
    tvposter: Maybe<FanartFields[]>;
    hdclearart: Maybe<FanartFields[]>;
    characterart: Maybe<FanartFields[]>;
    clearlogo: Maybe<FanartFields[]>;
    clearart: Maybe<FanartFields[]>;
    tvthumb: Maybe<FanartFields[]>;
    seasonthumb: Maybe<FanartFields[]>;
}

export interface FanartMovieMedia {
    name: Maybe<string>;
    tmdb_id: Maybe<string>;
    imdb_id: Maybe<string>;
    hdmovielogo: Maybe<FanartFields[]>;
    hdmovieclearart: Maybe<FanartFields[]>;
    movieposter: Maybe<FanartFields[]>;
    moviethumb: Maybe<FanartFields[]>;
    moviebanner: Maybe<FanartFields[]>;
    moviedisc: Maybe<FanartFields[]>;
    moviebackground: Maybe<FanartFields[]>;
}
