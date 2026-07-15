import type {ConvertSvgToPng} from './types';

/**
 * On web the avatar crop pipeline (canvas-based) handles SVG files directly, so no conversion is
 * needed. This is a no-op passthrough kept for platform parity with the native implementation.
 */
const convertSvgToPng: ConvertSvgToPng = (file) => Promise.resolve(file);

export default convertSvgToPng;
