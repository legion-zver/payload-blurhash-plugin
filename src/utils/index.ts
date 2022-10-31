export function canComputeBlurhash(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}
