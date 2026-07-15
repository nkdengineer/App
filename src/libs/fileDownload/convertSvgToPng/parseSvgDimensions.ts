type SvgDimensions = {width: number; height: number};

/**
 * Parses a numeric SVG length attribute value (e.g. "100", "100px").
 * Returns null for percentage-based or invalid values.
 */
function parseSvgLength(value: string | undefined): number | null {
    if (!value) {
        return null;
    }

    const trimmedValue = value.trim();
    if (trimmedValue.endsWith('%')) {
        return null;
    }

    const numericValue = Number.parseFloat(trimmedValue);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
        return null;
    }

    return numericValue;
}

/**
 * Extracts image dimensions from an SVG string by reading the root element's
 * width/height attributes or its viewBox dimensions.
 */
function parseSvgDimensions(svgContent: string): SvgDimensions | null {
    const svgTagMatch = svgContent.match(/<svg[^>]*>/i);
    if (!svgTagMatch) {
        return null;
    }

    const svgTag = svgTagMatch[0];
    const width = parseSvgLength(svgTag.match(/\bwidth=["']([^"']+)["']/i)?.at(1));
    const height = parseSvgLength(svgTag.match(/\bheight=["']([^"']+)["']/i)?.at(1));

    if (width && height) {
        return {width, height};
    }

    const viewBox = svgTag.match(/\bviewBox=["']([^"']+)["']/i)?.at(1);
    if (viewBox) {
        const viewBoxParts = viewBox.trim().split(/[\s,]+/);
        if (viewBoxParts.length >= 4) {
            const viewBoxWidth = Number.parseFloat(viewBoxParts.at(2) ?? '');
            const viewBoxHeight = Number.parseFloat(viewBoxParts.at(3) ?? '');

            if (!Number.isNaN(viewBoxWidth) && !Number.isNaN(viewBoxHeight) && viewBoxWidth > 0 && viewBoxHeight > 0) {
                return {width: viewBoxWidth, height: viewBoxHeight};
            }
        }
    }

    if (width) {
        return {width, height: width};
    }

    if (height) {
        return {width: height, height};
    }

    return null;
}

export default parseSvgDimensions;
