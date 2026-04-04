/**
 * Pure game logic for Pikachu card matching — no Phaser dependencies.
 * Pattern priority: I (straight) → L (one turn) → U (border extension) → Z (two turns).
 */
export class PikachuGameLogic {
    constructor(boardWidth = 20, boardHeight = 8) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.matrixWidth = boardWidth + 2;
        this.matrixHeight = boardHeight + 2;
        this.board = [];
    }

    /** Load board state from a 2D numeric matrix (used by tests) */
    loadBoardFromMatrix(matrix) {
        if (matrix.length !== this.matrixHeight || matrix[0].length !== this.matrixWidth) {
            throw new Error(`Matrix must be ${this.matrixHeight}x${this.matrixWidth}`);
        }
        this.board = [];
        for (let row = 0; row < this.matrixHeight; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.matrixWidth; col++) {
                const isBorder = row === 0 || row === this.matrixHeight - 1 ||
                                 col === 0 || col === this.matrixWidth - 1;
                this.board[row][col] = {
                    type: matrix[row][col],
                    visible: matrix[row][col] !== 0 && !isBorder,
                    row, col
                };
            }
        }
    }

    /** Validate and test a move between two board positions (1-indexed) */
    testMove(row1, col1, row2, col2) {
        if (row1 < 1 || row1 > this.boardHeight || col1 < 1 || col1 > this.boardWidth ||
            row2 < 1 || row2 > this.boardHeight || col2 < 1 || col2 > this.boardWidth) {
            return { valid: false, error: "Position out of bounds. Use 1-indexed coordinates for game board.", details: null };
        }

        const cell1 = this.board[row1][col1];
        const cell2 = this.board[row2][col2];
        const posInfo = {
            pos1: { row: row1, col: col1, type: cell1.type },
            pos2: { row: row2, col: col2, type: cell2.type }
        };

        if (cell1.type === 0 || cell2.type === 0)
            return { valid: false, error: "One or both positions are empty", details: posInfo };
        if (cell1.type !== cell2.type)
            return { valid: false, error: "Cards are different types", details: posInfo };
        if (row1 === row2 && col1 === col2)
            return { valid: false, error: "Cannot select the same position twice", details: posInfo };

        const result = this.findPath({ row: row1, col: col1 }, { row: row2, col: col2 });
        return {
            valid: result.valid,
            error: result.valid ? null : "No valid path found",
            details: { ...posInfo, pattern: result.pattern, path: result.path }
        };
    }

    // ===== PUBLIC API =====

    /** Check if any valid path exists between two positions */
    hasValidPath(start, end) {
        return this.findPath(start, end).valid;
    }

    /** Find valid path with details: {valid, path, pattern} */
    findPath(start, end) {
        const patterns = [
            ['I-pattern', this.findIPath],
            ['L-pattern', this.findLPath],
            ['U-pattern', this.findUPath],
            ['Z-pattern', this.findZPath],
        ];
        for (const [name, finder] of patterns) {
            const path = finder.call(this, start, end);
            if (path) return { valid: true, path, pattern: name };
        }
        return { valid: false, path: null, pattern: 'none' };
    }

    // ===== PATH UTILITIES =====

    /** Check if straight line (horizontal or vertical) between two points is clear */
    isPathClear(start, end) {
        if (start.row === end.row && start.col === end.col) return true;

        if (start.row === end.row) {
            const [min, max] = [Math.min(start.col, end.col), Math.max(start.col, end.col)];
            for (let col = min + 1; col < max; col++) {
                if (this.board[start.row][col].type !== 0) return false;
            }
            return true;
        }

        if (start.col === end.col) {
            const [min, max] = [Math.min(start.row, end.row), Math.max(start.row, end.row)];
            for (let row = min + 1; row < max; row++) {
                if (this.board[row][start.col].type !== 0) return false;
            }
            return true;
        }

        return false;
    }

    /** Check if a cell is empty (type === 0) */
    isEmpty(row, col) {
        return this.board[row][col].type === 0;
    }

    // ===== PATTERN FINDERS (return path array or null) =====

    /** I-pattern: straight horizontal or vertical line */
    findIPath(start, end) {
        if (start.row !== end.row && start.col !== end.col) return null;
        return this.isPathClear(start, end) ? [start, end] : null;
    }

    /** L-pattern: one 90-degree turn through an empty corner */
    findLPath(start, end) {
        const corners = [
            { row: start.row, col: end.col },
            { row: end.row, col: start.col }
        ];
        for (const corner of corners) {
            if (this.isEmpty(corner.row, corner.col) &&
                this.isPathClear(start, corner) &&
                this.isPathClear(corner, end)) {
                return [start, corner, end];
            }
        }
        return null;
    }

    /** U-pattern: two turns extending beyond the bounding box via border */
    findUPath(start, end) {
        return this.findUPathAlongCols(start, end, 1) ||
               this.findUPathAlongCols(start, end, -1) ||
               this.findUPathAlongRows(start, end, 1) ||
               this.findUPathAlongRows(start, end, -1);
    }

    /**
     * U-pattern helper: extend along columns (left/right).
     * Path shape: left→(left.row, scanCol)→(right.row, scanCol)→right
     */
    findUPathAlongCols(start, end, dir) {
        const left = start.col <= end.col ? start : end;
        const right = start.col <= end.col ? end : start;
        const sameCol = left.col === right.col;

        // Determine scan start and which horizontal segment to verify
        let scanCol, segmentRow, segmentEndCol;
        if (dir === 1) {
            scanCol = right.col + 1;
            segmentRow = left.row;
            segmentEndCol = right.col;
        } else {
            scanCol = left.col - 1;
            segmentRow = right.row;
            segmentEndCol = left.col;
        }

        // Horizontal segment between the two cards must be clear
        if (!sameCol && !this.isEmpty(segmentRow, segmentEndCol)) return null;
        if (!this.isPathClear({ row: segmentRow, col: left.col }, { row: segmentRow, col: right.col })) return null;

        // Scan outward for a valid connecting column
        while (scanCol >= 0 && scanCol < this.matrixWidth &&
               this.isEmpty(left.row, scanCol) && this.isEmpty(right.row, scanCol)) {
            if (this.isPathClear({ row: left.row, col: scanCol }, { row: right.row, col: scanCol })) {
                return [left, { row: left.row, col: scanCol }, { row: right.row, col: scanCol }, right];
            }
            scanCol += dir;
        }
        return null;
    }

    /**
     * U-pattern helper: extend along rows (up/down).
     * Path shape: top→(scanRow, top.col)→(scanRow, bottom.col)→bottom
     */
    findUPathAlongRows(start, end, dir) {
        const top = start.row <= end.row ? start : end;
        const bottom = start.row <= end.row ? end : start;
        const sameRow = top.row === bottom.row;

        let scanRow, segmentCol, segmentEndRow;
        if (dir === 1) {
            scanRow = bottom.row + 1;
            segmentCol = top.col;
            segmentEndRow = bottom.row;
        } else {
            scanRow = top.row - 1;
            segmentCol = bottom.col;
            segmentEndRow = top.row;
        }

        if (!sameRow && !this.isEmpty(segmentEndRow, segmentCol)) return null;
        if (!this.isPathClear({ row: top.row, col: segmentCol }, { row: bottom.row, col: segmentCol })) return null;

        while (scanRow >= 0 && scanRow < this.matrixHeight &&
               this.isEmpty(scanRow, top.col) && this.isEmpty(scanRow, bottom.col)) {
            if (this.isPathClear({ row: scanRow, col: top.col }, { row: scanRow, col: bottom.col })) {
                return [top, { row: scanRow, col: top.col }, { row: scanRow, col: bottom.col }, bottom];
            }
            scanRow += dir;
        }
        return null;
    }

    /** Z-pattern: two turns through a connecting column or row */
    findZPath(start, end) {
        // H-V-H: scan connecting columns
        for (let col = 0; col < this.matrixWidth; col++) {
            if (col === start.col || col === end.col) continue;
            if (!this.isEmpty(start.row, col) || !this.isEmpty(end.row, col)) continue;
            const c1 = { row: start.row, col };
            const c2 = { row: end.row, col };
            if (this.isPathClear(start, c1) && this.isPathClear(c1, c2) && this.isPathClear(c2, end)) {
                return [start, c1, c2, end];
            }
        }
        // V-H-V: scan connecting rows
        for (let row = 0; row < this.matrixHeight; row++) {
            if (row === start.row || row === end.row) continue;
            if (!this.isEmpty(row, start.col) || !this.isEmpty(row, end.col)) continue;
            const c1 = { row, col: start.col };
            const c2 = { row, col: end.col };
            if (this.isPathClear(start, c1) && this.isPathClear(c1, c2) && this.isPathClear(c2, end)) {
                return [start, c1, c2, end];
            }
        }
        return null;
    }
}
