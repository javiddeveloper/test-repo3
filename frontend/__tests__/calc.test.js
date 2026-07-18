/**
 * Calc — Unit Tests
 * Tests the pure calculator logic functions.
 */

// ---------- Pure function implementations (same as script.js) ----------

function sanitizeDisplay(str) {
    if (str === 'Error' || str === 'Infinity' || str === '-Infinity') {
        return 'Error';
    }
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

function isValidNumber(str) {
    if (str === '' || str === '.' || str === '-') return false;
    return !isNaN(Number(str)) && isFinite(Number(str));
}

function add(a, b) {
    return String(Number(a) + Number(b));
}

function subtract(a, b) {
    return String(Number(a) - Number(b));
}

function multiply(a, b) {
    return String(Number(a) * Number(b));
}

function divide(a, b) {
    const divisor = Number(b);
    if (divisor === 0) {
        return 'Error';
    }
    return String(Number(a) / divisor);
}

function percent(value) {
    return String(Number(value) / 100);
}

function compute(a, op, b) {
    switch (op) {
        case 'add':      return add(a, b);
        case 'subtract': return subtract(a, b);
        case 'multiply': return multiply(a, b);
        case 'divide':   return divide(a, b);
        default:         return b;
    }
}

// ---------- Tests ----------

describe('sanitizeDisplay', () => {
    test('removes trailing zeros after decimal point', () => {
        const input = '4.5000';
        const result = sanitizeDisplay(input);
        expect(result).toBe('4.5');
    });

    test('removes decimal point if nothing after it', () => {
        const input = '8.0';
        const result = sanitizeDisplay(input);
        expect(result).toBe('8');
    });

    test('returns Error for error strings', () => {
        const input = 'Error';
        const result = sanitizeDisplay(input);
        expect(result).toBe('Error');
    });

    test('returns Error for infinity', () => {
        const input = 'Infinity';
        const result = sanitizeDisplay(input);
        expect(result).toBe('Error');
    });

    test('returns integer as-is', () => {
        const input = '42';
        const result = sanitizeDisplay(input);
        expect(result).toBe('42');
    });

    test('handles negative decimal without trailing zeros', () => {
        const input = '-3.14000';
        const result = sanitizeDisplay(input);
        expect(result).toBe('-3.14');
    });
});

describe('isValidNumber', () => {
    test('returns true for a normal number string', () => {
        const input = '42.5';
        const result = isValidNumber(input);
        expect(result).toBe(true);
    });

    test('returns false for empty string', () => {
        const input = '';
        const result = isValidNumber(input);
        expect(result).toBe(false);
    });

    test('returns false for lone decimal point', () => {
        const input = '.';
        const result = isValidNumber(input);
        expect(result).toBe(false);
    });

    test('returns false for non-numeric text', () => {
        const input = 'abc';
        const result = isValidNumber(input);
        expect(result).toBe(false);
    });

    test('returns true for zero', () => {
        const input = '0';
        const result = isValidNumber(input);
        expect(result).toBe(true);
    });
});

describe('compute', () => {
    test('adds two numbers', () => {
        const a = '10', b = '5';
        const result = compute(a, 'add', b);
        expect(result).toBe('15');
    });

    test('subtracts two numbers', () => {
        const a = '10', b = '3';
        const result = compute(a, 'subtract', b);
        expect(result).toBe('7');
    });

    test('multiplies two numbers', () => {
        const a = '7', b = '8';
        const result = compute(a, 'multiply', b);
        expect(result).toBe('56');
    });

    test('divides two numbers', () => {
        const a = '20', b = '4';
        const result = compute(a, 'divide', b);
        expect(result).toBe('5');
    });

    test('returns Error on division by zero', () => {
        const a = '10', b = '0';
        const result = compute(a, 'divide', b);
        expect(result).toBe('Error');
    });

    test('returns second operand for unknown operator', () => {
        const a = '10', b = '5';
        const result = compute(a, null, b);
        expect(result).toBe('5');
    });

    test('handles decimal results in addition', () => {
        const a = '0.1', b = '0.2';
        const result = compute(a, 'add', b);
        expect(isValidNumber(result)).toBe(true);
        expect(Number(result)).toBeCloseTo(0.3, 10);
    });

    test('handles negative numbers in multiplication', () => {
        const a = '-4', b = '3';
        const result = compute(a, 'multiply', b);
        expect(result).toBe('-12');
    });

    test('handles large numbers without overflow', () => {
        const a = '999999999999', b = '1';
        const result = compute(a, 'add', b);
        expect(result).toBe('1000000000000');
    });
});

describe('percent', () => {
    test('converts 50 to 0.5', () => {
        const input = '50';
        const result = percent(input);
        expect(result).toBe('0.5');
    });

    test('converts 100 to 1', () => {
        const input = '100';
        const result = percent(input);
        expect(result).toBe('1');
    });

    test('converts 0 to 0', () => {
        const input = '0';
        const result = percent(input);
        expect(result).toBe('0');
    });
});
