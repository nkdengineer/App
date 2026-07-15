/**
 * Returns whether a file is an SVG image based on its MIME type or file extension.
 */
function isSvgImage(fileName?: string, mimeType?: string): boolean {
    if (mimeType?.includes('svg')) {
        return true;
    }

    return (fileName ?? '').toLowerCase().endsWith('.svg');
}

export default isSvgImage;
