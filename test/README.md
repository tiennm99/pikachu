# Pikachu Game Testing System

A comprehensive Jest-based testing framework for the Pikachu card matching game logic, validating all four connection patterns with professional testing capabilities.

## Overview

This testing system validates all four Pikachu game patterns:
- **I-pattern**: Direct line connections (horizontal/vertical)
- **L-pattern**: Single-turn connections (90-degree turns)
- **U-pattern**: Border extension connections (extending beyond board edges)
- **Z-pattern**: Two-turn connections through intermediate points

## Project Structure

```
test/
├── base/
│   └── PikachuBaseTest.js         # Base test class with common utilities
├── patterns/
│   ├── i-pattern.test.js          # I-pattern Jest tests
│   ├── l-pattern.test.js          # L-pattern Jest tests
│   ├── u-pattern.test.js          # U-pattern Jest tests
│   └── z-pattern.test.js          # Z-pattern Jest tests
├── all-patterns.test.js           # Integration tests for all patterns
├── setup.js                       # Jest setup and custom matchers
└── README.md                      # This file

src/game/logic/
└── PikachuGameLogic.js            # Pure game logic (no Phaser dependencies)
```

## Installation

```bash
# Install dependencies
npm install

# Jest is already included in devDependencies
```

## Usage

### Run All Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with detailed output
npm run test:verbose

# Run tests silently (minimal output)
npm run test:silent
```

### Run Specific Pattern Tests

```bash
# Test individual patterns
npm run test:i        # I-pattern tests
npm run test:l        # L-pattern tests  
npm run test:u        # U-pattern tests
npm run test:z        # Z-pattern tests
```

### Run Individual Test Files

```bash
# Run specific test files
jest test/patterns/i-pattern.test.js
jest test/patterns/l-pattern.test.js
jest test/patterns/u-pattern.test.js
jest test/patterns/z-pattern.test.js
jest test/all-patterns.test.js
```

## Test Structure

### Base Test Class (`PikachuBaseTest`)

The base class provides common utilities for all pattern tests:

```javascript
import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('My Pattern Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    test('should connect cards with specific pattern', () => {
        // Create empty board
        const matrix = tester.createEmptyMatrix();
        
        // Place cards
        tester.placeCard(matrix, 1, 1, 1);  // row, col, cardType
        tester.placeCard(matrix, 1, 5, 1);
        
        // Create and run test case
        const testCase = tester.createTestCase(
            'Test description',
            matrix,
            1, 1, 1, 5,      // from (1,1) to (1,5)
            true,            // expected result
            'I-pattern'      // expected pattern
        );
        
        tester.expectTestCase(testCase);
    });
});
```

### Test Case Creation

```javascript
// Create test case with all parameters
const testCase = tester.createTestCase(
    name,              // Test description
    matrix,            // Board matrix
    row1, col1,        // First card position
    row2, col2,        // Second card position
    expected,          // Expected validity (true/false)
    expectedPattern,   // Expected pattern type (optional)
    expectedError      // Expected error message (optional)
);

// Execute test case with Jest assertions
tester.expectTestCase(testCase);
```

### Board Coordinates

- **Matrix**: 10x22 (height x width) including border padding
- **Game board**: 8x20 (actual playable area)
- **Coordinates**: 1-indexed for game board positions
- **Border**: Row 0, row 9, col 0, col 21 are always empty (type 0)

### Card Types

- **0**: Empty cell (passable)
- **1, 2, 3, ...**: Different card types
- **Same type**: Required for valid connections

## Jest Features

### Custom Matchers

The system includes custom Jest matchers for game-specific assertions:

```javascript
// Test if a move is valid
expect(result).toBeValidMove();

// Test if a move uses specific pattern
expect(result).toHavePattern('I-pattern');

// Standard Jest assertions also work
expect(result.valid).toBe(true);
expect(result.error).toContain('expected error message');
```

### Test Organization

Tests are organized using Jest's `describe` blocks:

```javascript
describe('I-Pattern Tests', () => {
    describe('Horizontal Lines', () => {
        test('should connect cards with clear horizontal path', () => {
            // Test implementation
        });
    });
    
    describe('Vertical Lines', () => {
        test('should connect cards with clear vertical path', () => {
            // Test implementation
        });
    });
});
```

## Example Test Cases

### I-Pattern Test
```javascript
test('should connect cards with clear horizontal path', () => {
    const matrix = tester.createEmptyMatrix();
    tester.placeCard(matrix, 1, 1, 1);
    tester.placeCard(matrix, 1, 5, 1);
    
    const testCase = tester.createTestCase(
        'Horizontal line - clear path',
        matrix,
        1, 1, 1, 5,
        true,
        'I-pattern'
    );
    
    tester.expectTestCase(testCase);
});
```

### L-Pattern Test
```javascript
test('should connect cards with L-shape via corner', () => {
    const matrix = tester.createEmptyMatrix();
    tester.placeCard(matrix, 1, 1, 1);
    tester.placeCard(matrix, 3, 3, 1);
    
    const testCase = tester.createTestCase(
        'L-shape via corner',
        matrix,
        1, 1, 3, 3,
        true,
        'L-pattern'
    );
    
    tester.expectTestCase(testCase);
});
```

### Error Testing
```javascript
test('should fail with different card types', () => {
    const matrix = tester.createEmptyMatrix();
    tester.placeCard(matrix, 1, 1, 1);
    tester.placeCard(matrix, 1, 5, 2); // different type
    
    const testCase = tester.createTestCase(
        'Different card types',
        matrix,
        1, 1, 1, 5,
        false,
        null,
        'Cards are different types'
    );
    
    tester.expectTestCase(testCase);
});
```

## Test Output

### Success Output
```
PASS test/patterns/i-pattern.test.js
  I-Pattern Tests
    Horizontal Lines
      ✓ should connect cards with clear horizontal path
      ✓ should not connect cards with blocked horizontal path
    Vertical Lines
      ✓ should connect cards with clear vertical path
      ✓ should not connect cards with blocked vertical path

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        2.5s
```

### Failure Output
```
FAIL test/patterns/l-pattern.test.js
  L-Pattern Tests
    Basic L-Shapes
      ✗ should connect cards with L-shape via corner
      
      expect(received).toHavePattern(expected)
      Expected pattern to be L-pattern, but got I-pattern
      
