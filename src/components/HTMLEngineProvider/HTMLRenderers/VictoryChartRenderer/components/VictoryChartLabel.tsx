import {useChartFontManager, useChartTypefaces} from '@components/Charts/context/ChartFontsContext';
import {buildChartParagraph} from '@components/Charts/utils';
import getChartSkiaTypeface from '@components/Charts/utils/getChartSkiaTypeface';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computeTextAnchorPosition from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computeTextAnchorPosition';
import getSkiaLineMetrics from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getSkiaLineMetrics';
import {getLocalizedVictoryChartLabelText} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/localizeVictoryChartLabelText';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useTheme from '@hooks/useTheme';

import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import type {Color, SkFont, SkParagraph} from '@shopify/react-native-skia';

import {Paragraph, Skia, Text as SkText} from '@shopify/react-native-skia';
import React from 'react';

type VictoryChartLabelsProps = LabelItem & {
    timezone?: SelectedTimezone;
};

type ProcessedLine = {
    lineX: number;
    lineY: number;
    line: string;
    lineFont: SkFont | null;
    lineParagraph: SkParagraph | null;
    lineColor: Color | undefined;
    lineWidth: number;
};

/**
 * Skia's Paragraph paint path calls `layout(width)` again with the paint width. Victory labels
 * previously used SkText (no wrapping), so we layout/paint with an effectively unbounded width and
 * only use the measured line width for text-anchor positioning.
 */
const VICTORY_LABEL_PARAGRAPH_LAYOUT_WIDTH = 100000;

/**
 * Renders floating Skia text labels (from `<victorylabel>` nodes) over the chart canvas.
 * Intended for use inside CartesianChart's `renderOutside` callback.
 *
 * Prefers the Paragraph API (with NotoSansSymbols fallback) so currency glyphs missing from
 * display fonts like Expensify New Kansas (e.g. ₫) still render. Falls back to single-typeface
 * SkText while fonts are still loading.
 */
function VictoryChartLabel({x, y, text, color, fontSize, fontWeight, fontFamily, fontStyle, lineHeight, textAnchor = 'start', verticalAnchor = 'middle', timezone}: VictoryChartLabelsProps) {
    const typefaces = useChartTypefaces();
    const fontManager = useChartFontManager();
    const theme = useTheme();
    const displayText = getLocalizedVictoryChartLabelText(text, timezone);
    const processedLines = displayText.split('\n').reduce(
        (acc, line, index) => {
            const lineColor = resolveChartThemeColor(color?.[index], theme);
            const lineFontSize = fontSize?.[index];
            const lineFontWeight = fontWeight?.[index];
            const lineFontFamily = fontFamily?.[index];
            const lineFontStyle = fontStyle?.[index];
            const lineLineHeight = lineHeight?.[index];
            const customLineHeight = lineLineHeight ? lineLineHeight * (lineFontSize ?? 0) : 0;

            if (fontManager && lineFontSize) {
                const paragraph = buildChartParagraph(line, fontManager, lineFontSize, typeof lineColor === 'string' ? lineColor : undefined, {
                    preferredFontFamily: lineFontFamily,
                    fontWeight: lineFontWeight,
                    fontStyle: lineFontStyle,
                });
                paragraph.layout(VICTORY_LABEL_PARAGRAPH_LAYOUT_WIDTH);
                const metrics = paragraph.getLineMetrics().at(0);
                const metricsLineHeight = metrics?.height ?? lineFontSize;
                const lineWidth = paragraph.getLongestLine();
                const lineTop = acc.y;
                acc.y += customLineHeight || metricsLineHeight;

                acc.lines.push({
                    lineX: x,
                    lineY: lineTop,
                    line,
                    lineFont: null,
                    lineParagraph: paragraph,
                    lineColor,
                    lineWidth,
                });
                return acc;
            }

            const typeface = getChartSkiaTypeface(typefaces, {
                fontFamily: lineFontFamily,
                fontStyle: lineFontStyle,
                fontWeight: lineFontWeight,
            });
            const lineFont = typeface && lineFontSize ? Skia.Font(typeface, lineFontSize) : null;
            const {ascent, lineHeight: metricsLineHeight} = getSkiaLineMetrics(lineFont);
            const lineWidth = lineFont?.getGlyphWidths(lineFont.getGlyphIDs(line)).reduce((totalWidth, width) => totalWidth + width, 0) ?? 0;
            const lineX = x;
            const lineY = acc.y + ascent;
            acc.y += customLineHeight || metricsLineHeight;

            acc.lines.push({
                lineX,
                lineY,
                line,
                lineFont,
                lineParagraph: null,
                lineColor,
                lineWidth,
            });
            return acc;
        },
        {lines: [] as ProcessedLine[], y},
    );

    const blockHeight = processedLines.y - y;

    return processedLines.lines.map(({lineX, lineY, line, lineFont, lineParagraph, lineColor, lineWidth}) => {
        if (lineParagraph) {
            return (
                <Paragraph
                    key={`text-${lineX}-${lineY}`}
                    paragraph={lineParagraph}
                    x={computeTextAnchorPosition(lineX, lineWidth, textAnchor)}
                    y={computeTextAnchorPosition(lineY, blockHeight, verticalAnchor)}
                    width={VICTORY_LABEL_PARAGRAPH_LAYOUT_WIDTH}
                />
            );
        }

        return (
            <SkText
                key={`text-${lineX}-${lineY}`}
                x={computeTextAnchorPosition(lineX, lineWidth, textAnchor)}
                y={computeTextAnchorPosition(lineY, blockHeight, verticalAnchor)}
                text={line}
                font={lineFont}
                color={lineColor}
            />
        );
    });
}

export default VictoryChartLabel;
