import {CollectionConfig} from 'payload/types';

export interface BlurhashPluginOptions {
    /*
     * Array of collection slugs that the plugin should apply to.
     * The plugin will apply only collections with `upload` properties.
     */
    collections?: CollectionConfig['slug'][];

    /*
     * Default: blurhash
     */
    field?: string;

    /*
     * Width to resize the image to prior to computing the blurhash.
     * Default: 32
     */
    width?: number;

    /*
     * Height to resize the image to prior to computing the blurhash.
     * Default: 32
     */
    height?: number;

    /*
     * X component count to pass to the Blurhash library.
     * Default: 3
     */
    componentX?: number;

    /*
     * Y component count to pass to the Blurhash library.
     * Default: 3
     */
    componentY?: number;
}
