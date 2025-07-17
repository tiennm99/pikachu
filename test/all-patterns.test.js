import { PikachuBaseTest } from './base/PikachuBaseTest.js';

describe('All Patterns Integration Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Pattern Priority', () => {
        test('should prefer I-pattern over all other patterns', () => {
            // Simple horizontal line should use I-pattern
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 5, 1);
            
            const testCase = tester.createTestCase(
                'I-pattern priority',
                matrix,
                1, 1, 1, 5,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should prefer L-pattern over U and Z patterns', () => {
            // Simple L-shape should use L-pattern
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-pattern priority',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should use U-pattern when I and L patterns are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            // Block L-pattern corners
            tester.placeCard(matrix, 1, 3, 2);
            tester.placeCard(matrix, 3, 1, 2);
            
            const testCase = tester.createTestCase(
                'U-pattern when simpler patterns blocked',
                matrix,
                1, 1, 3, 3,
                true,
                'U-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should use Z-pattern as last resort', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            // Block L-pattern
            tester.placeCard(matrix, 2, 4, 2);
            tester.placeCard(matrix, 4, 2, 2);
            // Block U-pattern by filling border extensions
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
                'Z-pattern as last resort',
                matrix,
                2, 2, 4, 4,
                true,
                'Z-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Edge Cases Across All Patterns', () => {
        test('should handle same card type requirement across all patterns', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 5, 2); // different type
            
            const testCase = tester.createTestCase(
                'Different card types should fail',
                matrix,
                1, 1, 1, 5,
                false,
                null,
                'Cards are different types'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle empty positions across all patterns', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            // No card at (1, 5)
            
            const testCase = tester.createTestCase(
                'Empty positions should fail',
                matrix,
                1, 1, 1, 5,
                false,
                null,
                'One or both positions are empty'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle same position selection', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            
            const testCase = tester.createTestCase(
                'Same position should fail',
                matrix,
                1, 1, 1, 1,
                false,
                null,
                'Cannot select the same position'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle out of bounds positions', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            
            tester.game.loadBoardFromMatrix(matrix);
            const result = tester.game.testMove(1, 1, 0, 0); // Out of bounds
            
            expect(result.valid).toBe(false);
            expect(result.error).toContain('out of bounds');
        });
    });

    describe('Complex Board Scenarios', () => {
        test('should handle multiple valid patterns and choose the simplest', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 1);
            
            // Both I-pattern and L-pattern are possible, should choose I-pattern
            const testCase = tester.createTestCase(
                'Multiple valid patterns - choose simplest',
                matrix,
                1, 1, 1, 3,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle dense board with limited connection options', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            
            // Fill most positions but leave some paths open
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 1 && col === 1) || (row === 8 && col === 20))) {
                        // Leave some strategic positions empty for connection
                        if (!(row === 1 && col === 20) && !(row === 8 && col === 1) && 
                            !(row === 4 && col === 10)) {
                            tester.placeCard(matrix, row, col, 2);
                        }
                    }
                }
            }
            
            const testCase = tester.createTestCase(
                'Dense board with limited options',
                matrix,
                1, 1, 8, 20,
                true // Should find some pattern
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle impossible connections', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 8, 20, 1);
            
            // Block all possible connection paths
            for (let row = 1; row <= 8; row++) {
                for (let col = 1; col <= 20; col++) {
                    if (!((row === 1 && col === 1) || (row === 8 && col === 20))) {
                        tester.placeCard(matrix, row, col, 2);
                    }
                }
            }
            
            const testCase = tester.createTestCase(
                'Impossible connections should fail',
                matrix,
                1, 1, 8, 20,
                false
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Board Boundary Handling', () => {
        test('should handle cards at all four corners', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);    // top-left
            tester.placeCard(matrix, 1, 20, 1);   // top-right
            tester.placeCard(matrix, 8, 1, 1);    // bottom-left
            tester.placeCard(matrix, 8, 20, 1);   // bottom-right
            
            // Test all corner-to-corner connections
            const testCases = [
                [1, 1, 1, 20],   // top-left to top-right
                [1, 1, 8, 1],    // top-left to bottom-left
                [1, 1, 8, 20],   // top-left to bottom-right
                [1, 20, 8, 20],  // top-right to bottom-right
                [8, 1, 8, 20],   // bottom-left to bottom-right
                [1, 20, 8, 1]    // top-right to bottom-left
            ];
            
            testCases.forEach(([r1, c1, r2, c2]) => {
                const testCase = tester.createTestCase(
                    `Corner connection (${r1},${c1}) to (${r2},${c2})`,
                    matrix,
                    r1, c1, r2, c2,
                    true
                );
                
                tester.expectTestCase(testCase);
            });
        });

        test('should handle cards along board edges', () => {
            const matrix = tester.createEmptyMatrix();
            // Place cards along top edge
            tester.placeCard(matrix, 1, 5, 1);
            tester.placeCard(matrix, 1, 15, 1);
            
            const testCase = tester.createTestCase(
                'Cards along board edge',
                matrix,
                1, 5, 1, 15,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Pattern Interaction', () => {
        test('should handle scenario where multiple patterns could work', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            
            // This could potentially work with L, U, or Z patterns
            // Should prefer L-pattern as it's simpler
            const testCase = tester.createTestCase(
                'Multiple pattern possibilities',
                matrix,
                2, 2, 4, 4,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle cascading pattern fallbacks', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 6, 6, 1);
            
            // Block L-pattern
            tester.placeCard(matrix, 2, 6, 2);
            tester.placeCard(matrix, 6, 2, 2);
            
            // Should fall back to U-pattern or Z-pattern
            const testCase = tester.createTestCase(
                'Cascading pattern fallbacks',
                matrix,
                2, 2, 6, 6,
                true
            );
            
            tester.expectTestCase(testCase);
        });
    });
});