Test Suites: 1 failed, 1 total
Tests:       1 failed, 15 total
Time:        2.1s
```

### Coverage Report
```
npm run test:coverage

----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   95.2  |   91.4   |   100   |   94.8  |
 PikachuGameLogic.js  |   95.2  |   91.4   |   100   |   94.8  |
----------------------|---------|----------|---------|---------|
```

## Adding New Tests

1. **Add test to existing pattern file**:
```javascript
test('should handle new scenario', () => {
    const matrix = tester.createEmptyMatrix();
    // Set up test scenario
    const testCase = tester.createTestCase(/* parameters */);
    tester.expectTestCase(testCase);
});
```

2. **Create new test file**:
```javascript
import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('New Pattern Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });
    
    // Add tests here
});
```

## Configuration

### Jest Configuration (`jest.config.js`)
```javascript
export default {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    collectCoverageFrom: ['src/game/logic/**/*.js'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    }
};
```

### Package.json Scripts
```json
{
    "scripts": {
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:i": "jest test/patterns/i-pattern.test.js",
        "test:l": "jest test/patterns/l-pattern.test.js",
        "test:u": "jest test/patterns/u-pattern.test.js",
        "test:z": "jest test/patterns/z-pattern.test.js"
    }
}
```

## Debugging

### Debug Individual Tests
```bash
# Run specific test with verbose output
jest test/patterns/i-pattern.test.js --verbose

# Run single test case
jest test/patterns/i-pattern.test.js -t "should connect cards with clear horizontal path"

# Run tests with debugging
node --inspect-brk node_modules/.bin/jest test/patterns/i-pattern.test.js --runInBand
```

### Print Board State
```javascript
test('debug board state', () => {
    const matrix = tester.createEmptyMatrix();
    tester.placeCard(matrix, 1, 1, 1);
    tester.placeCard(matrix, 1, 5, 1);
    
    tester.printBoard(matrix); // Prints board to console
    
    // Continue with test
});
```

### Manual Testing
```javascript
test('manual game logic testing', () => {
    const matrix = tester.createEmptyMatrix();
    tester.placeCard(matrix, 1, 1, 1);
    tester.placeCard(matrix, 1, 5, 1);
    
    tester.game.loadBoardFromMatrix(matrix);
    const result = tester.game.testMove(1, 1, 1, 5);
    
    console.log('Test result:', result);
    
    expect(result.valid).toBe(true);
});
```

## Coverage Goals

The test suite aims for high coverage:
- **Branches**: 80%+ (all conditional paths)
- **Functions**: 80%+ (all methods tested)
- **Lines**: 80%+ (all code lines executed)
- **Statements**: 80%+ (all statements covered)

## Performance

### Test Execution Time
- **Individual patterns**: ~0.5-1.0 seconds
- **All patterns**: ~2-3 seconds
- **With coverage**: ~3-5 seconds

### Optimization Tips
- Use `beforeEach` for common setup
- Avoid complex board setups in simple tests
- Use `test.only()` for focused development
- Use `test.skip()` for temporary test disabling

## Continuous Integration

The test suite is designed to work with CI/CD systems:

```bash
# CI command
npm test -- --coverage --watchAll=false

# Exit code 0 = success, 1 = failure
echo $?
```

## Contributing

1. Write tests for new patterns or edge cases
2. Follow existing test structure and naming
3. Ensure all tests pass before submitting
4. Add documentation for new test utilities
5. Maintain high code coverage

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure `"type": "module"` in package.json
2. **Test timeouts**: Check for infinite loops in game logic
3. **Memory issues**: Clear test data in `beforeEach`
4. **Pattern conflicts**: Verify pattern priority logic

### Debug Commands

```bash
# Check Jest configuration
jest --showConfig

# Run tests with maximum verbosity
jest --verbose --detectOpenHandles

# Clear Jest cache
jest --clearCache

# Run tests without cache
jest --no-cache
```