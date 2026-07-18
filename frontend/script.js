/* ========================================
   Calc — Simple Calculator Logic
   Single Responsibility Principle
   ======================================== */

/** @typedef {'add'|'subtract'|'multiply'|'divide'|null} Operator */

/**
 * @typedef {Object} CalcState
 * @property {string} displayText   - what is shown on the display
 * @property {string} currentInput  - the current operand being typed
 * @property {string} previousInput - the first operand before operator
 * @property {Operator} operator    - the pending operator
 * @property {boolean} shouldReset  - whether next digit should reset currentInput
 */

/** ---------- Constants ---------- */

const ERROR_DISPLAY = 'Error';
const MAX_INPUT_LENGTH = 16;

/** ---------- State ---------- */

/** @type {CalcState} */
const state = {
    displayText: '0',
    currentInput: '0',
    previousInput: '',
    operator: null,
    shouldReset: false,
};

/** ---------- DOM refs ---------- */

const displayEl = document.getElementById('display-value');

// ---------------------------------------------------------------------------
//  Pure arithmetic helpers
// ---------------------------------------------------------------------------

/**
 * Add two numbers given as strings.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function add(a, b) {
    return String(Number(a) + Number(b));
}

/**
 * Subtract b from a.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function subtract(a, b) {
    return String(Number(a) - Number(b));
}

/**
 * Multiply two numbers.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function multiply(a, b) {
    return String(Number(a) * Number(b));
}

/**
 * Divide a by b. Returns 'Error' for division by zero.
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function divide(a, b) {
    const divisor = Number(b);
    if (divisor === 0) {
        return 'Error';
    }
    return String(Number(a) / divisor);
}

/** ---------- Display helpers ---------- */

/**
 * Check if a string is a valid finite number.
 * @param {string} str
 * @returns {boolean}
 */
function isValidNumber(str) {
    if (str === '' || str === '.' || str === '-') return false;
    return !isNaN(Number(str)) && isFinite(Number(str));
}

/**
 * Clean up a result string for display — remove trailing zeros,
 * handle Infinity / Error.
 * @param {string} str
 * @returns {string}
 */
function sanitizeDisplay(str) {
    if (str === 'Error' || str === 'Infinity' || str === '-Infinity') {
        return 'Error';
    }
    const parts = str.split('.');
    if (parts.length === 2) {
        parts[1] = parts[1].replace(/0+$/, '');
        if (parts[1] === '') {
            return parts[0];
        }
        return parts.join('.');
    }
    return str;
}

/** ---------- Core compute ---------- */

/**
 * Compute result of (a op b).
 * @param {string} a
 * @param {Operator} op
 * @param {string} b
 * @returns {string}
 */
function compute(a, op, b) {
    switch (op) {
        case 'add':      return add(a, b);
        case 'subtract': return subtract(a, b);
        case 'multiply': return multiply(a, b);
        case 'divide':   return divide(a, b);
        default:         return b;
    }
}

/** ---------- Expression evaluator ---------- */

/**
 * Token -> operator map
 * @type {Record<string, Operator>}
 */
const OPERATOR_MAP = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
};

/**
 * Evaluate a simple arithmetic expression string (e.g. "12+34").
 * Only supports one operator at a time.
 * Returns the result as a string, or 'Error' on invalid input / division by zero.
 *
 * @param {string} expr  — expression like "3+4", "10/0"
 * @returns {string}
 */
function evaluate(expr) {
    if (typeof expr !== 'string') {
        return 'Error';
    }
    const trimmed = expr.trim();
    if (trimmed === '') {
        return 'Error';
    }

    // Find the operator position (only the first occurrence)
    const operators = ['+', '-', '*', '/'];
    let opIndex = -1;
    let foundOp = '';

    for (const op of operators) {
        const idx = trimmed.indexOf(op);
        if (idx > 0) { // must not be at position 0 (negative sign is not supported as unary)
            if (opIndex === -1 || idx < opIndex) {
                opIndex = idx;
                foundOp = op;
            }
        }
    }

    if (opIndex === -1) {
        // Single number — just validate and return
        return isValidNumber(trimmed) ? sanitizeDisplay(trimmed) : 'Error';
    }

    const left = trimmed.slice(0, opIndex).trim();
    const right = trimmed.slice(opIndex + 1).trim();

    if (!isValidNumber(left) || !isValidNumber(right)) {
        return 'Error';
    }

    const operator = OPERATOR_MAP[foundOp];
    const result = compute(left, operator, right);

    if (result === 'Error') {
        return 'Error';
    }

    return sanitizeDisplay(result);
}

/** ---------- State mutations ---------- */

function updateDisplay() {
    if (displayEl) {
        displayEl.textContent = state.displayText;
    }
}

