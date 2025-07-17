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
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 1, 3, 2); // blocking card
            tester.placeCard(matrix, 1, 5, 1);
            
            const testCase = tester.createTestCase(
                'Horizontal line - blocked path',
                matrix,
                1, 1, 1, 5,
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
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 2, 1, 2); // blocking card
            tester.placeCard(matrix, 4, 1, 1);
            
            const testCase = tester.createTestCase(
                'Vertical line - blocked path',
                matrix,
                1, 1, 4, 1,
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
        test('should not connect diagonal cards', () => {
            const matrix = tester.createEmptyMatrix();
            tester.placeCard(matrix, 1, 1, 1);
            tester.placeCard(matrix, 2, 2, 1);
            
            const testCase = tester.createTestCase(
                'Diagonal - should not work',
                matrix,
                1, 1, 2, 2,
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