import path from 'path';
import sharp from 'sharp';
import {encode} from 'blurhash';
import {Config} from 'payload/config';
import {CollectionBeforeChangeHook} from 'payload/types';

import {BlurhashPluginOptions} from './options';
import {canComputeBlurhash} from './utils';

const computeBlurhash =
    ({
        collections,
        width = 32,
        height = 32,
        componentX = 3,
        componentY = 3,
        field = 'blurhash',
    }: BlurhashPluginOptions = {}) =>
    (config: Config): Config => {
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
            collections:
                config.collections?.map((collection) => {
                    if (!collection.upload) {
                        return collection;
                    }
                    if (collections && !collections.includes(collection.slug)) {
                        return collection;
                    }
                    return {
                        ...collection,
                        fields: [
                            ...(collection.fields || []).filter((v: any) => v.name !== field),
                            {
                                name: field,
                                type: 'text',
                            },
                        ],
                        hooks: {
                            ...collection.hooks,
                            beforeChange: [...(collection.hooks?.beforeChange ?? []), beforeChangeHook],
                        },
                    };
                }) ?? [],
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

export default computeBlurhash;
