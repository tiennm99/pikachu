/**
 * Pikachu Game Logic - Extracted from PikachuGame scene for testing
 * Contains all the pattern matching logic without Phaser dependencies
 */
export class PikachuGameLogic {
    constructor(boardWidth = 20, boardHeight = 8) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.matrixWidth = boardWidth + 2;
        this.matrixHeight = boardHeight + 2;
        this.board = [];
    }

    /**
     * Load board state from a matrix
     * @param {number[][]} matrix - 2D array representing the board state
     */
    loadBoardFromMatrix(matrix) {
        if (matrix.length !== this.matrixHeight || matrix[0].length !== this.matrixWidth) {
            throw new Error(`Matrix dimensions must be ${this.matrixHeight}x${this.matrixWidth} (including border)`);
        }

        this.board = [];
        for (let row = 0; row < this.matrixHeight; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.matrixWidth; col++) {
                this.board[row][col] = {
                    type: matrix[row][col],
                    visible: matrix[row][col] !== 0 && row > 0 && row < this.matrixHeight - 1 && col > 0 && col < this.matrixWidth - 1,
                    row: row,
                    col: col
                };
            }
        }
    }

    /**
     * Test if a move between two positions is valid
     * @param {number} row1 - Matrix row of first position (1-indexed for game board)
     * @param {number} col1 - Matrix column of first position (1-indexed for game board)
     * @param {number} row2 - Matrix row of second position (1-indexed for game board)
     * @param {number} col2 - Matrix column of second position (1-indexed for game board)
     * @returns {Object} Test result with detailed information
     */
    testMove(row1, col1, row2, col2) {
        const pos1 = {row: row1, col: col1};
        const pos2 = {row: row2, col: col2};
        
        // Validate positions
        if (row1 < 1 || row1 > this.boardHeight || col1 < 1 || col1 > this.boardWidth ||
            row2 < 1 || row2 > this.boardHeight || col2 < 1 || col2 > this.boardWidth) {
            return {
                valid: false,
                error: "Position out of bounds. Use 1-indexed coordinates for game board.",
                details: null
            };
        }

        const cell1 = this.board[row1][col1];
        const cell2 = this.board[row2][col2];

        // Check if both positions have cards
        if (cell1.type === 0 || cell2.type === 0) {
            return {
                valid: false,
                error: "One or both positions are empty",
                details: {
                    pos1: {row: row1, col: col1, type: cell1.type},
                    pos2: {row: row2, col: col2, type: cell2.type}
                }
            };
        }

        // Check if cards are the same type
        if (cell1.type !== cell2.type) {
            return {
                valid: false,
                error: "Cards are different types",
                details: {
                    pos1: {row: row1, col: col1, type: cell1.type},
                    pos2: {row: row2, col: col2, type: cell2.type}
                }
            };
        }

        // Check if positions are the same
        if (row1 === row2 && col1 === col2) {
            return {
                valid: false,
                error: "Cannot select the same position twice",
                details: {
                    pos1: {row: row1, col: col1, type: cell1.type},
                    pos2: {row: row2, col: col2, type: cell2.type}
                }
            };
        }

        // Test each pattern and get detailed results
        const pathResult = this.hasValidPathWithDebug(pos1, pos2);
        let patternType = "none";
        let pathDetails = null;

        if (pathResult.valid) {
            // Determine which pattern was used
            if (this.checkIPatternWithPath(pos1, pos2)) {
                patternType = "I-pattern";
                pathDetails = this.checkIPatternWithPath(pos1, pos2);
            } else if (this.checkLPatternWithPath(pos1, pos2)) {
                patternType = "L-pattern";
                pathDetails = this.checkLPatternWithPath(pos1, pos2);
            } else if (this.checkUPatternWithPath(pos1, pos2)) {
                patternType = "U-pattern";
                pathDetails = this.checkUPatternWithPath(pos1, pos2);
            } else if (this.checkZPatternWithPath(pos1, pos2)) {
                patternType = "Z-pattern";
                pathDetails = this.checkZPatternWithPath(pos1, pos2);
            }
        }

        return {
            valid: pathResult.valid,
            error: pathResult.valid ? null : "No valid path found",
            details: {
                pos1: {row: row1, col: col1, type: cell1.type},
                pos2: {row: row2, col: col2, type: cell2.type},
                pattern: patternType,
                path: pathDetails
            }
        };
    }

    // ===== PATTERN CHECKING METHODS =====

    hasValidPath(start, end) {
        if (this.checkIPattern(start, end)) return true;
        if (this.checkLPattern(start, end)) return true;
        if (this.checkUPattern(start, end)) return true;
        if (this.checkZPattern(start, end)) return true;
        return false;
    }

    hasValidPathWithDebug(start, end) {
        const iPath = this.checkIPatternWithPath(start, end);
        if (iPath) return { valid: true, path: iPath };

        const lPath = this.checkLPatternWithPath(start, end);
        if (lPath) return { valid: true, path: lPath };

        const uPath = this.checkUPatternWithPath(start, end);
        if (uPath) return { valid: true, path: uPath };

        const zPath = this.checkZPatternWithPath(start, end);
        if (zPath) return { valid: true, path: zPath };

        return { valid: false, path: null };
    }

    checkIPattern(start, end) {
        // Horizontal line
        if (start.row === end.row) {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[start.row][col].type !== 0) return false;
            }
            return true;
        }

        // Vertical line
        if (start.col === end.col) {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][start.col].type !== 0) return false;
            }
            return true;
        }

        return false;
    }

    checkLineX(y1, y2, x) {
        const min = Math.min(y1, y2);
        const max = Math.max(y1, y2);
        
        for (let y = min + 1; y < max; y++) {
            if (this.board[x][y].type !== 0) {
                return false;
            }
        }
        return true;
    }

    checkLineY(x1, x2, y) {
        const min = Math.min(x1, x2);
        const max = Math.max(x1, x2);
        
        for (let x = min + 1; x < max; x++) {
            if (this.board[x][y].type !== 0) {
                return false;
            }
        }
        return true;
    }

    checkLPattern(start, end) {
        // Try corner at start.row, end.col
        if (this.isPathClear(start, {row: start.row, col: end.col}) &&
            this.isPathClear({row: start.row, col: end.col}, end) &&
            this.board[start.row][end.col].type === 0) {
            return true;
        }

        // Try corner at end.row, start.col
        if (this.isPathClear(start, {row: end.row, col: start.col}) &&
            this.isPathClear({row: end.row, col: start.col}, end) &&
            this.board[end.row][start.col].type === 0) {
            return true;
        }

        return false;
    }

    checkUPattern(start, end) {
        // Check more right
        if (this.checkMoreLineX(start, end, 1)) return true;
        // Check more left
        if (this.checkMoreLineX(start, end, -1)) return true;
        // Check more down
        if (this.checkMoreLineY(start, end, 1)) return true;
        // Check more up
        if (this.checkMoreLineY(start, end, -1)) return true;
        
        return false;
    }

    checkMoreLineX(start, end, type) {
        const pMinY = start.col < end.col ? start : end;
        const pMaxY = start.col < end.col ? end : start;
        
        let y = pMaxY.col + type;
        let row = pMinY.row;
        let colFinish = pMaxY.col;
        
        if (type === -1) {
            colFinish = pMinY.col;
            y = pMinY.col + type;
            row = pMaxY.row;
        }

        if ((this.board[row][colFinish].type === 0 || pMinY.col === pMaxY.col) &&
            this.checkLineX(pMinY.col, pMaxY.col, row)) {
            
            while (y >= 0 && y < this.matrixWidth && 
                   this.board[pMinY.row][y].type === 0 && 
                   this.board[pMaxY.row][y].type === 0) {
                
                if (this.checkLineY(pMinY.row, pMaxY.row, y)) {
                    return true;
                }
                y += type;
            }
        }
        return false;
    }

    checkMoreLineY(start, end, type) {
        const pMinX = start.row < end.row ? start : end;
        const pMaxX = start.row < end.row ? end : start;
        
        let x = pMaxX.row + type;
        let col = pMinX.col;
        let rowFinish = pMaxX.row;
        
        if (type === -1) {
            rowFinish = pMinX.row;
            x = pMinX.row + type;
            col = pMaxX.col;
        }

        if ((this.board[rowFinish][col].type === 0 || pMinX.row === pMaxX.row) &&
            this.checkLineY(pMinX.row, pMaxX.row, col)) {
            
            while (x >= 0 && x < this.matrixHeight && 
                   this.board[x][pMinX.col].type === 0 && 
                   this.board[x][pMaxX.col].type === 0) {
                
                if (this.checkLineX(pMinX.col, pMaxX.col, x)) {
                    return true;
                }
                x += type;
            }
        }
        return false;
    }

    checkZPattern(start, end) {
        for (let row = 0; row < this.matrixHeight; row++) {
            for (let col = 0; col < this.matrixWidth; col++) {
                if (this.board[row][col].type !== 0) continue;

                const midPoint = {row, col};
                if (this.isPathClear(start, midPoint) && this.isPathClear(midPoint, end)) {
                    return true;
                }
            }
        }
        return false;
    }

    isPathClear(start, end) {
        if (start.row === end.row && start.col === end.col) return true;

        // Horizontal path
        if (start.row === end.row) {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[start.row][col].type !== 0) return false;
            }
            return true;
        }

        // Vertical path
        if (start.col === end.col) {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][start.col].type !== 0) return false;
            }
            return true;
        }

        return false;
    }

    // ===== WITH PATH METHODS =====

    checkIPatternWithPath(start, end) {
        // Horizontal line
        if (start.row === end.row) {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[start.row][col].type !== 0) return null;
            }
            return [start, end];
        }

        // Vertical line
        if (start.col === end.col) {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][start.col].type !== 0) return null;
            }
            return [start, end];
        }

        return null;
    }

    checkLPatternWithPath(start, end) {
        // Try corner at start.row, end.col
        const corner1 = {row: start.row, col: end.col};
        if (this.isPathClear(start, corner1) &&
            this.isPathClear(corner1, end) &&
            this.board[start.row][end.col].type === 0) {
            return [start, corner1, end];
        }

        // Try corner at end.row, start.col
        const corner2 = {row: end.row, col: start.col};
        if (this.isPathClear(start, corner2) &&
            this.isPathClear(corner2, end) &&
            this.board[end.row][start.col].type === 0) {
            return [start, corner2, end];
        }

        return null;
    }

    checkUPatternWithPath(start, end) {
        // Check more right
        let path = this.checkMoreLineXWithPath(start, end, 1);
        if (path) return path;
        
        // Check more left
        path = this.checkMoreLineXWithPath(start, end, -1);
        if (path) return path;
        
        // Check more down
        path = this.checkMoreLineYWithPath(start, end, 1);
        if (path) return path;
        
        // Check more up
        path = this.checkMoreLineYWithPath(start, end, -1);
        if (path) return path;
        
        return null;
    }

    checkMoreLineXWithPath(start, end, type) {
        const pMinY = start.col < end.col ? start : end;
        const pMaxY = start.col < end.col ? end : start;
        
        let y = pMaxY.col + type;
        let row = pMinY.row;
        let colFinish = pMaxY.col;
        
        if (type === -1) {
            colFinish = pMinY.col;
            y = pMinY.col + type;
            row = pMaxY.row;
        }

        if ((this.board[row][colFinish].type === 0 || pMinY.col === pMaxY.col) &&
            this.checkLineX(pMinY.col, pMaxY.col, row)) {
            
            while (y >= 0 && y < this.matrixWidth && 
                   this.board[pMinY.row][y].type === 0 && 
                   this.board[pMaxY.row][y].type === 0) {
                
                if (this.checkLineY(pMinY.row, pMaxY.row, y)) {
                    const connectPoint1 = {row: pMinY.row, col: y};
                    const connectPoint2 = {row: pMaxY.row, col: y};
                    return [pMinY, connectPoint1, connectPoint2, pMaxY];
                }
                y += type;
            }
        }
        return null;
    }

    checkMoreLineYWithPath(start, end, type) {
        const pMinX = start.row < end.row ? start : end;
        const pMaxX = start.row < end.row ? end : start;
        
        let x = pMaxX.row + type;
        let col = pMinX.col;
        let rowFinish = pMaxX.row;
        
        if (type === -1) {
            rowFinish = pMinX.row;
            x = pMinX.row + type;
            col = pMaxX.col;
        }

        if ((this.board[rowFinish][col].type === 0 || pMinX.row === pMaxX.row) &&
            this.checkLineY(pMinX.row, pMaxX.row, col)) {
            
            while (x >= 0 && x < this.matrixHeight && 
                   this.board[x][pMinX.col].type === 0 && 
                   this.board[x][pMaxX.col].type === 0) {
                
                if (this.checkLineX(pMinX.col, pMaxX.col, x)) {
                    const connectPoint1 = {row: x, col: pMinX.col};
                    const connectPoint2 = {row: x, col: pMaxX.col};
                    return [pMinX, connectPoint1, connectPoint2, pMaxX];
                }
                x += type;
            }
        }
        return null;
    }

    checkZPatternWithPath(start, end) {
        for (let row = 0; row < this.matrixHeight; row++) {
            for (let col = 0; col < this.matrixWidth; col++) {
                if (this.board[row][col].type !== 0) continue;

                const midPoint = {row, col};
                if (this.isPathClear(start, midPoint) && this.isPathClear(midPoint, end)) {
                    return [start, midPoint, end];
                }
            }
        }
        return null;
    }
}