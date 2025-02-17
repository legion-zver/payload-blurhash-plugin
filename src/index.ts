import path from 'path';
import sharp from 'sharp';
import {encode} from 'blurhash';
import {Config} from 'payload/config';
import {CollectionBeforeChangeHook} from 'payload/types';

import {BlurhashPluginOptions} from './options';
import {DEFAULT_FIELD_NAME} from './constants';
import {rebuildCollections} from './utils';

function canComputeBlurhash(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}

function computeBlurhash({
    collections,
    field = DEFAULT_FIELD_NAME,
    width = 32,
    height = 32,
    componentX = 3,
    componentY = 3,
}: BlurhashPluginOptions = {}) {
    return (config: Config): Config => {
        const beforeChangeHook: CollectionBeforeChangeHook = async ({data, req}) => {
            try {
                const uploaded = req?.files?.file;
                if (uploaded && canComputeBlurhash(uploaded.mimetype)) {
                    const pixels = await sharp(uploaded.data ? uploaded.data : uploaded.tempFilePath)
                        .resize(width, height)
                        .ensureAlpha(1)
                        .raw()
                        .toBuffer();
                    if (pixels.length > 0) {
                        return {
                            ...data,
                            blurhash: encode(new Uint8ClampedArray(pixels), width, height, componentX, componentY),
                        };
                    }
                }
            } catch (e) {
                req.payload.logger.warn(e, 'Fail compute blurhash');
            }
            return data;
        };
        return {
            ...config,
            collections: rebuildCollections(config.collections ?? [], collections, field, beforeChangeHook),
            admin: {
                ...config.admin,
                webpack: (webpackConfig) => {
                    const modifiedConfig = {
                        ...webpackConfig,
                        resolve: {
                            ...webpackConfig.resolve,
                            alias: {
                                ...webpackConfig.resolve?.alias,
                                '@itrabbit/payload-blurhash-plugin/options': path.resolve(__dirname, './options'),
                                '@itrabbit/payload-blurhash-plugin': path.resolve(__dirname, './mock'),
                            },
                        },
                    };
                    return config.admin?.webpack?.(modifiedConfig) ?? modifiedConfig;
                },
            },
        };
    };
}

export default computeBlurhash;
