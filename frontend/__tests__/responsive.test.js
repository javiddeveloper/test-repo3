/**
 * Calc — Responsive Design Tests
 * Verifies the calculator layout adapts correctly across viewports.
 *
 * NOTE: JSDOM does not fully simulate CSS layout or media query matching.
 * Instead, we verify that:
 *   - The CSS contains correct media query breakpoints
 *   - Responsive class names / data attributes are present
 *   - The HTML structure supports mobile-first usage
 *   - touch-action and tap-highlight are set for mobile
 *   - The container has max-width: 100% for fluid scaling
 */

const fs = require('fs');
const path = require('path');

const cssCode = fs.readFileSync(path.resolve(__dirname, '../styles.css'), 'utf8');
const htmlCode = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('CSS — Media Query Breakpoints', () => {
    test('contains mobile breakpoint at 480px', () => {
        expect(cssCode).toContain('max-width: 480px');
    });

    test('contains small mobile breakpoint at 360px', () => {
        expect(cssCode).toContain('max-width: 360px');
    });

    test('contains tablet breakpoint range (481px–768px)', () => {
        expect(cssCode).toContain('min-width: 481px');
        expect(cssCode).toContain('max-width: 768px');
    });

    test('contains desktop breakpoint at 769px', () => {
        expect(cssCode).toContain('min-width: 769px');
    });

    test('contains large desktop breakpoint at 1200px', () => {
        expect(cssCode).toContain('min-width: 1200px');
    });
});

describe('CSS — Responsive Properties', () => {
    test('calculator has max-width: 100% for fluid scaling', () => {
        expect(cssCode).toContain('max-width: 100%');
    });

    test('buttons have touch-action: manipulation for mobile tap speed', () => {
        expect(cssCode).toContain('touch-action: manipulation');
    });

    test('buttons have -webkit-tap-highlight-color: transparent', () => {
        expect(cssCode).toContain('-webkit-tap-highlight-color: transparent');
    });

    test('mobile view sets smaller font sizes', () => {
        // Mobile display font-size should be smaller than desktop
        expect(cssCode).toContain('font-size: 28px'); // mobile display
        expect(cssCode).toContain('font-size: 42px'); // desktop display
    });

    test('mobile buttons are slightly smaller (52px)', () => {
        expect(cssCode).toContain('height: 52px'); // mobile button
        expect(cssCode).toContain('height: 64px'); // desktop button
    });

    test('reduced-motion preference is respected', () => {
        expect(cssCode).toContain('prefers-reduced-motion: reduce');
    });

    test('dark mode is optionally supported via data-theme attribute', () => {
        expect(cssCode).toContain('data-theme="dark"');
    });

    test('calculator container has border-radius: 12px (desktop)', () => {
        // Verify the base radius exists (mobile overrides it)
        expect(cssCode).toContain('border-radius: 12px');
    });

    test('buttons have border-radius: 6px', () => {
        expect(cssCode).toContain('border-radius: 6px');
    });

    test('body uses min-height: 100dvh for dynamic viewport', () => {
        expect(cssCode).toContain('100dvh');
    });
});

describe('HTML — Mobile-Friendly Structure', () => {
    test('has viewport meta tag', () => {
        expect(htmlCode).toContain('name="viewport"');
        expect(htmlCode).toContain('initial-scale=1.0');
    });

    test('uses semantic <main> element', () => {
        expect(htmlCode).toContain('<main');
    });

    test('all buttons have accessible labels', () => {
        // Count buttons with aria-label or data attributes
        const ariaLabels = (htmlCode.match(/aria-label=/g) || []).length;
        const dataValues = (htmlCode.match(/data-value=/g) || []).length;
        const dataActions = (htmlCode.match(/data-action=/g) || []).length;
        // Total buttons = 16
        expect(ariaLabels + dataValues + dataActions).toBeGreaterThanOrEqual(16);
    });

    test('display has aria-live region for screen readers', () => {
        expect(htmlCode).toContain('aria-live="polite"');
        expect(htmlCode).toContain('aria-atomic="true"');
    });

    test('calculator has role="application"', () => {
        expect(htmlCode).toContain('role="application"');
    });
});

describe('CSS — Visual Design System Compliance', () => {
    test('primary color #6366F1 is used for operators and equals', () => {
        expect(cssCode).toContain('#6366F1');
    });

    test('secondary color #20970B for AC/C buttons', () => {
        expect(cssCode).toContain('#20970B');
    });

    test('background color is #FAFAFA', () => {
        expect(cssCode).toContain('#FAFAFA');
    });

    test('neutral color #9C9C9C for percent button', () => {
        expect(cssCode).toContain('#9C9C9C');
    });

    test('General Sans font for display', () => {
        expect(cssCode).toContain('General Sans');
    });

    test('DM Sans font for buttons', () => {
        expect(cssCode).toContain('DM Sans');
    });

    test('focus-visible box-shadow uses primary color', () => {
        expect(cssCode).toContain('rgba(99, 102, 241, 0.35)');
    });

    test('no pure black (#000) used for text color', () => {
        // The knowledge base says never use pure black for text
        // Search for color: #000 or color:#000 — should not exist
        const lines = cssCode.split('\n');
        const textColorLines = lines.filter(line =>
            line.includes('color:') && !line.includes('background')
        );
        textColorLines.forEach(line => {
            expect(line).not.toMatch(/#0{3,6}\b/);
        });
    });
});

describe('HTML — Button Grid Structure', () => {
    test('has exactly 21 buttons (20 calc + 1 theme toggle)', () => {
        const buttonMatches = htmlCode.match(/<button/g);
        expect(buttonMatches).toHaveLength(21);
    });

    test('buttons are inside a grid container', () => {
        expect(htmlCode).toContain('class="buttons"');
    });

    test('AC button exists', () => {
        expect(htmlCode).toContain('data-action="clear-all"');
    });

    test('C button exists', () => {
        expect(htmlCode).toContain('data-action="clear"');
    });

    test('equals button exists', () => {
        expect(htmlCode).toContain('data-action="equals"');
    });

    test('all four operators exist', () => {
        expect(htmlCode).toContain('data-action="add"');
        expect(htmlCode).toContain('data-action="subtract"');
        expect(htmlCode).toContain('data-action="multiply"');
        expect(htmlCode).toContain('data-action="divide"');
    });

    test('decimal point button exists', () => {
        expect(htmlCode).toContain('data-value="."');
    });

    test('percent button exists', () => {
        expect(htmlCode).toContain('data-action="percent"');
    });
});
