/**
 * Calc — UI Interaction Tests
 * Tests button click handling, event delegation, display updates,
 * AC reset, C backspace.
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
/** @type {HTMLElement} */
let displayEl;

function setupDOM() {
    dom = new JSDOM(html, {
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

    // The script is already in the HTML, JSDOM will execute it with 'dangerously'.
    // But we need to wait for the event loop to process.
    displayEl = document.getElementById('display-value');
}

function click(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
        btn.click();
    }
}

function pressKey(key) {
    const event = new window.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
    });
    document.dispatchEvent(event);
}

describe('UI Interactions — Button Clicks', () => {
    beforeEach(() => {
        setupDOM();
    });

    test('clicking digit buttons updates the display', () => {
        // Make sure DOM is ready and display shows 0 initially
        expect(displayEl.textContent).toBe('0');

        click('[data-value="5"]');
        click('[data-value="3"]');
        expect(displayEl.textContent).toBe('53');
    });

    test('clicking AC resets the display to 0', () => {
        click('[data-value="7"]');
        expect(displayEl.textContent).toBe('7');

        click('[data-action="clear-all"]');
        expect(displayEl.textContent).toBe('0');
    });

    test('clicking C acts as backspace (removes last digit)', () => {
        click('[data-value="1"]');
        click('[data-value="2"]');
        click('[data-value="3"]');
        expect(displayEl.textContent).toBe('123');

        click('[data-action="clear"]');
        expect(displayEl.textContent).toBe('12');

        click('[data-action="clear"]');
        expect(displayEl.textContent).toBe('1');

        click('[data-action="clear"]');
        expect(displayEl.textContent).toBe('0');

        click('[data-action="clear"]');
        expect(displayEl.textContent).toBe('0');
    });

    test('typing a number then operator then number then equals shows result', () => {
        click('[data-value="2"]');
        click('[data-action="add"]');
        click('[data-value="3"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('5');
    });

    test('chain calculation: 5 + 3 = 8, then + 2 = 10', () => {
        click('[data-value="5"]');
        click('[data-action="add"]');
        click('[data-value="3"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('8');

        click('[data-action="add"]');
        click('[data-value="2"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('10');
    });

    test('shows Error for division by zero', () => {
        click('[data-value="1"]');
        click('[data-value="0"]');
        click('[data-action="divide"]');
        click('[data-value="0"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('Error');

        click('[data-action="clear-all"]');
        expect(displayEl.textContent).toBe('0');
    });

    test('clicking decimal point adds it only once', () => {
        click('[data-value="3"]');
        click('[data-value="."]');
        click('[data-value="."]');
        click('[data-value="1"]');
        click('[data-value="4"]');
        expect(displayEl.textContent).toBe('3.14');
    });

    test('multiple operator presses chain correctly', () => {
        click('[data-value="4"]');
        click('[data-action="add"]');
        click('[data-value="2"]');
        click('[data-action="multiply"]');
        click('[data-value="3"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('18');
    });

    test('percent button converts current input to percentage', () => {
        click('[data-value="5"]');
        click('[data-value="0"]');
        click('[data-action="percent"]');
        expect(displayEl.textContent).toBe('0.5');
    });

    test('clicking operator without a second operand waits for input', () => {
        click('[data-value="8"]');
        click('[data-action="add"]');
        expect(displayEl.textContent).toBe('8');

        click('[data-value="2"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('10');
    });

    test('keyboard input works (Enter for equals, Escape for AC)', () => {
        pressKey('9');
        pressKey('+');
        pressKey('1');
        pressKey('Enter');
        expect(displayEl.textContent).toBe('10');

        pressKey('Escape');
        expect(displayEl.textContent).toBe('0');
    });

    test('backspace keyboard key (Backspace) clears last digit', () => {
        pressKey('7');
        pressKey('8');
        pressKey('9');
        expect(displayEl.textContent).toBe('789');

        pressKey('Backspace');
        expect(displayEl.textContent).toBe('78');

        pressKey('Backspace');
        expect(displayEl.textContent).toBe('7');

        pressKey('Backspace');
        expect(displayEl.textContent).toBe('0');
    });

    test('typing 00 appends two zeros', () => {
        click('[data-value="1"]');
        click('[data-value="00"]');
        expect(displayEl.textContent).toBe('100');
    });

    test('typing after an error resets correctly after AC', () => {
        click('[data-value="1"]');
        click('[data-action="divide"]');
        click('[data-value="0"]');
        click('[data-action="equals"]');
        expect(displayEl.textContent).toBe('Error');

        click('[data-action="clear-all"]');
        click('[data-value="5"]');
        expect(displayEl.textContent).toBe('5');
    });
});
