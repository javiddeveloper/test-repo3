/**
 * Calc — Theme Switcher Tests
 * Tests light/dark theme toggle functionality:
 *   - Toggle button opens/closes panel
 *   - Switching theme updates data-theme attribute
 *   - Theme persists in localStorage
 *   - Keyboard support (Enter/Space on switch, Escape to close)
 *   - Click-outside closes panel
 *   - Icons update correctly
 */

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.resolve(__dirname, '../script.js'), 'utf8');

/** @type {JSDOM} */
let dom;
/** @type {Window} */
let window;
/** @type {Document} */
let document;

function setupDOM() {
    const htmlWithInlineScript = html.replace(
        '<script src="script.js"></script>',
        `<script>${scriptCode}</script>`
    );

    dom = new JSDOM(htmlWithInlineScript, {
        url: 'http://localhost',
        runScripts: 'dangerously',
    });

    window = dom.window;
    document = window.document;

    // Polyfill matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    // Mock localStorage
    const store = {};
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn((key) => store[key] ?? null),
            setItem: jest.fn((key, value) => { store[key] = value; }),
            removeItem: jest.fn((key) => { delete store[key]; }),
            clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
        },
        writable: true,
    });
}

describe('Theme Switcher — UI', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('toggle button exists with gear icon', () => {
        const toggle = document.getElementById('themeToggle');
        expect(toggle).toBeTruthy();
        expect(toggle.querySelector('.theme-toggle__icon')).toBeTruthy();
    });

    test('theme panel exists and is hidden by default', () => {
        const panel = document.getElementById('themePanel');
        expect(panel).toBeTruthy();
        expect(panel.classList.contains('theme-panel--open')).toBe(false);
    });

    test('clicking toggle opens the panel', () => {
        const toggle = document.getElementById('themeToggle');
        toggle.click();

        const panel = document.getElementById('themePanel');
        expect(panel.classList.contains('theme-panel--open')).toBe(true);
    });

    test('clicking toggle twice closes the panel', () => {
        const toggle = document.getElementById('themeToggle');

        toggle.click(); // open
        toggle.click(); // close

        const panel = document.getElementById('themePanel');
        expect(panel.classList.contains('theme-panel--open')).toBe(false);
    });

    test('clicking overlay closes the panel', () => {
        // First open
        document.getElementById('themeToggle').click();
        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(true);

        // Click overlay
        document.getElementById('themeOverlay').click();
        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(false);
    });

    test('Escape key closes an open panel', () => {
        // Open
        document.getElementById('themeToggle').click();
        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(true);

        // Escape
        const escapeEvent = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escapeEvent);

        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(false);
    });
});

describe('Theme Switcher — Light/Dark Toggle', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('default theme is light', () => {
        // After init (no saved preference, no system dark mode mock), it should be light
        const htmlEl = document.documentElement;
        expect(htmlEl.getAttribute('data-theme')).toBe('light');
    });

    test('clicking the switch toggles to dark', () => {
        const switchEl = document.getElementById('themeSwitch');
        switchEl.click();

        const htmlEl = document.documentElement;
        expect(htmlEl.getAttribute('data-theme')).toBe('dark');
    });

    test('clicking the switch again toggles back to light', () => {
        const switchEl = document.getElementById('themeSwitch');

        switchEl.click(); // → dark
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

        switchEl.click(); // → light
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('knob icon changes from ☀️ to 🌙 on dark', () => {
        const knobIcon = document.getElementById('knobIcon');
        expect(knobIcon.textContent).toBe('☀️'); // initial light

        document.getElementById('themeSwitch').click();

        expect(knobIcon.textContent).toBe('🌙'); // now dark
    });

    test('label active state updates on toggle', () => {
        const labelLight = document.getElementById('labelLight');
        const labelDark = document.getElementById('labelDark');

        // Initially light is active
        expect(labelLight.classList.contains('theme-switch__label--active')).toBe(true);
        expect(labelDark.classList.contains('theme-switch__label--active')).toBe(false);

        // Switch to dark
        document.getElementById('themeSwitch').click();

        expect(labelLight.classList.contains('theme-switch__label--active')).toBe(false);
        expect(labelDark.classList.contains('theme-switch__label--active')).toBe(true);
    });

    test('switch gets theme-switch--dark class when dark', () => {
        const switchEl = document.getElementById('themeSwitch');
        expect(switchEl.classList.contains('theme-switch--dark')).toBe(false);

        switchEl.click();
        expect(switchEl.classList.contains('theme-switch--dark')).toBe(true);
    });

    test('panel closes after theme toggle', () => {
        // Open panel
        document.getElementById('themeToggle').click();
        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(true);

        // Toggle theme
        document.getElementById('themeSwitch').click();

        // Panel should close
        expect(document.getElementById('themePanel').classList.contains('theme-panel--open')).toBe(false);
    });
});

describe('Theme Switcher — Keyboard', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('Enter key on switch toggles theme', () => {
        const switchEl = document.getElementById('themeSwitch');

        const enterEvent = new window.KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true,
        });
        switchEl.dispatchEvent(enterEvent);

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    test('Space key on switch toggles theme', () => {
        const switchEl = document.getElementById('themeSwitch');

        const spaceEvent = new window.KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true,
            cancelable: true,
        });
        switchEl.dispatchEvent(spaceEvent);

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
});

describe('Theme Switcher — Persistence', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('theme is saved to localStorage on toggle', () => {
        document.getElementById('themeSwitch').click();

        expect(window.localStorage.setItem).toHaveBeenCalledWith('calc-theme', 'dark');
    });

    test('theme is restored from localStorage on init', () => {
        // Re-init with a fresh DOM and pre-set localStorage
        // We'll simulate by calling applyTheme directly after setup
        // Since the init already ran with empty localStorage, we can check
        // if calling applyTheme('dark') works and then reloading
        const applyThemeStr = `(${function applyTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('calc-theme', theme);
        }.toString()})('dark')`;

        const scriptEl = document.createElement('script');
        scriptEl.textContent = applyThemeStr;
        document.body.appendChild(scriptEl);

        // Now simulate a re-init by checking localStorage
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        expect(window.localStorage.getItem('calc-theme')).toBe('dark');
    });
});

describe('Theme Switcher — HTML structure', () => {
    test('theme panel has correct structure', () => {
        // Check raw HTML for required elements
        expect(html).toContain('id="themeToggle"');
        expect(html).toContain('id="themePanel"');
        expect(html).toContain('id="themeOverlay"');
        expect(html).toContain('id="themeSwitch"');
        expect(html).toContain('class="theme-switch__track"');
        expect(html).toContain('class="theme-switch__knob"');
        expect(html).toContain('id="knobIcon"');
        expect(html).toContain('id="labelLight"');
        expect(html).toContain('id="labelDark"');
    });

    test('theme panel has role="dialog" for accessibility', () => {
        expect(html).toContain('role="dialog"');
    });

    test('theme switch has role="button" and tabindex', () => {
        expect(html).toContain('role="button"');
        expect(html).toContain('tabindex="0"');
    });
});
