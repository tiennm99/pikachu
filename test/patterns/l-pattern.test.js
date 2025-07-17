import { PikachuBaseTest } from '../base/PikachuBaseTest.js';

describe('L-Pattern Tests', () => {
    let tester;
    
    beforeEach(() => {
        tester = new PikachuBaseTest();
    });

    describe('Basic L-Shapes', () => {
        test('should connect cards with L-shape via first corner', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-shape via first corner',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should connect cards with L-shape via second corner', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 3, 1);
            tester.placeCard(matrix, 3, 1, 1);
            
            const testCase = tester.createTestCase(
                'L-shape via second corner',
                matrix,
                1, 3, 3, 1,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should work when one corner is blocked but other is clear', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 2); // block first corner
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-shape with one corner blocked',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should fail when both corners are blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 2); // block first corner
            tester.placeCard(matrix, 3, 1, 2); // block second corner
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-shape with both corners blocked',
                matrix,
                1, 1, 3, 3,
                false
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Path Blocking', () => {
        test('should fail when path to corner is blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 2, 2); // block horizontal path
            tester.placeCard(matrix, 2, 1, 2); // block vertical path
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-shape with blocked paths to corners',
                matrix,
                1, 1, 3, 3,
                false
            );
            
            tester.expectTestCase(testCase);
        });

        test('should work when only one path is blocked', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 2, 2); // block horizontal path to first corner
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'L-shape with one path blocked',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Right Angle Turns', () => {
        test('should handle up-then-right turn', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 4, 1, 1);
            tester.placeCard(matrix, 1, 4, 1);
            
            const testCase = tester.createTestCase(
                'Up-then-right turn',
                matrix,
                4, 1, 1, 4,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle down-then-left turn', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 4, 1);
            tester.placeCard(matrix, 4, 1, 1);
            
            const testCase = tester.createTestCase(
                'Down-then-left turn',
                matrix,
                1, 4, 4, 1,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle left-then-up turn', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 3, 5, 1);
            tester.placeCard(matrix, 1, 2, 1);
            
            const testCase = tester.createTestCase(
                'Left-then-up turn',
                matrix,
                3, 5, 1, 2,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle right-then-down turn', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 2, 1);
            tester.placeCard(matrix, 3, 5, 1);
            
            const testCase = tester.createTestCase(
                'Right-then-down turn',
                matrix,
                1, 2, 3, 5,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Board Edges', () => {
        test('should handle L-shape at board edges', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);  // top-left corner
            tester.placeCard(matrix, 8, 20, 1); // bottom-right corner
            
            const testCase = tester.createTestCase(
                'L-shape at board edges',
                matrix,
                1, 1, 8, 20,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle L-shape along board boundary', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);  // top-left
            tester.placeCard(matrix, 1, 20, 1); // top-right
            
            // This should be I-pattern, not L-pattern
            const testCase = tester.createTestCase(
                'Straight line at board boundary',
                matrix,
                1, 1, 1, 20,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Complex Scenarios', () => {
        test('should handle L-shape with multiple blocking cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 2, 2, 2); // blocking card
            tester.placeCard(matrix, 3, 3, 2); // blocking card
            tester.placeCard(matrix, 5, 5, 1);
            
            const testCase = tester.createTestCase(
                'L-shape with multiple blocking cards',
                matrix,
                1, 1, 5, 5,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle L-shape in dense board', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 2, 2, 1);
            tester.placeCard(matrix, 4, 4, 1);
            
            // Fill some positions but leave L-path open
            tester.placeCard(matrix, 3, 3, 2);
            tester.placeCard(matrix, 1, 1, 2);
            tester.placeCard(matrix, 5, 5, 2);
            
            const testCase = tester.createTestCase(
                'L-shape in dense board',
                matrix,
                2, 2, 4, 4,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Adjacent Cards', () => {
        test('should prefer I-pattern over L-pattern for adjacent cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 2, 1);
            
            const testCase = tester.createTestCase(
                'Adjacent cards should use I-pattern',
                matrix,
                1, 1, 1, 2,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should prefer I-pattern for straight line connections', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 10, 1);
            
            const testCase = tester.createTestCase(
                'Straight line should use I-pattern',
                matrix,
                1, 1, 1, 10,
                true,
                'I-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });

    describe('Corner Positioning', () => {
        test('should handle corner at exact middle position', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 3, 3, 1);
            
            const testCase = tester.createTestCase(
                'Corner at middle position',
                matrix,
                1, 1, 3, 3,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });

        test('should handle asymmetric L-shape', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 6, 10, 1);
            
            const testCase = tester.createTestCase(
                'Asymmetric L-shape',
                matrix,
                1, 1, 6, 10,
                true,
                'L-pattern'
            );
            
            tester.expectTestCase(testCase);
        });
    });
});