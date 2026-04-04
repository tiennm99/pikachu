import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('Z-Pattern Tests', () => {
    let tester;

    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Basic Z-Shapes', () => {
        test('should connect cards through two turns', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 3, 2);
            tester.placeCard(matrix, 3, 1, 2);

            const testCase = tester.createTestCase(
                'Basic Z-pattern with two turns',
                matrix,
                1, 1, 3, 3,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should find path with distant cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 5, 5, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 5, 2);
            tester.placeCard(matrix, 5, 1, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with distant cards',
                matrix,
                1, 1, 5, 5,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should work with connecting column between cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 2, 4, 2);
            tester.placeCard(matrix, 4, 2, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with connecting column',
                matrix,
                2, 2, 4, 4,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Blocked Scenarios', () => {
        test('should fail when no path is available', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);

            // Block all possible paths
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 1 && col === 1) || (row === 3 && col === 3))) {
                        tester.placeCard(matrix, row, col, 2);
                    }
                }
            }

            const testCase = tester.createTestCase(
                'Z-pattern blocked - no path available',
                matrix,
                1, 1, 3, 3,
                false
            );

            tester.expectTestCase(testCase);
        });

        test('should fail when all connecting columns and rows are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);

            // Block paths to potential connecting points
            tester.placeCard(matrix, 1, 2, 2);
            tester.placeCard(matrix, 2, 1, 2);
            tester.placeCard(matrix, 2, 3, 2);
            tester.placeCard(matrix, 3, 2, 2);

            const testCase = tester.createTestCase(
                'Z-pattern blocked - connecting paths blocked',
                matrix,
                1, 1, 3, 3,
                false
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Board Edge Cases', () => {
        test('should handle Z-pattern at board edges', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 20, 2);
            tester.placeCard(matrix, 8, 1, 2);

            const testCase = tester.createTestCase(
                'Z-pattern at board edges',
                matrix,
                1, 1, 8, 20,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle Z-pattern with same-row cards and blocker', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 2, 1);
            tester.placeCard(matrix, 1, 8, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 1, 5, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with same-row cards',
                matrix,
                1, 2, 1, 8,
                true
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Complex Connecting Points', () => {
        test('should use specific connecting column', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 6, 6, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 2, 6, 2);
            tester.placeCard(matrix, 6, 2, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with specific connecting column',
                matrix,
                2, 2, 6, 6,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should work in dense board with limited paths', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 5, 5, 1);

            // Fill most of the board but leave a Z-pattern corridor through col 3:
            // (2,2) -> (2,3) -> (5,3) -> (5,5)
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 2 && col === 2) || (row === 5 && col === 5) ||
                          (row === 2 && col === 3) || (row === 5 && col === 3) ||
                          (row === 3 && col === 3) || (row === 4 && col === 3) ||
                          (row === 5 && col === 4))) {
                        tester.placeCard(matrix, row, col, 2);
                    }
                }
            }

            const testCase = tester.createTestCase(
                'Z-pattern in dense board',
                matrix,
                2, 2, 5, 5,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Same Row/Column Scenarios', () => {
        test('should handle Z-pattern with cards in same row', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 4, 1, 1);
            tester.placeCard(matrix, 4, 10, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 4, 5, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with cards in same row',
                matrix,
                4, 1, 4, 10,
                true
            );

            tester.expectTestCase(testCase);
        });

        test('should handle Z-pattern with cards in same column', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 5, 1);
            tester.placeCard(matrix, 6, 5, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 3, 5, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with cards in same column',
                matrix,
                1, 5, 6, 5,
                true
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Pattern Priority', () => {
        test('should prefer I-pattern over Z-pattern when possible', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 5, 1);

            const testCase = tester.createTestCase(
                'Should prefer I-pattern over Z-pattern',
                matrix,
                1, 1, 1, 5,
                true,
                'I-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should prefer L-pattern over Z-pattern when possible', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);

            const testCase = tester.createTestCase(
                'Should prefer L-pattern over Z-pattern',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should use Z-pattern when simpler patterns are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 3, 2);
            tester.placeCard(matrix, 3, 1, 2);

            const testCase = tester.createTestCase(
                'Should use Z-pattern when L-pattern blocked',
                matrix,
                1, 1, 3, 3,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Multiple Turn Scenarios', () => {
        test('should handle Z-pattern with two distinct turns', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 5, 7, 1);
            // Block L-pattern paths
            tester.placeCard(matrix, 1, 7, 2);
            tester.placeCard(matrix, 5, 1, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with two distinct turns',
                matrix,
                1, 1, 5, 7,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle Z-pattern across full board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 20, 2);
            tester.placeCard(matrix, 8, 1, 2);

            const testCase = tester.createTestCase(
                'Z-pattern across full board',
                matrix,
                1, 1, 8, 20,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });

    describe('Asymmetric Cases', () => {
        test('should handle asymmetric Z-pattern', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 3, 1);
            tester.placeCard(matrix, 6, 8, 1);
            // Block L-pattern
            tester.placeCard(matrix, 2, 8, 2);
            tester.placeCard(matrix, 6, 3, 2);

            const testCase = tester.createTestCase(
                'Asymmetric Z-pattern',
                matrix,
                2, 3, 6, 8,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });

        test('should handle Z-pattern with varying distances', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 5, 1);
            tester.placeCard(matrix, 7, 15, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 15, 2);
            tester.placeCard(matrix, 7, 5, 2);

            const testCase = tester.createTestCase(
                'Z-pattern with varying distances',
                matrix,
                1, 5, 7, 15,
                true,
                'Z-pattern'
            );

            tester.expectTestCase(testCase);
        });
    });
});
