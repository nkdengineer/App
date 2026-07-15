/**
 * Skia's SVG rasterizer does not support CSS `<style>` blocks or class selectors, so SVGs that style
 * their shapes via classes (e.g. exports from SVG Repo, Illustrator, Figma) render incorrectly
 * (typically as a solid black fill). This utility parses simple class and element rules from `<style>`
 * blocks and inlines them as SVG presentation attributes so Skia renders them faithfully.
 *
 * Only simple class (`.name`) and element (`path`) selectors are supported; complex selectors,
 * pseudo-classes, media queries and animations are ignored.
 */

type Declarations = Record<string, string>;

function escapeRegExp(value: string): string {
    return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parses a CSS declaration block (`prop: value; prop2: value2`) into a key/value map.
 */
function parseDeclarations(block: string): Declarations {
    const declarations: Declarations = {};
    for (const declaration of block.split(';')) {
        const separatorIndex = declaration.indexOf(':');
        if (separatorIndex === -1) {
            continue;
        }
        const property = declaration.slice(0, separatorIndex).trim();
        const value = declaration.slice(separatorIndex + 1).trim();
        if (property && value) {
            declarations[property] = value;
        }
    }
    return declarations;
}

function inlineSvgStyles(svgText: string): string {
    const styleBlocks = [...svgText.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match.at(1) ?? '').join('\n');
    if (!styleBlocks.trim()) {
        return svgText;
    }

    const classRules: Record<string, Declarations> = {};
    const tagRules: Record<string, Declarations> = {};

    // Strip CSS comments before parsing rules.
    const css = styleBlocks.replaceAll(/\/\*[\s\S]*?\*\//g, '');
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const declarations = parseDeclarations(rule.at(2) ?? '');
        if (Object.keys(declarations).length === 0) {
            continue;
        }
        for (const rawSelector of (rule.at(1) ?? '').split(',')) {
            const selector = rawSelector.trim();
            if (selector.startsWith('.')) {
                const className = selector.slice(1);
                classRules[className] = {...classRules[className], ...declarations};
            } else if (/^[a-zA-Z][\w-]*$/.test(selector)) {
                const tagName = selector.toLowerCase();
                tagRules[tagName] = {...tagRules[tagName], ...declarations};
            }
        }
    }

    // Remove the now-inlined style blocks.
    const withoutStyleBlocks = svgText.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Inject the matched declarations as presentation attributes on each element start tag.
    return withoutStyleBlocks.replaceAll(/<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g, (match, rawTagName: string, rawAttrs: string, selfClose: string) => {
        const tagName = rawTagName.toLowerCase();
        if (tagName === 'style') {
            return match;
        }

        const classMatch = rawAttrs.match(/\bclass\s*=\s*["']([^"']*)["']/i);
        const classNames = classMatch ? (classMatch.at(1) ?? '').split(/\s+/).filter(Boolean) : [];

        // Element rules apply first, then class rules override them (matching CSS specificity for icons).
        let merged: Declarations = {...tagRules[tagName]};
        for (const className of classNames) {
            merged = {...merged, ...classRules[className]};
        }

        if (Object.keys(merged).length === 0) {
            return match;
        }

        // Remove any existing presentation attributes we are about to set so the CSS-derived values win.
        let attrs = rawAttrs;
        for (const property of Object.keys(merged)) {
            attrs = attrs.replaceAll(new RegExp(`\\s${escapeRegExp(property)}\\s*=\\s*("[^"]*"|'[^']*')`, 'gi'), '');
        }

        const injectedAttrs = Object.entries(merged)
            .map(([property, value]) => ` ${property}="${value}"`)
            .join('');

        return `<${rawTagName}${attrs}${injectedAttrs}${selfClose}>`;
    });
}

export default inlineSvgStyles;
