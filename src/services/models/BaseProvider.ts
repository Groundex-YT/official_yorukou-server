import { IProviderStats } from '../others/types';
import ProxyParser from './ProxyParser';

abstract class BaseProvider extends ProxyParser {
    /**
     * The main URL of the provider
     */

    protected abstract readonly baseURL: string;

    /**
     *  type of the provider - anime / manga
     */

    readonly type: string;

    /**
     * override as `true` if the provider **only** supports NSFW content
     */

    readonly isNSFW: boolean = false;

    readonly supportsMalsync: boolean;

    readonly hasNameWseason: boolean;

    readonly disableAutoDownload: false;

    /**
     * override as `false` if the provider is **down** or **not working**
     */

    readonly disabled: boolean;

    /**
     * Name of the provider
     */
    readonly name: string;

    /**
     * Name of the provider
     */
    readonly shortenedName: string;

    /**
     * returns provider stats
     */
    get stats(): IProviderStats {
        return {
            baseURL: this.baseURL,
            type: this.type,
            name: this.name,
            shortenedName: this.shortenedName,
            supportsMalsync: this.supportsMalsync,
            isNSFW: this.isNSFW,
            hasNameWseason: this.hasNameWseason,
            disableAutoDownload: this.disableAutoDownload,
            disabled: this.disabled
        };
    }
}

export default BaseProvider;
