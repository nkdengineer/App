import VictoryTheme from '@components/Charts/VictoryTheme';

import type {ChartFontFamilyName} from './chartFontConstants';

import {CHART_FONT_FAMILY_NAMES} from './chartFontConstants';

/**
 * Maps a CSS/HTML `font-family` (e.g. "Expensify New Kansas") to the Skia fontManager
 * registration name (e.g. "ExpensifyNewKansas").
 */
function resolveChartFontMgrFamilyName(cssFontFamily: string | undefined): ChartFontFamilyName | undefined {
    if (!cssFontFamily) {
        return undefined;
    }

    const normalized = cssFontFamily.trim().toLowerCase().replaceAll(/\s+/g, '');
    return CHART_FONT_FAMILY_NAMES.find((familyName) => familyName.toLowerCase() === normalized);
}

/**
 * Builds the Paragraph `fontFamilies` list with an optional preferred family first so Skia
 * can fall back to NotoSansSymbols (currency glyphs) / ExpensifyNeue when the preferred
 * face is missing a code point — e.g. Expensify New Kansas has no ₫.
 */
function resolveChartParagraphFontFamilies(preferredFontFamily?: string): string[] {
    const preferred = resolveChartFontMgrFamilyName(preferredFontFamily);
    if (!preferred) {
        return [...VictoryTheme.fontFamilies];
    }

    return [preferred, ...VictoryTheme.fontFamilies.filter((familyName) => familyName !== preferred)];
}

export default resolveChartParagraphFontFamilies;
export {resolveChartFontMgrFamilyName};
