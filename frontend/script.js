/* ========================================
   Calc — Simple Calculator Logic
   Single Responsibility Principle
   ======================================== */

/** @typedef {'add'|'subtract'|'multiply'|'divide'|null} Operator */

/**
 * @typedef {Object} CalcState
 * @property {string} displayText
 * @property {string} currentInput
 * @property {string} previousInput
 * @property {Operator} operator
 * @property {boolean} shouldReset
 */

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

/** ---------- Pure functions ---------- */

/**
 * Format a number string for display (avoid floating point noise).
 * @param {string} str
 * @returns {string}
 */
function sanitizeDisplay(str) {
    if (str === 'Error' || str === 'Infinity' || str === '-Infinity') {
        return 'Error';
    }
    // Remove trailing zeros after decimal for cleaner display
    let parts = str.split('.');
    if (parts.length === 2) {
        parts[1] = parts[1].replace(/0+$/, '');
        if (parts[1] === '') {
            return parts[0];
        }
        return parts.join('.');
    }
    return str;
}

/**
 * Check if a string is a valid number.
 * @param {string} str
 * @returns {boolean}
 */
function isValidNumber(str) {
    if (str === '' || str === '.' || str === '-') return false;
    return !isNaN(Number(str)) && isFinite(Number(str));
}

/**
 * Add two numbers as strings.
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

/**
 * Calculate percentage of current input.
 * @param {string} value
 * @returns {string}
 */
function percent(value) {
    return String(Number(value) / 100);
}

/**
 * Compute result based on operator.
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

/** ---------- State mutations ---------- */

function updateDisplay() {
    displayEl.textContent = state.displayText;
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
        // Prevent multiple decimals
        if (state.currentInput.includes('.')) {
            return false;
        }
        state.currentInput += '.';
    } else {
        // Leading zero handling
        if (state.currentInput === '0' && value !== '00') {
            state.currentInput = value;
        } else {
            state.currentInput += value;
            // Limit input length
            if (state.currentInput.length > 16) {
                state.currentInput = state.currentInput.slice(0, 16);
            }
        }
    }

    state.displayText = state.currentInput;
    updateDisplay();
    return true;
}

/**
 * Handle operator press.
 * @param {Operator} op
 */
function inputOperator(op) {
    const curr = state.currentInput;

    if (!isValidNumber(curr)) {
        return;
    }

    if (state.operator && !state.shouldReset) {
        // Chain calculation
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
 * Execute equals: compute final result.
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
    const result = percent(curr);
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

    // Number input
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

    // If it's a digit or decimal
    if (['0','1','2','3','4','5','6','7','8','9','.'].includes(mapped)) {
        inputDigit(mapped);
        return;
    }

    // Actions
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
