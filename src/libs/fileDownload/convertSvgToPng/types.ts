import type {FileObject} from '@src/types/utils/Attachment';

/**
 * Converts an SVG file to a PNG `FileObject`. Non-SVG files (and failed conversions) resolve to the
 * original file unchanged, mirroring the HEIC converter contract.
 */
type ConvertSvgToPng = (file: FileObject) => Promise<FileObject>;

// eslint-disable-next-line import/prefer-default-export
export type {ConvertSvgToPng};
