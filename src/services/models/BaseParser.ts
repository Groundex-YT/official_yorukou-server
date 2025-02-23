import { AxiosAdapter } from 'axios';

import BaseProvider from './BaseProvider';

abstract class BaseParser extends BaseProvider {
    /**
     * Search for books/anime/manga/etc using the given query
     *
     * returns a promise resolving to a data object
     */
    abstract search(query: string, ...args: any[]): Promise<unknown>;
}

export default BaseParser;
