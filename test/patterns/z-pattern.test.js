import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('Z-Pattern Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Basic Z-Shapes', () => {
        test('should connect cards through intermediate point', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            // Block L-pattern possibilities
            tester.placeCard(matrix, 1, 3, 2);
            tester.placeCard(matrix, 3, 1, 2);
            
            const testCase = tester.createTestCase(
                'Basic Z-pattern with intermediate point',
                matrix,
                1, 1, 3, 3,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should find multiple possible intermediate points', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 5, 5, 1);
            // Block L-pattern possibilities
            tester.placeCard(matrix, 1, 5, 2);
            tester.placeCard(matrix, 5, 1, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern with multiple intermediate points',
                matrix,
                1, 1, 5, 5,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should work with intermediate point at border', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            // Block L-pattern possibilities
            tester.placeCard(matrix, 2, 4, 2);
            tester.placeCard(matrix, 4, 2, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern with border intermediate point',
                matrix,
                2, 2, 4, 4,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Blocked Scenarios', () => {
        test('should fail when no intermediate point is available', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            // Block all possible intermediate points
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 1 && col === 1) || (row === 3 && col === 3))) {
                        tester.placeCard(matrix, row, col, 2);
                    }
                }
            }
            
            const testCase = tester.createTestCase(
                'Z-pattern blocked - no intermediate point',
                matrix,
                1, 1, 3, 3,
                false
            );
            
            tester.expectTestCase(testCase);
        });

        test('should fail when paths to intermediate point are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            // Block paths to potential intermediate points
            tester.placeCard(matrix, 1, 2, 2);
            tester.placeCard(matrix, 2, 1, 2);
            tester.placeCard(matrix, 2, 3, 2);
            tester.placeCard(matrix, 3, 2, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern blocked - paths to intermediate blocked',
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
            // Block simpler patterns
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

        test('should handle Z-pattern along board boundaries', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 2, 1);
            tester.placeCard(matrix, 1, 8, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 1, 5, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern along board boundary',
                matrix,
                1, 2, 1, 8,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Complex Intermediate Points', () => {
        test('should use specific intermediate point', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 6, 6, 1);
            // Block L-pattern possibilities
            tester.placeCard(matrix, 2, 6, 2);
            tester.placeCard(matrix, 6, 2, 2);
            // Ensure intermediate point at (4,4) is available
            
            const testCase = tester.createTestCase(
                'Z-pattern with specific intermediate point',
                matrix,
                2, 2, 6, 6,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should work in dense board with limited intermediate points', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 4, 4, 1);
            
            // Fill most of the board but leave some Z-pattern paths
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 1 && col === 1) || (row === 4 && col === 4) || 
                          (row === 1 && col === 4) || (row === 4 && col === 1) ||
                          (row === 2 && col === 2) || (row === 3 && col === 3))) {
                        tester.placeCard(matrix, row, col, 2);
                    }
                }
            }
            
            const testCase = tester.createTestCase(
                'Z-pattern in dense board',
                matrix,
                1, 1, 4, 4,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Same Row/Column Scenarios', () => {
        test('should handle Z-pattern with cards in same row', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 10, 1);
            // Block direct horizontal path
            tester.placeCard(matrix, 1, 5, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern with cards in same row',
                matrix,
                1, 1, 1, 10,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle Z-pattern with cards in same column', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 6, 1, 1);
            // Block direct vertical path
            tester.placeCard(matrix, 3, 1, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern with cards in same column',
                matrix,
                1, 1, 6, 1,
                true,
                'Z-pattern'
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
            // Block I-pattern (not applicable)
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

        test('should handle Z-pattern with intermediate point far from both cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            // Block other patterns by placing strategic obstacles
            tester.placeCard(matrix, 1, 20, 2);
            tester.placeCard(matrix, 8, 1, 2);
            
            const testCase = tester.createTestCase(
                'Z-pattern with distant intermediate point',
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
            // Block other patterns
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