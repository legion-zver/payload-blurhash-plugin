import {Config} from 'payload/config';

import {BlurhashPluginOptions} from '../options';
import {DEFAULT_FIELD_NAME} from '../constants';
import {rebuildCollections} from '../utils';

function computeBlurhash({collections, field = DEFAULT_FIELD_NAME}: BlurhashPluginOptions = {}) {
    return (config: Config): Config => {
        return {
            ...config,
            collections: rebuildCollections(config.collections ?? [], collections, field),
        };
    };
}

export default computeBlurhash;
