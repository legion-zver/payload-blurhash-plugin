import {CollectionConfig, CollectionBeforeChangeHook} from 'payload/types';

export function rebuildCollections(
    collections: CollectionConfig[],
    slugs?: string[] | undefined,
    field?: string | undefined,
    hook?: CollectionBeforeChangeHook<any>,
): CollectionConfig[] {
    if (!field) {
        return collections;
    }
    return collections.map((collection) => {
        if (!collection.upload || (slugs && !slugs.includes(collection.slug))) {
            return collection;
        }
        return {
            ...collection,
            fields: [
                {
                    name: field,
                    type: 'text',
                    required: false,
                    localized: false,
                    admin: {
                        readOnly: true,
                        condition: (data) => ((data || {})[field]?.length || 0) > 0,
                    },
                },
                ...(collection.fields || []).filter((v: any) => v.name !== field),
            ],
            hooks: hook
                ? {
                      ...collection.hooks,
                      beforeChange: [...(collection.hooks?.beforeChange ?? []), hook],
                  }
                : collection.hooks,
        };
    });
}
