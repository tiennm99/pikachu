import { PikachuGameLogic } from '../../src/game/logic/PikachuGameLogic.js';

/**
 * Base test class for Pikachu game pattern testing
 */
export class PikachuBaseTest {
    constructor() {
        this.game = new PikachuGameLogic();
    }

    /**
     * Create an empty board matrix with border padding
     * @returns {number[][]} Empty matrix
     */
    createEmptyMatrix() {
        const matrix = [];
        for (let row = 0; row < this.game.matrixHeight; row++) {
            matrix[row] = [];
            for (let col = 0; col < this.game.matrixWidth; col++) {
                matrix[row][col] = 0;
            }
        }
        return matrix;
    }

    /**
     * Place a card on the board matrix
     * @param {number[][]} matrix - The board matrix
     * @param {number} row - Row position (1-indexed for game board)
     * @param {number} col - Column position (1-indexed for game board)
     * @param {number} cardType - Card type (positive number)
     * @returns {number[][]} Modified matrix
     */
    placeCard(matrix, row, col, cardType) {
        if (row < 1 || row > this.game.boardHeight || col < 1 || col > this.game.boardWidth) {
            throw new Error(`Position (${row}, ${col}) is out of bounds`);
        }
        matrix[row][col] = cardType;
        return matrix;
    }

    /**
     * Create a test case with expected result
     * @param {string} name - Test case name
     * @param {number[][]} matrix - Board matrix
     * @param {number} row1 - First card row
     * @param {number} col1 - First card column
     * @param {number} row2 - Second card row
     * @param {number} col2 - Second card column
     * @param {boolean} expected - Expected result
     * @param {string} expectedPattern - Expected pattern type
     * @param {string} expectedError - Expected error message (for invalid moves)
     * @returns {Object} Test case object
     */
    createTestCase(name, matrix, row1, col1, row2, col2, expected, expectedPattern = null, expectedError = null) {
        return {
            name,
            matrix,
            row1,
            col1,
            row2,
            col2,
            expected,
            expectedPattern,
            expectedError
        };
    }

    /**
     * Run a single test case
     * @param {Object} testCase - Test case object
     * @returns {Object} Test result
     */
    runTestCase(testCase) {
        // Load the board
        this.game.loadBoardFromMatrix(testCase.matrix);
        
        // Test the move
        const result = this.game.testMove(testCase.row1, testCase.col1, testCase.row2, testCase.col2);
        
        // Check if result matches expectation
        const passed = result.valid === testCase.expected;
        const patternMatch = !testCase.expectedPattern || result.details?.pattern === testCase.expectedPattern;
        
        return {
            name: testCase.name,
            passed: passed && patternMatch,
            expected: testCase.expected,
            actual: result.valid,
            expectedPattern: testCase.expectedPattern,
            actualPattern: result.details?.pattern || 'none',
            error: result.error,
            details: result.details
        };
    }

    /**
     * Execute a test case with Jest expectations
     * @param {Object} testCase - Test case object
     */
    expectTestCase(testCase) {
        // Load the board
        this.game.loadBoardFromMatrix(testCase.matrix);
        
        // Test the move
        const result = this.game.testMove(testCase.row1, testCase.col1, testCase.row2, testCase.col2);
        
        // Jest assertions
        if (testCase.expected) {
            expect(result).toBeValidMove();
            if (testCase.expectedPattern) {
                expect(result).toHavePattern(testCase.expectedPattern);
            }
        } else {
            expect(result.valid).toBe(false);
            if (testCase.expectedError) {
                expect(result.error).toContain(testCase.expectedError);
            }
        }
    }

    /**
     * Assert that a move is valid with specific pattern
     * @param {number[][]} matrix - Board matrix
     * @param {number} row1 - First card row
     * @param {number} col1 - First card column
     * @param {number} row2 - Second card row
     * @param {number} col2 - Second card column
     * @param {string} expectedPattern - Expected pattern type
     */
    assertValidMove(matrix, row1, col1, row2, col2, expectedPattern) {
        this.game.loadBoardFromMatrix(matrix);
        const result = this.game.testMove(row1, col1, row2, col2);
        
        if (!result.valid) {
            throw new Error(`Expected valid move but got: ${result.error}`);
        }
        
        if (expectedPattern && result.details.pattern !== expectedPattern) {
            throw new Error(`Expected pattern ${expectedPattern} but got ${result.details.pattern}`);
        }
    }

    /**
     * Assert that a move is invalid
     * @param {number[][]} matrix - Board matrix
     * @param {number} row1 - First card row
     * @param {number} col1 - First card column
     * @param {number} row2 - Second card row
     * @param {number} col2 - Second card column
     * @param {string} expectedError - Expected error message (optional)
     */
    assertInvalidMove(matrix, row1, col1, row2, col2, expectedError = null) {
        this.game.loadBoardFromMatrix(matrix);
        const result = this.game.testMove(row1, col1, row2, col2);
        
        if (result.valid) {
            throw new Error(`Expected invalid move but got valid move with pattern: ${result.details.pattern}`);
        }
        
        if (expectedError && !result.error.includes(expectedError)) {
            throw new Error(`Expected error containing "${expectedError}" but got: ${result.error}`);
        }
    }

    /**
     * Print board matrix for debugging
     * @param {number[][]} matrix - Board matrix
     */
    printBoard(matrix) {
        console.log('\nBoard state:');
        console.log('   ', Array.from({length: this.game.matrixWidth}, (_, i) => i.toString().padStart(2)).join(' '));
        
        for (let row = 0; row < this.game.matrixHeight; row++) {
            const rowStr = matrix[row].map(cell => cell.toString().padStart(2)).join(' ');
            console.log(`${row.toString().padStart(2)}: ${rowStr}`);
        }
        console.log();
    }
}