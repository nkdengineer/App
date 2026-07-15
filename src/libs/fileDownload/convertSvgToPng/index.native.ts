import Log from '@libs/Log';

import type {SkImage, SkSurface} from '@shopify/react-native-skia';

import {ImageFormat, Skia} from '@shopify/react-native-skia';
import ReactNativeBlobUtil from 'react-native-blob-util';

import type {ConvertSvgToPng} from './types';

import inlineSvgStyles from './inlineSvgStyles';
import isSvgImage from './isSvgImage';
import parseSvgDimensions from './parseSvgDimensions';

/**
 * Fallback raster size used when the SVG declares neither pixel dimensions nor a usable viewBox.
 */
const DEFAULT_SVG_SIZE = 1024;

/**
 * Builds a filesystem-safe PNG file name (no spaces or special characters that could break native
 * file operations once the URI is percent-encoded downstream).
 */
function buildSafeFileName(originalName: string | undefined): string {
    const baseName = (originalName ?? 'avatar').replaceAll(/\.svg$/gi, '');
    const sanitizedBaseName = baseName.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
    const safeBaseName = sanitizedBaseName.length > 0 ? sanitizedBaseName : 'avatar';
    return `${safeBaseName}.png`;
}

/**
 * Rasterizes an SVG file to PNG using Skia (mirroring the offscreen-surface approach used by
 * `stitchOdometerImages`) so the raster-only avatar crop pipeline can process it on native.
 * Non-SVG files and failed conversions resolve to the original file unchanged.
 */
const convertSvgToPng: ConvertSvgToPng = (file) => {
    if (!isSvgImage(file.name, file.type) || !file.uri) {
        return Promise.resolve(file);
    }

    // The URI can be percent-encoded (e.g. spaces as %20), but the native filesystem
    // expects a decoded path, so decode it before reading.
    const sourcePath = decodeURI(file.uri.replace('file://', ''));

    let surface: SkSurface | null = null;
    let snapshot: SkImage | null = null;

    return ReactNativeBlobUtil.fs
        .readFile(sourcePath, 'utf8')
        .then((data) => (typeof data === 'string' ? data : ''))
        .then((rawSvgText) => {
            // Skia ignores CSS <style>/class rules, so inline them as presentation attributes first.
            const svgText = inlineSvgStyles(rawSvgText);
            const svg = Skia.SVG.MakeFromString(svgText);
            if (!svg) {
                throw new Error('Failed to parse SVG');
            }

            const parsedDimensions = parseSvgDimensions(svgText);
            const svgWidth = svg.width();
            const svgHeight = svg.height();
            const width = Math.round(svgWidth > 0 ? svgWidth : (parsedDimensions?.width ?? DEFAULT_SVG_SIZE));
            const height = Math.round(svgHeight > 0 ? svgHeight : (parsedDimensions?.height ?? DEFAULT_SVG_SIZE));

            surface = Skia.Surface.MakeOffscreen(width, height);
            if (!surface) {
                throw new Error('Failed to create Skia surface');
            }

            const canvas = surface.getCanvas();
            canvas.drawSvg(svg, width, height);
            surface.flush();

            snapshot = surface.makeImageSnapshot();
            const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

            const name = buildSafeFileName(file.name);
            const targetPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/svg-avatar-${Date.now()}.png`;

            return ReactNativeBlobUtil.fs.writeFile(targetPath, base64, 'base64').then(() => ({
                uri: `file://${targetPath}`,
                name,
                type: 'image/png',
                width,
                height,
            }));
        })
        .catch((error: unknown) => {
            Log.warn('Failed to convert SVG to PNG, using the original file', {error: error instanceof Error ? error.message : String(error)});
            return file;
        })
        .finally(() => {
            snapshot?.dispose?.();
            surface?.dispose?.();
        });
};

export default convertSvgToPng;
