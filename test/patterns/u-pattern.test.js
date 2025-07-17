import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('U-Pattern Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Border Extensions', () => {
        test('should connect cards by extending right beyond board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 5, 1);
            tester.placeCard(matrix, 3, 5, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 2, 5, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern extending right',
                matrix,
                1, 5, 3, 5,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should connect cards by extending left beyond board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 15, 1);
            tester.placeCard(matrix, 3, 15, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 2, 15, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern extending left',
                matrix,
                1, 15, 3, 15,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should connect cards by extending down beyond board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 1, 2, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern extending down',
                matrix,
                1, 1, 1, 3,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should connect cards by extending up beyond board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 8, 1, 1);
            tester.placeCard(matrix, 8, 3, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 8, 2, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern extending up',
                matrix,
                8, 1, 8, 3,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Corner Positions', () => {
        test('should handle U-pattern at board corners', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 1, 2, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern at top-left corner',
                matrix,
                1, 1, 1, 3,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle U-pattern at opposite board corners', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            
            const testCase = tester.createTestCase(
                'U-pattern at opposite corners',
                matrix,
                1, 1, 8, 20,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle U-pattern along board edges', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 20, 1);
            tester.placeCard(matrix, 8, 20, 1);
            
            const testCase = tester.createTestCase(
                'U-pattern along right edge',
                matrix,
                1, 20, 8, 20,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Blocked Paths', () => {
        test('should work with simple blocking card', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 5, 1);
            tester.placeCard(matrix, 6, 5, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 3, 5, 2);
            tester.placeCard(matrix, 4, 5, 2);
            tester.placeCard(matrix, 5, 5, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern with multiple blocking cards',
                matrix,
                2, 5, 6, 5,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should fail when extension path is blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            
            // Block all possible extension paths
            for (let i = 1; i <= 20; i++) {
                if (i !== 2 && i !== 4) {
                    tester.placeCard(matrix, 2, i, 2);
                    tester.placeCard(matrix, 4, i, 2);
                }
            }
            for (let i = 1; i <= 8; i++) {
                if (i !== 2 && i !== 4) {
                    tester.placeCard(matrix, i, 2, 2);
                    tester.placeCard(matrix, i, 4, 2);
                }
            }
            
            const testCase = tester.createTestCase(
                'U-pattern impossible - all paths blocked',
                matrix,
                2, 2, 4, 4,
                false
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Extension Directions', () => {
        test('should handle horizontal extension to right', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 2, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 3, 2, 2);
            
            const testCase = tester.createTestCase(
                'Horizontal extension to right',
                matrix,
                2, 2, 4, 2,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle horizontal extension to left', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 18, 1);
            tester.placeCard(matrix, 4, 18, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 3, 18, 2);
            
            const testCase = tester.createTestCase(
                'Horizontal extension to left',
                matrix,
                2, 18, 4, 18,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle vertical extension upward', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 6, 2, 1);
            tester.placeCard(matrix, 6, 4, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 6, 3, 2);
            
            const testCase = tester.createTestCase(
                'Vertical extension upward',
                matrix,
                6, 2, 6, 4,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle vertical extension downward', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 2, 4, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 2, 3, 2);
            
            const testCase = tester.createTestCase(
                'Vertical extension downward',
                matrix,
                2, 2, 2, 4,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Long Distance Connections', () => {
        test('should handle long distance U-pattern', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            
            const testCase = tester.createTestCase(
                'Long distance U-pattern',
                matrix,
                1, 1, 8, 20,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle U-pattern across full board width', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 4, 1, 1);
            tester.placeCard(matrix, 4, 20, 1);
            
            const testCase = tester.createTestCase(
                'U-pattern across full board width',
                matrix,
                4, 1, 4, 20,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle U-pattern across full board height', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 10, 1);
            tester.placeCard(matrix, 8, 10, 1);
            
            const testCase = tester.createTestCase(
                'U-pattern across full board height',
                matrix,
                1, 10, 8, 10,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Pattern Priority', () => {
        test('should prefer I-pattern over U-pattern when possible', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 5, 1);
            
            const testCase = tester.createTestCase(
                'Should prefer I-pattern',
                matrix,
                1, 1, 1, 5,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should prefer L-pattern over U-pattern when possible', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'Should prefer L-pattern',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should use U-pattern when simpler patterns are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 2, 4, 2);
            tester.placeCard(matrix, 4, 2, 2);
            
            const testCase = tester.createTestCase(
                'Should use U-pattern when L-pattern blocked',
                matrix,
                2, 2, 4, 4,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });
});