function resetState() {
    state.displayText = '0';
    state.currentInput = '0';
    state.previousInput = '';
    state.operator = null;
    state.shouldReset = false;
    updateDisplay();
}

function clearLastEntry() {
    state.currentInput = '0';
    state.displayText = '0';
    state.shouldReset = false;
    updateDisplay();
}

/**
 * Append a digit or decimal point to current input.
 * @param {string} value
 * @returns {boolean} true if successful
 */
function inputDigit(value) {
    if (state.shouldReset) {
        state.currentInput = '0';
        state.shouldReset = false;
    }

    if (value === '.') {
        if (state.currentInput.includes('.')) {
            return false;
        }
        state.currentInput += '.';
    } else {
        if (state.currentInput === '0' && value !== '00') {
            state.currentInput = value;
        } else {
            state.currentInput += value;
            if (state.currentInput.length > MAX_INPUT_LENGTH) {
                state.currentInput = state.currentInput.slice(0, MAX_INPUT_LENGTH);
            }
        }
    }

    state.displayText = state.currentInput;
    updateDisplay();
    return true;
}

/**
 * Handle operator press — stores current value and operator.
 * If there's a pending operation, chains it first.
 * @param {Operator} op
 */
function inputOperator(op) {
    const curr = state.currentInput;
    if (!isValidNumber(curr)) {
        return;
    }

    if (state.operator && !state.shouldReset) {
        const result = compute(state.previousInput, state.operator, curr);
        if (result === 'Error') {
            state.displayText = 'Error';
            state.currentInput = 'Error';
            state.operator = null;
            state.previousInput = '';
            state.shouldReset = true;
            updateDisplay();
            return;
        }
        state.currentInput = result;
        state.displayText = sanitizeDisplay(result);
        updateDisplay();
    }

    state.previousInput = state.currentInput;
    state.operator = op;
    state.shouldReset = true;
}

/**
 * Execute equals — compute final result.
 */
function inputEquals() {
    if (!state.operator) {
        return;
    }

    const curr = state.currentInput;
    if (!isValidNumber(curr)) {
        return;
    }

    const result = compute(state.previousInput, state.operator, curr);
    if (result === 'Error') {
        state.displayText = 'Error';
        state.currentInput = 'Error';
    } else {
        const sanitized = sanitizeDisplay(result);
        state.displayText = sanitized;
        state.currentInput = result;
    }

    state.operator = null;
    state.previousInput = '';
    state.shouldReset = true;
    updateDisplay();
}

/**
 * Apply percent to current input.
 */
function inputPercent() {
    const curr = state.currentInput;
    if (!isValidNumber(curr)) {
        return;
    }
    const result = String(Number(curr) / 100);
    state.currentInput = result;
    state.displayText = sanitizeDisplay(result);
    state.shouldReset = true;
    updateDisplay();
}

/** ---------- Event handler ---------- */

/**
 * Route button clicks to the correct action.
 * @param {MouseEvent} e
 */
function handleButtonClick(e) {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    if (btn.dataset.value !== undefined) {
        inputDigit(btn.dataset.value);
        return;
    }

    const action = btn.dataset.action;
    switch (action) {
        case 'clear-all':    resetState(); break;
        case 'clear':        clearLastEntry(); break;
        case 'percent':      inputPercent(); break;
        case 'add':          inputOperator('add'); break;
        case 'subtract':     inputOperator('subtract'); break;
        case 'multiply':     inputOperator('multiply'); break;
        case 'divide':       inputOperator('divide'); break;
        case 'equals':       inputEquals(); break;
        default:             break;
    }
}

/** ---------- Keyboard support ---------- */

const KEY_MAP = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': '.',
    'Enter': 'equals',
    '=': 'equals',
    'Escape': 'clear-all',
    'Backspace': 'clear',
    'Delete': 'clear',
    '%': 'percent',
    '/': 'divide',
    '*': 'multiply',
    '-': 'subtract',
    '+': 'add',
};

function handleKeyboard(e) {
    const key = e.key;
    const mapped = KEY_MAP[key];

    if (!mapped) return;

    e.preventDefault();

    if (['0','1','2','3','4','5','6','7','8','9','.'].includes(mapped)) {
        inputDigit(mapped);
        return;
    }

    switch (mapped) {
        case 'clear-all':    resetState(); break;
        case 'clear':        clearLastEntry(); break;
        case 'percent':      inputPercent(); break;
        case 'equals':       inputEquals(); break;
        case 'add':          inputOperator('add'); break;
        case 'subtract':     inputOperator('subtract'); break;
        case 'multiply':     inputOperator('multiply'); break;
        case 'divide':       inputOperator('divide'); break;
        default:             break;
    }
}

/** ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.buttons')?.addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboard);
    updateDisplay();
});
