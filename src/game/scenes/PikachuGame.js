import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class PikachuGame extends Scene
{
    constructor ()
    {
        super('PikachuGame');
        this.board = [];
        this.boardWidth = 20;
        this.boardHeight = 8;
        // Add border padding - actual matrix is bigger
        this.matrixWidth = this.boardWidth + 2;
        this.matrixHeight = this.boardHeight + 2;
        this.cardWidth = 50;
        this.cardHeight = 75;
        this.selectedCards = [];
        this.gameStarted = false;
        this.debugLines = [];
        this.debugMode = false;
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x2c3e50);

        this.background = this.add.image(600, 450, 'background');
        this.background.setDisplaySize(1200, 900);
        this.background.setAlpha(0.3);

        // Title
        this.add.text(600, 50, 'Pikachu Card Matching Game', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(600, 100, 'Match pairs of identical cards using I, L, U, or Z patterns', {
            fontFamily: 'Arial', fontSize: 16, color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        // Game buttons
        this.createButtons();

        // Initialize game board
        this.initializeBoard();

        EventBus.emit('current-scene-ready', this);
    }

    createButtons()
    {
        // New Game button
        const newGameBtn = this.add.rectangle(200, 820, 120, 40, 0x3498db)
            .setInteractive()
            .on('pointerdown', () => this.startNewGame())
            .on('pointerover', () => newGameBtn.setFillStyle(0x2980b9))
            .on('pointerout', () => newGameBtn.setFillStyle(0x3498db));

        this.add.text(200, 820, 'New Game', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);

        // Hint button
        const hintBtn = this.add.rectangle(400, 820, 120, 40, 0xe74c3c)
            .setInteractive()
            .on('pointerdown', () => this.showHint())
            .on('pointerover', () => hintBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => hintBtn.setFillStyle(0xe74c3c));

        this.add.text(400, 820, 'Hint', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);

        // Debug toggle button
        this.debugBtn = this.add.rectangle(600, 820, 120, 40, 0x9b59b6)
            .setInteractive()
            .on('pointerdown', () => this.toggleDebugMode())
            .on('pointerover', () => this.debugBtn.setFillStyle(0x8e44ad))
            .on('pointerout', () => this.debugBtn.setFillStyle(0x9b59b6));

        this.debugText = this.add.text(600, 820, 'Debug: OFF', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);

        // Back to Menu button
        const backBtn = this.add.rectangle(1000, 820, 120, 40, 0x95a5a6)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainMenu'))
            .on('pointerover', () => backBtn.setFillStyle(0x7f8c8d))
            .on('pointerout', () => backBtn.setFillStyle(0x95a5a6));

        this.add.text(1000, 820, 'Main Menu', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);
    }

    initializeBoard()
    {
        // Clear existing board
        if (this.cardGroup) {
            this.cardGroup.destroy();
        }

        this.cardGroup = this.add.group();
        this.board = [];

        // Generate card pairs for the board
        const totalCells = this.boardWidth * this.boardHeight;
        const cardTypes = ['2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S',
                          '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C',
                          '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D'];

        // Create pairs of cards
        const cards = [];
        const pairsNeeded = totalCells / 2;

        for (let i = 0; i < pairsNeeded; i++) {
            const cardType = cardTypes[i % cardTypes.length];
            cards.push(cardType, cardType);
        }

        // Shuffle the cards
        this.shuffleArray(cards);

        // Create 2D board with border padding
        for (let row = 0; row < this.matrixHeight; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.matrixWidth; col++) {
                // Border cells are always empty (0)
                if (row === 0 || row === this.matrixHeight - 1 || col === 0 || col === this.matrixWidth - 1) {
                    this.board[row][col] = {
                        type: 0,
                        visible: false,
                        row: row,
                        col: col,
                        sprite: null
                    };
                } else {
                    // Game board cells (1-indexed in matrix)
                    const gameRow = row - 1;
                    const gameCol = col - 1;
                    const cardIndex = gameRow * this.boardWidth + gameCol;
                    const cardType = cards[cardIndex];

                    this.board[row][col] = {
                        type: cardType,
                        visible: true,
                        row: row,
                        col: col,
                        sprite: null
                    };
                }
            }
        }

        this.renderBoard();
        this.gameStarted = true;
    }

    renderBoard()
    {
        const startX = 600 - (this.boardWidth * this.cardWidth) / 2 + this.cardWidth / 2;
        const startY = 180;

        // Only render the actual game board (skip border)
        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                const cell = this.board[row][col];
                if (cell.visible) {
                    // Convert matrix coordinates to visual coordinates
                    const gameRow = row - 1;
                    const gameCol = col - 1;
                    const x = startX + gameCol * this.cardWidth;
                    const y = startY + gameRow * this.cardHeight;

                    const cardSprite = this.add.image(x, y, cell.type)
                        .setDisplaySize(this.cardWidth - 5, this.cardHeight - 5)
                        .setInteractive()
                        .on('pointerdown', () => this.selectCard(row, col));

                    cell.sprite = cardSprite;
                    this.cardGroup.add(cardSprite);
                }
            }
        }
    }

    selectCard(row, col)
    {
        if (!this.gameStarted) return;

        const cell = this.board[row][col];
        if (!cell.visible) return;

        // Check if already selected
        if (this.selectedCards.some(selected => selected.row === row && selected.col === col)) {
            return;
        }

        // Add selection visual effect
        cell.sprite.setTint(0x00ff00);
        this.selectedCards.push({row, col});

        if (this.selectedCards.length === 2) {
            this.time.delayedCall(300, () => {
                this.checkMatch();
            });
        }
    }

    checkMatch()
    {
        const [first, second] = this.selectedCards;
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        // Check if cards are of the same type
        if (firstCell.type === secondCell.type) {
            // Check if there's a valid path between them
            const pathResult = this.hasValidPathWithDebug(first, second);
            if (pathResult.valid) {
                // Valid match - show green line and remove cards
                if (this.debugMode) {
                    this.drawDebugPath(pathResult.path, 0x00ff00);
                }
                this.time.delayedCall(this.debugMode ? 1000 : 0, () => {
                    this.removeCards(first, second);
                    this.checkGameComplete();
                });
            } else {
                // Invalid path - show red line and clear selection
                if (this.debugMode) {
                    this.drawDebugLine(first, second, 0xff0000);
                }
                this.time.delayedCall(this.debugMode ? 1000 : 0, () => {
                    this.clearSelection();
                });
            }
        } else {
            // Different cards - show red line and clear selection
            if (this.debugMode) {
                this.drawDebugLine(first, second, 0xff0000);
            }
            this.time.delayedCall(this.debugMode ? 1000 : 0, () => {
                this.clearSelection();
            });
        }
    }

    hasValidPath(start, end)
    {
        // Check I-pattern (straight line)
        if (this.checkIPattern(start, end)) return true;

        // Check L-pattern (one turn)
        if (this.checkLPattern(start, end)) return true;

        // Check U-pattern (two turns with border)
        if (this.checkUPattern(start, end)) return true;

        // Check Z-pattern (two turns)
        if (this.checkZPattern(start, end)) return true;

        return false;
    }

    hasValidPathWithDebug(start, end)
    {
        // Check I-pattern (straight line)
        const iPath = this.checkIPatternWithPath(start, end);
        if (iPath) return { valid: true, path: iPath };

        // Check L-pattern (one turn)
        const lPath = this.checkLPatternWithPath(start, end);
        if (lPath) return { valid: true, path: lPath };

        // Check U-pattern (two turns with border)
        const uPath = this.checkUPatternWithPath(start, end);
        if (uPath) return { valid: true, path: uPath };

        // Check Z-pattern (two turns)
        const zPath = this.checkZPatternWithPath(start, end);
        if (zPath) return { valid: true, path: zPath };

        return { valid: false, path: null };
    }

    checkIPattern(start, end)
    {
        // Horizontal line
        if (start.row === end.row) {
            const minCol = Math.min(start.col, end.col);
            const maxCol = Math.max(start.col, end.col);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (this.board[start.row][col].visible) return false;
            }
            return true;
        }

        // Vertical line
        if (start.col === end.col) {
            const minRow = Math.min(start.row, end.row);
            const maxRow = Math.max(start.row, end.row);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (this.board[row][start.col].visible) return false;
            }
            return true;
        }

        return false;
    }

    checkLineX(y1, y2, x)
    {
        // Find point have column max and min
        const min = Math.min(y1, y2);
        const max = Math.max(y1, y2);
        
        // Run column
        for (let y = min + 1; y < max; y++) {
            if (this.board[x][y].type !== 0) { // if see barrier then die
                return false;
            }
        }
        // Not die -> success
        return true;
    }

    checkLineY(x1, x2, y)
    {
        const min = Math.min(x1, x2);
        const max = Math.max(x1, x2);
        
        for (let x = min + 1; x < max; x++) {
            if (this.board[x][y].type !== 0) {
                return false;
            }
        }
        return true;
    }

    checkLPattern(start, end)
    {
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

    checkUPattern(start, end)
    {
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

    checkMoreLineX(start, end, type)
    {
        // Find point have y min
        const pMinY = start.col < end.col ? start : end;
        const pMaxY = start.col < end.col ? end : start;
        
        // Find line and y begin
        let y = pMaxY.col + type;
        let row = pMinY.row;
        let colFinish = pMaxY.col;
        
        if (type === -1) {
            colFinish = pMinY.col;
            y = pMinY.col + type;
            row = pMaxY.row;
        }

        // Check if we can connect horizontally first
        if ((this.board[row][colFinish].type === 0 || pMinY.col === pMaxY.col) &&
            this.checkLineX(pMinY.col, pMaxY.col, row)) {
            
            // Check extension beyond border
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

    checkMoreLineY(start, end, type)
    {
        // Find point have x min
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

        // Check if we can connect vertically first
        if ((this.board[rowFinish][col].type === 0 || pMinX.row === pMaxX.row) &&
            this.checkLineY(pMinX.row, pMaxX.row, col)) {
            
            // Check extension beyond border
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

    checkZPattern(start, end)
    {
        // Check all possible two-turn paths within the matrix
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

    isPathClear(start, end)
    {
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

    removeCards(first, second)
    {
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        // Add removal animation
        this.tweens.add({
            targets: [firstCell.sprite, secondCell.sprite],
            scale: 0,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                firstCell.sprite.destroy();
                secondCell.sprite.destroy();
                firstCell.visible = false;
                secondCell.visible = false;
                firstCell.sprite = null;
                secondCell.sprite = null;
            }
        });

        this.selectedCards = [];
    }

    clearSelection()
    {
        this.selectedCards.forEach(selected => {
            const cell = this.board[selected.row][selected.col];
            if (cell.sprite) {
                cell.sprite.clearTint();
            }
        });
        this.selectedCards = [];
        this.clearDebugLines();
    }

    clearDebugLines()
    {
        this.debugLines.forEach(line => {
            if (line && line.destroy) {
                line.destroy();
            }
        });
        this.debugLines = [];
    }

    drawDebugLine(start, end, color)
    {
        this.clearDebugLines();
        
        // Convert matrix coordinates to visual coordinates
        const startGameCol = start.col - 1;
        const startGameRow = start.row - 1;
        const endGameCol = end.col - 1;
        const endGameRow = end.row - 1;
        
        const startX = 600 - (this.boardWidth * this.cardWidth) / 2 + this.cardWidth / 2 + startGameCol * this.cardWidth;
        const startY = 180 + startGameRow * this.cardHeight;
        const endX = 600 - (this.boardWidth * this.cardWidth) / 2 + this.cardWidth / 2 + endGameCol * this.cardWidth;
        const endY = 180 + endGameRow * this.cardHeight;

        const line = this.add.line(0, 0, startX, startY, endX, endY, color);
        line.setLineWidth(3);
        this.debugLines.push(line);
    }

    drawDebugPath(path, color)
    {
        this.clearDebugLines();
        
        if (!path || path.length < 2) return;

        const baseX = 600 - (this.boardWidth * this.cardWidth) / 2 + this.cardWidth / 2;
        const baseY = 180;

        for (let i = 0; i < path.length - 1; i++) {
            const point1 = path[i];
            const point2 = path[i + 1];
            
            // Convert matrix coordinates to visual coordinates
            // Handle border points that might be outside the visible area
            const gameCol1 = point1.col - 1;
            const gameRow1 = point1.row - 1;
            const gameCol2 = point2.col - 1;
            const gameRow2 = point2.row - 1;
            
            const x1 = baseX + gameCol1 * this.cardWidth;
            const y1 = baseY + gameRow1 * this.cardHeight;
            const x2 = baseX + gameCol2 * this.cardWidth;
            const y2 = baseY + gameRow2 * this.cardHeight;

            const line = this.add.line(0, 0, x1, y1, x2, y2, color);
            line.setLineWidth(3);
            this.debugLines.push(line);
        }
    }

    checkGameComplete()
    {
        let remainingCards = 0;
        // Only check the actual game board (skip border)
        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                if (this.board[row][col].visible) remainingCards++;
            }
        }

        if (remainingCards === 0) {
            this.gameStarted = false;
            this.time.delayedCall(1000, () => {
                this.add.text(600, 450, 'Congratulations!\nYou completed the game!', {
                    fontFamily: 'Arial Black', fontSize: 32, color: '#f1c40f',
                    stroke: '#000000', strokeThickness: 4,
                    align: 'center'
                }).setOrigin(0.5);
            });
        }
    }

    startNewGame()
    {
        this.selectedCards = [];
        this.initializeBoard();
    }

    toggleDebugMode()
    {
        this.debugMode = !this.debugMode;
        this.debugText.setText(this.debugMode ? 'Debug: ON' : 'Debug: OFF');
        this.debugBtn.setFillStyle(this.debugMode ? 0x27ae60 : 0x9b59b6);
        
        // Clear any existing debug lines when toggling off
        if (!this.debugMode) {
            this.clearDebugLines();
        }
    }

    showHint()
    {
        // Find a valid pair and highlight them (only check game board)
        for (let row1 = 1; row1 < this.matrixHeight - 1; row1++) {
            for (let col1 = 1; col1 < this.matrixWidth - 1; col1++) {
                if (!this.board[row1][col1].visible) continue;

                for (let row2 = 1; row2 < this.matrixHeight - 1; row2++) {
                    for (let col2 = 1; col2 < this.matrixWidth - 1; col2++) {
                        if (!this.board[row2][col2].visible) continue;
                        if (row1 === row2 && col1 === col2) continue;

                        if (this.board[row1][col1].type === this.board[row2][col2].type &&
                            this.hasValidPath({row: row1, col: col1}, {row: row2, col: col2})) {

                            // Highlight the hint pair
                            this.board[row1][col1].sprite.setTint(0xffff00);
                            this.board[row2][col2].sprite.setTint(0xffff00);

                            this.time.delayedCall(2000, () => {
                                if (this.board[row1][col1].sprite) {
                                    this.board[row1][col1].sprite.clearTint();
                                }
                                if (this.board[row2][col2].sprite) {
                                    this.board[row2][col2].sprite.clearTint();
                                }
                            });
                            return;
                        }
                    }
                }
            }
        }
    }

    checkIPatternWithPath(start, end)
    {
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

    checkLPatternWithPath(start, end)
    {
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

    checkUPatternWithPath(start, end)
    {
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

    checkMoreLineXWithPath(start, end, type)
    {
        // Find point have y min
        const pMinY = start.col < end.col ? start : end;
        const pMaxY = start.col < end.col ? end : start;
        
        // Find line and y begin
        let y = pMaxY.col + type;
        let row = pMinY.row;
        let colFinish = pMaxY.col;
        
        if (type === -1) {
            colFinish = pMinY.col;
            y = pMinY.col + type;
            row = pMaxY.row;
        }

        // Check if we can connect horizontally first
        if ((this.board[row][colFinish].type === 0 || pMinY.col === pMaxY.col) &&
            this.checkLineX(pMinY.col, pMaxY.col, row)) {
            
            // Check extension beyond border
            while (y >= 0 && y < this.matrixWidth && 
                   this.board[pMinY.row][y].type === 0 && 
                   this.board[pMaxY.row][y].type === 0) {
                
                if (this.checkLineY(pMinY.row, pMaxY.row, y)) {
                    // Create path with the connecting point
                    const connectPoint1 = {row: pMinY.row, col: y};
                    const connectPoint2 = {row: pMaxY.row, col: y};
                    return [pMinY, connectPoint1, connectPoint2, pMaxY];
                }
                y += type;
            }
        }
        return null;
    }

    checkMoreLineYWithPath(start, end, type)
    {
        // Find point have x min
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

        // Check if we can connect vertically first
        if ((this.board[rowFinish][col].type === 0 || pMinX.row === pMaxX.row) &&
            this.checkLineY(pMinX.row, pMaxX.row, col)) {
            
            // Check extension beyond border
            while (x >= 0 && x < this.matrixHeight && 
                   this.board[x][pMinX.col].type === 0 && 
                   this.board[x][pMaxX.col].type === 0) {
                
                if (this.checkLineX(pMinX.col, pMaxX.col, x)) {
                    // Create path with the connecting point
                    const connectPoint1 = {row: x, col: pMinX.col};
                    const connectPoint2 = {row: x, col: pMaxX.col};
                    return [pMinX, connectPoint1, connectPoint2, pMaxX];
                }
                x += type;
            }
        }
        return null;
    }

    checkZPatternWithPath(start, end)
    {
        // Check all possible two-turn paths within the matrix
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

    shuffleArray(array)
    {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    changeScene()
    {
        this.scene.start('MainMenu');
    }
}
