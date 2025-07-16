import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class PikachuGame extends Scene
{
    constructor ()
    {
        super('PikachuGame');
        this.board = [];
        this.boardWidth = 8;
        this.boardHeight = 6;
        this.cardWidth = 80;
        this.cardHeight = 110;
        this.selectedCards = [];
        this.gameStarted = false;
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x2c3e50);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.3);

        // Title
        this.add.text(512, 50, 'Pikachu Card Matching Game', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(512, 100, 'Match pairs of identical cards using I, L, U, or Z patterns', {
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
        const newGameBtn = this.add.rectangle(150, 700, 120, 40, 0x3498db)
            .setInteractive()
            .on('pointerdown', () => this.startNewGame())
            .on('pointerover', () => newGameBtn.setFillStyle(0x2980b9))
            .on('pointerout', () => newGameBtn.setFillStyle(0x3498db));

        this.add.text(150, 700, 'New Game', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);

        // Hint button
        const hintBtn = this.add.rectangle(300, 700, 120, 40, 0xe74c3c)
            .setInteractive()
            .on('pointerdown', () => this.showHint())
            .on('pointerover', () => hintBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => hintBtn.setFillStyle(0xe74c3c));

        this.add.text(300, 700, 'Hint', {
            fontFamily: 'Arial', fontSize: 16, color: '#ffffff'
        }).setOrigin(0.5);

        // Back to Menu button
        const backBtn = this.add.rectangle(850, 700, 120, 40, 0x95a5a6)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('MainMenu'))
            .on('pointerover', () => backBtn.setFillStyle(0x7f8c8d))
            .on('pointerout', () => backBtn.setFillStyle(0x95a5a6));

        this.add.text(850, 700, 'Main Menu', {
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

        // Create 2D board
        for (let row = 0; row < this.boardHeight; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardWidth; col++) {
                const cardIndex = row * this.boardWidth + col;
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

        this.renderBoard();
        this.gameStarted = true;
    }

    renderBoard()
    {
        const startX = 512 - (this.boardWidth * this.cardWidth) / 2 + this.cardWidth / 2;
        const startY = 300;

        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                const cell = this.board[row][col];
                if (cell.visible) {
                    const x = startX + col * this.cardWidth;
                    const y = startY + row * this.cardHeight;

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
            if (this.hasValidPath(first, second)) {
                // Valid match - remove cards
                this.removeCards(first, second);
                this.checkGameComplete();
            } else {
                // Invalid path - clear selection
                this.clearSelection();
            }
        } else {
            // Different cards - clear selection
            this.clearSelection();
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

    checkLPattern(start, end)
    {
        // Try corner at start.row, end.col
        if (this.isPathClear(start, {row: start.row, col: end.col}) && 
            this.isPathClear({row: start.row, col: end.col}, end) &&
            !this.board[start.row][end.col].visible) {
            return true;
        }

        // Try corner at end.row, start.col
        if (this.isPathClear(start, {row: end.row, col: start.col}) && 
            this.isPathClear({row: end.row, col: start.col}, end) &&
            !this.board[end.row][start.col].visible) {
            return true;
        }

        return false;
    }

    checkUPattern(start, end)
    {
        // Check paths that go to the border and back
        // This is a simplified implementation
        return false;
    }

    checkZPattern(start, end)
    {
        // Check all possible two-turn paths
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.board[row][col].visible) continue;
                
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
                if (this.board[start.row][col].visible) return false;
            }
            return true;
        }

        // Vertical path
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
    }

    checkGameComplete()
    {
        let remainingCards = 0;
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.board[row][col].visible) remainingCards++;
            }
        }

        if (remainingCards === 0) {
            this.gameStarted = false;
            this.time.delayedCall(1000, () => {
                this.add.text(512, 400, 'Congratulations!\nYou completed the game!', {
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

    showHint()
    {
        // Find a valid pair and highlight them
        for (let row1 = 0; row1 < this.boardHeight; row1++) {
            for (let col1 = 0; col1 < this.boardWidth; col1++) {
                if (!this.board[row1][col1].visible) continue;
                
                for (let row2 = 0; row2 < this.boardHeight; row2++) {
                    for (let col2 = 0; col2 < this.boardWidth; col2++) {
                        if (!this.board[row2][col2].visible) continue;
                        if (row1 === row2 && col1 === col2) continue;
                        
                        if (this.board[row1][col1].type === this.board[row2][col2].type &&
                            this.hasValidPath({row: row1, col: col1}, {row: row2, col: col2})) {
                            
                            // Highlight the hint pair
                            this.board[row1][col1].sprite.setTint(0xffff00);
                            this.board[row2][col2].sprite.setTint(0xffff00);
                            
                            this.time.delayedCall(2000, () => {
                                this.board[row1][col1].sprite.clearTint();
                                this.board[row2][col2].sprite.clearTint();
                            });
                            return;
                        }
                    }
                }
            }
        }
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