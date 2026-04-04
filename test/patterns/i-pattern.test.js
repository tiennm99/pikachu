import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('I-Pattern Tests', () => {
    let tester;

    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Horizontal Lines', () => {
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

        test('should not connect cards with blocked horizontal path', () => {
            const matrix = tester.createEmptyMatrix();
            // Fill entire board so no alternative patterns can route around
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    tester.placeCard(matrix, row, col, 2);
                }
            }
            // Place target cards in the middle (away from border)
            tester.placeCard(matrix, 4, 5, 1);
            tester.placeCard(matrix, 4, 7, 1);
            // (4,6) remains as blocker type 2

            const testCase = tester.createTestCase(
                'Horizontal line - blocked path',
                matrix,
                4, 5, 4, 7,
                false
            );

            tester.expectTestCase(testCase);
        });

        test('should connect adjacent horizontal cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 2, 1);

            const testCase = tester.createTestCase(
                'Adjacent cards - horizontal',
                matrix,
                1, 1, 1, 2,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle long horizontal lines', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 20, 1);

            const testCase = tester.createTestCase(
                'Long horizontal line',
                matrix,
                1, 1, 1, 20,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Vertical Lines', () => {
        test('should connect cards with clear vertical path', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 4, 1, 1);

            const testCase = tester.createTestCase(
                'Vertical line - clear path',
                matrix,
                1, 1, 4, 1,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should not connect cards with blocked vertical path', () => {
            const matrix = tester.createEmptyMatrix();
            // Fill entire board so no alternative patterns can route around
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    tester.placeCard(matrix, row, col, 2);
                }
            }
            // Place target cards in the middle
            tester.placeCard(matrix, 3, 10, 1);
            tester.placeCard(matrix, 5, 10, 1);
            // (4,10) remains as blocker type 2

            const testCase = tester.createTestCase(
                'Vertical line - blocked path',
                matrix,
                3, 10, 5, 10,
                false
            );

            tester.expectTestCase(testCase);
        });

        test('should connect adjacent vertical cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 2, 1, 1);

            const testCase = tester.createTestCase(
                'Adjacent cards - vertical',
                matrix,
                1, 1, 2, 1,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle long vertical lines', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 1, 1);

            const testCase = tester.createTestCase(
                'Long vertical line',
                matrix,
                1, 1, 8, 1,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Edge Cases', () => {
        test('should not connect diagonal cards when all paths blocked', () => {
            const matrix = tester.createEmptyMatrix();
            // Fill entire board to block all patterns
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    tester.placeCard(matrix, row, col, 2);
                }
            }
            tester.placeCard(matrix, 4, 10, 1);
            tester.placeCard(matrix, 5, 11, 1);

            const testCase = tester.createTestCase(
                'Diagonal - should not work when all paths blocked',
                matrix,
                4, 10, 5, 11,
                false
            );

            tester.expectTestCase(testCase);
        });

        test('should not connect same position', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);

            const testCase = tester.createTestCase(
                'Same position - should fail',
                matrix,
                1, 1, 1, 1,
                false,
                null,
                'Cannot select the same position'
            );

            tester.expectTestCase(testCase);
        });

        test('should not connect different card types', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 5, 2); // different card type

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

        test('should not connect empty positions', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            // Don't place card at (1,5)

            const testCase = tester.createTestCase(
                'Empty position',
                matrix,
                1, 1, 1, 5,
                false,
                null,
                'One or both positions are empty'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Board Boundaries', () => {
        test('should handle cards at board edges', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);  // top-left corner
            tester.placeCard(matrix, 1, 20, 1); // top-right corner

            const testCase = tester.createTestCase(
                'Cards at board edges',
                matrix,
                1, 1, 1, 20,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle cards at opposite corners', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);  // top-left
            tester.placeCard(matrix, 8, 1, 1);  // bottom-left

            const testCase = tester.createTestCase(
                'Cards at opposite corners',
                matrix,
                1, 1, 8, 1,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });
});
