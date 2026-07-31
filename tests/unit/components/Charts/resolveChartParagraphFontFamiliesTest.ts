import resolveChartParagraphFontFamilies, {resolveChartFontMgrFamilyName} from '@components/Charts/utils/resolveChartParagraphFontFamilies';
import VictoryTheme from '@components/Charts/VictoryTheme';

describe('resolveChartParagraphFontFamilies', () => {
    it('maps CSS font-family names to Skia fontManager family names', () => {
        expect(resolveChartFontMgrFamilyName('Expensify New Kansas')).toBe('ExpensifyNewKansas');
        expect(resolveChartFontMgrFamilyName('Expensify Neue')).toBe('ExpensifyNeue');
        expect(resolveChartFontMgrFamilyName('Expensify Mono')).toBe('ExpensifyMono');
        expect(resolveChartFontMgrFamilyName('Unknown')).toBeUndefined();
    });

    it('returns the default chart font chain when no preferred family is set', () => {
        expect(resolveChartParagraphFontFamilies()).toEqual([...VictoryTheme.fontFamilies]);
    });

    it('puts the preferred family first so missing glyphs can fall back (e.g. ₫ from Kansas)', () => {
        const families = resolveChartParagraphFontFamilies('Expensify New Kansas');
        expect(families.at(0)).toBe('ExpensifyNewKansas');
        expect(families).toEqual(expect.arrayContaining([...VictoryTheme.fontFamilies]));
        expect(new Set(families).size).toBe(families.length);
    });
});
