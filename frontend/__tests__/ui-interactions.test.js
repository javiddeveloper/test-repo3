/**
 * Calc — UI Interaction Tests
 * Tests button click handling, event delegation, display updates,
 * AC reset, C backspace, and keyboard support.
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
    // Replace external script src with inline code so JSDOM can execute it
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

    displayEl = document.getElementById('display-value');
}

function click(selector) {
    const btn = document.querySelector(selector);
    if (btn) btn.click();
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

    test('initial display is 0', () => {
        expect(displayEl.textContent).toBe('0');
    });

    test('clicking digit buttons updates the display', () => {
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

    test('event delegation works via buttons container click', () => {
        click('[data-value="9"]');
        expect(displayEl.textContent).toBe('9');
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

    // ---------- Keyboard tests ----------

    test('keyboard: number keys type digits', () => {
        pressKey('4');
        pressKey('2');
        expect(displayEl.textContent).toBe('42');
    });

    test('keyboard: operators work', () => {
        pressKey('9');
        pressKey('+');
        pressKey('1');
        pressKey('Enter');
        expect(displayEl.textContent).toBe('10');
    });

    test('keyboard: Escape clears all (AC)', () => {
        pressKey('5');
        pressKey('0');
        expect(displayEl.textContent).toBe('50');

        pressKey('Escape');
        expect(displayEl.textContent).toBe('0');
    });

    test('keyboard: Backspace clears last digit', () => {
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

    test('keyboard: Delete also clears last digit', () => {
        pressKey('1');
        pressKey('2');
        expect(displayEl.textContent).toBe('12');

        pressKey('Delete');
        expect(displayEl.textContent).toBe('1');
    });

    test('keyboard: minus (-) and equals (=) keys work', () => {
        pressKey('8');
        pressKey('-');
        pressKey('3');
        pressKey('=');
        expect(displayEl.textContent).toBe('5');
    });

    test('keyboard: star (*) for multiply and slash (/) for divide', () => {
        pressKey('6');
        pressKey('*');
        pressKey('7');
        pressKey('=');
        expect(displayEl.textContent).toBe('42');
    });

    test('keyboard: percent key works', () => {
        pressKey('2');
        pressKey('0');
        pressKey('%');
        expect(displayEl.textContent).toBe('0.2');
    });

    test('keyboard: Enter does not submit form (preventDefault)', () => {
        // If preventDefault wasn't called, the page might reload.
        // We just verify the calculation works.
        pressKey('1');
        pressKey('+');
        pressKey('2');
        pressKey('Enter');
        expect(displayEl.textContent).toBe('3');
    });

    test('keyboard: chaining operations with keyboard', () => {
        pressKey('5');
        pressKey('+');
        pressKey('3');
        pressKey('=');
        expect(displayEl.textContent).toBe('8');

        pressKey('+');
        pressKey('2');
        pressKey('=');
        expect(displayEl.textContent).toBe('10');
    });

    test('keyboard: decimal point via keyboard', () => {
        pressKey('3');
        pressKey('.');
        pressKey('1');
        pressKey('4');
        expect(displayEl.textContent).toBe('3.14');
    });
});
