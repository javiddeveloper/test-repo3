/**
 * Calc — Unit Tests
 * Tests the pure calculator logic functions.
 * Every test follows Arrange / Act / Assert.
 */

// ---------------------------------------------------------------------------
//  Pure function implementations (duplicated from script.js for test isolation)
// ---------------------------------------------------------------------------

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

function isValidNumber(str) {
    if (str === '' || str === '.' || str === '-') return false;
    return !isNaN(Number(str)) && isFinite(Number(str));
}

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

function compute(a, op, b) {
    switch (op) {
        case 'add':      return add(a, b);
        case 'subtract': return subtract(a, b);
        case 'multiply': return multiply(a, b);
        case 'divide':   return divide(a, b);
        default:         return b;
    }
}

const OPERATOR_MAP = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
};

function evaluate(expr) {
    if (typeof expr !== 'string') {
        return 'Error';
    }
    const trimmed = expr.trim();
    if (trimmed === '') {
        return 'Error';
    }

    const operators = ['+', '-', '*', '/'];
    let opIndex = -1;
    let foundOp = '';

    for (const op of operators) {
        const idx = trimmed.indexOf(op);
        if (idx > 0) {
            if (opIndex === -1 || idx < opIndex) {
                opIndex = idx;
                foundOp = op;
            }
        }
    }

    if (opIndex === -1) {
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

// ===========================================================================
//  Tests
// ===========================================================================

describe('add', () => {
    test('adds two positive integers', () => {
        // Arrange
        const a = '10', b = '5';
        // Act
        const result = add(a, b);
        // Assert
        expect(result).toBe('15');
    });

    test('adds a positive and a negative number', () => {
        const result = add('-8', '3');
        expect(result).toBe('-5');
    });

    test('adds two decimals', () => {
        const result = add('0.1', '0.2');
        expect(Number(result)).toBeCloseTo(0.3, 10);
    });
});

describe('subtract', () => {
    test('subtracts two positive integers', () => {
        const result = subtract('10', '3');
        expect(result).toBe('7');
    });

    test('subtracts resulting in negative', () => {
        const result = subtract('3', '10');
        expect(result).toBe('-7');
    });

    test('subtracts with decimal result', () => {
        const result = subtract('5.5', '2.2');
        expect(Number(result)).toBeCloseTo(3.3, 10);
    });
});

describe('multiply', () => {
    test('multiplies two positive integers', () => {
        const result = multiply('7', '8');
        expect(result).toBe('56');
    });

    test('multiplies by zero', () => {
        const result = multiply('99', '0');
        expect(result).toBe('0');
    });

    test('multiplies negative numbers (product positive)', () => {
        const result = multiply('-4', '-3');
        expect(result).toBe('12');
    });

    test('multiplies negative by positive (product negative)', () => {
        const result = multiply('-4', '3');
        expect(result).toBe('-12');
    });
});

describe('divide', () => {
    test('divides two integers evenly', () => {
        const result = divide('20', '4');
        expect(result).toBe('5');
    });

    test('divides with decimal result', () => {
        const result = divide('10', '3');
        expect(Number(result)).toBeCloseTo(3.3333333333333335, 10);
    });

    test('returns Error for division by zero', () => {
        const result = divide('10', '0');
        expect(result).toBe('Error');
    });

    test('returns Error for zero divided by zero', () => {
        const result = divide('0', '0');
        expect(result).toBe('Error');
    });

    test('divides zero by non-zero', () => {
        const result = divide('0', '5');
        expect(result).toBe('0');
    });

    test('divides negative by positive', () => {
        const result = divide('-15', '3');
        expect(result).toBe('-5');
    });
});

describe('isValidNumber', () => {
    test('returns true for normal integer', () => {
        expect(isValidNumber('42')).toBe(true);
    });

    test('returns true for decimal', () => {
        expect(isValidNumber('3.14')).toBe(true);
    });

    test('returns true for negative number', () => {
        expect(isValidNumber('-7')).toBe(true);
    });

    test('returns true for zero', () => {
        expect(isValidNumber('0')).toBe(true);
    });

    test('returns false for empty string', () => {
        expect(isValidNumber('')).toBe(false);
    });

    test('returns false for lone decimal point', () => {
        expect(isValidNumber('.')).toBe(false);
    });

    test('returns false for lone minus sign', () => {
        expect(isValidNumber('-')).toBe(false);
    });

    test('returns false for non-numeric text', () => {
        expect(isValidNumber('abc')).toBe(false);
    });

    test('returns false for NaN', () => {
        expect(isValidNumber('NaN')).toBe(false);
    });

    test('returns false for Infinity', () => {
        expect(isValidNumber('Infinity')).toBe(false);
    });
});

describe('sanitizeDisplay', () => {
    test('removes trailing zeros after decimal point', () => {
        const result = sanitizeDisplay('4.5000');
        expect(result).toBe('4.5');
    });

    test('removes decimal point if nothing after it', () => {
        const result = sanitizeDisplay('8.0');
        expect(result).toBe('8');
    });

    test('returns Error for error string', () => {
        const result = sanitizeDisplay('Error');
        expect(result).toBe('Error');
    });

    test('returns Error for Infinity', () => {
        const result = sanitizeDisplay('Infinity');
        expect(result).toBe('Error');
    });

    test('returns Error for -Infinity', () => {
        const result = sanitizeDisplay('-Infinity');
        expect(result).toBe('Error');
    });

    test('returns integer as-is', () => {
        const result = sanitizeDisplay('42');
        expect(result).toBe('42');
    });

    test('handles negative decimal without trailing zeros', () => {
        const result = sanitizeDisplay('-3.14000');
        expect(result).toBe('-3.14');
    });

    test('preserves decimal when trailing zeros are meaningful', () => {
        const result = sanitizeDisplay('2.5001');
        expect(result).toBe('2.5001');
    });
});

describe('compute', () => {
    test('adds via compute', () => {
        const result = compute('10', 'add', '5');
        expect(result).toBe('15');
    });

    test('subtracts via compute', () => {
        const result = compute('10', 'subtract', '3');
        expect(result).toBe('7');
    });

    test('multiplies via compute', () => {
        const result = compute('7', 'multiply', '8');
        expect(result).toBe('56');
    });

    test('divides via compute', () => {
        const result = compute('20', 'divide', '4');
        expect(result).toBe('5');
    });

    test('returns Error on division by zero via compute', () => {
        const result = compute('10', 'divide', '0');
        expect(result).toBe('Error');
    });

    test('returns second operand for unknown operator', () => {
        const result = compute('10', null, '5');
        expect(result).toBe('5');
    });

    test('handles decimal results', () => {
        const result = compute('0.1', 'add', '0.2');
        expect(Number(result)).toBeCloseTo(0.3, 10);
    });
});

describe('evaluate', () => {
    // --- Happy path ---
    test('evaluates addition expression', () => {
        const result = evaluate('3+4');
        expect(result).toBe('7');
    });

    test('evaluates subtraction expression', () => {
        const result = evaluate('10-3');
        expect(result).toBe('7');
    });

    test('evaluates multiplication expression', () => {
        const result = evaluate('6*7');
        expect(result).toBe('42');
    });

    test('evaluates division expression', () => {
        const result = evaluate('20/4');
        expect(result).toBe('5');
    });

    // --- Edge cases ---
    test('evaluates expression with spaces', () => {
        const result = evaluate(' 10 + 5 ');
        expect(result).toBe('15');
    });

    test('evaluates decimal expression', () => {
        const result = evaluate('0.1+0.2');
        expect(Number(result)).toBeCloseTo(0.3, 10);
    });

    test('evaluates expression with negative numbers', () => {
        const result = evaluate('-4*3');
        expect(result).toBe('-12');
    });

    test('returns Error for division by zero', () => {
        const result = evaluate('10/0');
        expect(result).toBe('Error');
    });

    test('returns Error for empty string', () => {
        const result = evaluate('');
        expect(result).toBe('Error');
    });

    test('returns Error for whitespace-only string', () => {
        const result = evaluate('   ');
        expect(result).toBe('Error');
    });

    test('returns Error for non-string input (number)', () => {
        const result = evaluate(42);
        expect(result).toBe('Error');
    });

    test('returns Error for non-string input (null)', () => {
        const result = evaluate(null);
        expect(result).toBe('Error');
    });

    test('returns Error for invalid characters', () => {
        const result = evaluate('abc');
        expect(result).toBe('Error');
    });

    test('returns Error for malformed expression (missing right operand)', () => {
        const result = evaluate('5+');
        expect(result).toBe('Error');
    });

    test('returns Error for malformed expression (missing left operand)', () => {
        const result = evaluate('/5');
        expect(result).toBe('Error');
    });

    test('evaluates single valid number', () => {
        const result = evaluate('42');
        expect(result).toBe('42');
    });

    test('evaluates single decimal number', () => {
        const result = evaluate('3.14');
        expect(result).toBe('3.14');
    });

    test('returns Error for expression with multiple operators (unsupported)', () => {
        // Simple calculator evaluates one operator at a time; '2+3*4' contains
        // an invalid right operand ('3*4') so it should return Error.
        const result = evaluate('2+3*4');
        expect(result).toBe('Error');
    });

    test('handles large numbers', () => {
        const result = evaluate('999999999999+1');
        expect(result).toBe('1000000000000');
    });

    test('returns Error for division by zero with zero numerator', () => {
        const result = evaluate('0/0');
        expect(result).toBe('Error');
    });

    test('evaluates zero divided by number', () => {
        const result = evaluate('0/5');
        expect(result).toBe('0');
    });
});

describe('percent helper', () => {
    test('converts 50 to 0.5', () => {
        expect(String(Number('50') / 100)).toBe('0.5');
    });

    test('converts 100 to 1', () => {
        expect(String(Number('100') / 100)).toBe('1');
    });

    test('converts 0 to 0', () => {
        expect(String(Number('0') / 100)).toBe('0');
    });

    test('converts decimal percent', () => {
        expect(String(Number('0.5') / 100)).toBe('0.005');
    });
});
