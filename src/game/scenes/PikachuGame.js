import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { PikachuGameLogic } from '../logic/PikachuGameLogic';

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 8;
const CARD_W = 52;
const CARD_H = 52;
const BOARD_X = 600;
const BOARD_Y = 200;

const CARD_BG = 0xfaf8ef;
const CARD_BORDER = 0xd5ceb8;
const CARD_HOVER_BG = 0xe0e8f0;
const CARD_SELECT_BG = 0xc8f7c5;
const CARD_MISMATCH_BG = 0xf5b7b1;

const CARD_TYPES = [
    '😀', '😂', '🥰', '😎', '🤩', '😴', '🤔', '😱',
    '🐶', '🐱', '🐸', '🦊', '🐻', '🐼', '🐨', '🦁',
    '🍎', '🍕', '🚀', '💎', '⭐', '🔥', '🦄', '🌈'
];

export class PikachuGame extends Scene
{
    constructor ()
    {
        super('PikachuGame');
        this.board = [];
        this.matrixWidth = BOARD_WIDTH + 2;
        this.matrixHeight = BOARD_HEIGHT + 2;
        this.selectedCards = [];
        this.gameStarted = false;
        this.pathLines = [];
        this.debugMode = false;
        this.moves = 0;
        this.logic = new PikachuGameLogic(BOARD_WIDTH, BOARD_HEIGHT);
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x16213e);
        this.cameras.main.fadeIn(400);

        this.add.image(BOARD_X, 450, 'background')
            .setDisplaySize(1200, 900).setAlpha(0.12);

        this.add.text(BOARD_X, 50, 'Pikachu Card Matching', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#f1c40f',
            stroke: '#1a1a2e', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(BOARD_X, 90, 'Match identical cards using I, L, U, or Z patterns', {
            fontFamily: 'Arial', fontSize: 14, color: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5);

        this.movesText = this.add.text(BOARD_X, 130, 'Moves: 0', {
            fontFamily: 'Arial', fontSize: 18, color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        this.createButtons();
        this.initializeBoard();

        EventBus.emit('current-scene-ready', this);
    }

    createButtons()
    {
        const btnY = 830;
        const btnStyle = { fontFamily: 'Arial', fontSize: 15, color: '#ffffff' };

        this.createButton(180, btnY, 'New Game', 0x3498db, 0x2980b9, () => this.startNewGame(), btnStyle);
        this.createButton(340, btnY, 'Hint', 0xe67e22, 0xd35400, () => this.showHint(), btnStyle);

        const debugBtnData = this.createButton(500, btnY, 'Debug: OFF', 0x8e44ad, 0x7d3c98, () => this.toggleDebugMode(), btnStyle);
        this.debugBtn = debugBtnData.bg;
        this.debugText = debugBtnData.text;

        this.createButton(900, btnY, 'Main Menu', 0x636e72, 0x515a5e, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('MainMenu'));
        }, btnStyle);
    }

    createButton(x, y, label, color, hoverColor, callback, textStyle)
    {
        const bg = this.add.rectangle(x, y, 130, 38, color)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, textStyle).setOrigin(0.5);

        bg.on('pointerover', () => {
            bg.setFillStyle(hoverColor);
            this.tweens.add({ targets: [bg, text], scaleX: 1.05, scaleY: 1.05, duration: 100 });
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            this.tweens.add({ targets: [bg, text], scaleX: 1, scaleY: 1, duration: 100 });
        });
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: [bg, text], scaleX: 0.95, scaleY: 0.95, duration: 60, yoyo: true });
            callback();
        });

        return { bg, text };
    }

    initializeBoard()
    {
        if (this.cardGroup) this.cardGroup.destroy(true);
        this.cardGroup = this.add.group();
        this.board = [];

        const totalCells = BOARD_WIDTH * BOARD_HEIGHT;
        const cards = [];
        for (let i = 0; i < totalCells / 2; i++) {
            const type = CARD_TYPES[i % CARD_TYPES.length];
            cards.push(type, type);
        }
        this.shuffleArray(cards);

        for (let row = 0; row < this.matrixHeight; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.matrixWidth; col++) {
                const isBorder = row === 0 || row === this.matrixHeight - 1 ||
                                 col === 0 || col === this.matrixWidth - 1;
                if (isBorder) {
                    this.board[row][col] = { type: 0, visible: false, row, col, sprite: null };
                } else {
                    const idx = (row - 1) * BOARD_WIDTH + (col - 1);
                    this.board[row][col] = { type: cards[idx], visible: true, row, col, sprite: null, cardBg: null };
                }
            }
        }

        this.logic.board = this.board;
        this.renderBoard();
        this.gameStarted = true;
    }

    renderBoard()
    {
        const startX = BOARD_X - (BOARD_WIDTH * CARD_W) / 2 + CARD_W / 2;

        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                const cell = this.board[row][col];
                if (!cell.visible) continue;

                const x = startX + (col - 1) * CARD_W;
                const y = BOARD_Y + (row - 1) * CARD_H;

                const bg = this.add.rectangle(0, 0, CARD_W - 2, CARD_H - 2, CARD_BG)
                    .setStrokeStyle(1, CARD_BORDER);

                const emoji = this.add.text(0, 0, cell.type, {
                    fontSize: 28,
                    padding: { top: 4, bottom: 4, left: 2, right: 2 }
                }).setOrigin(0.5);

                const container = this.add.container(x, y, [bg, emoji]);
                container.setSize(CARD_W - 2, CARD_H - 2);
                container.setInteractive({ useHandCursor: true });

                cell.sprite = container;
                cell.cardBg = bg;
                this.cardGroup.add(container);

                // Hover effect
                container.on('pointerover', () => {
                    if (!this.isSelected(row, col) && cell.visible) {
                        bg.setFillStyle(CARD_HOVER_BG);
                        this.tweens.add({
                            targets: container, scaleX: 1.08, scaleY: 1.08,
                            duration: 100, ease: 'Power2'
                        });
                    }
                });
                container.on('pointerout', () => {
                    if (!this.isSelected(row, col) && cell.visible) {
                        bg.setFillStyle(CARD_BG);
                        this.tweens.add({
                            targets: container, scaleX: 1, scaleY: 1,
                            duration: 100, ease: 'Power2'
                        });
                    }
                });
                container.on('pointerdown', () => this.selectCard(row, col));
            }
        }
    }

    isSelected(row, col)
    {
        return this.selectedCards.some(s => s.row === row && s.col === col);
    }

    selectCard(row, col)
    {
        if (!this.gameStarted) return;
        const cell = this.board[row][col];
        if (!cell.visible || this.isSelected(row, col)) return;

        // Selection feedback: green card bg + scale pulse
        cell.cardBg.setFillStyle(CARD_SELECT_BG);
        this.tweens.add({
            targets: cell.sprite,
            scaleX: 1.15, scaleY: 1.15,
            duration: 120, ease: 'Power2',
            yoyo: true,
            onComplete: () => { if (cell.sprite) cell.sprite.setScale(1.05); }
        });

        this.selectedCards.push({ row, col });

        if (this.selectedCards.length === 2) {
            this.moves++;
            this.movesText.setText(`Moves: ${this.moves}`);
            this.time.delayedCall(250, () => this.checkMatch());
        }
    }

    checkMatch()
    {
        const [first, second] = this.selectedCards;
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        if (firstCell.type === secondCell.type) {
            const pathResult = this.logic.findPath(first, second);
            if (pathResult.valid) {
                // Always show green connection path, then remove
                this.drawPath(pathResult.path, 0x00ff00);
                this.time.delayedCall(400, () => {
                    this.removeCards(first, second);
                    this.checkGameComplete();
                });
                return;
            }
        }

        // Mismatch — always show red line + shake
        this.drawPath([first, second], 0xff4444);
        this.showMismatch(firstCell, secondCell);
    }

    showMismatch(cell1, cell2)
    {
        [cell1, cell2].forEach(cell => {
            if (!cell.sprite) return;
            cell.cardBg.setFillStyle(CARD_MISMATCH_BG);
            const origX = cell.sprite.x;
            this.tweens.add({
                targets: cell.sprite,
                x: { from: origX - 4, to: origX + 4 },
                duration: 50, yoyo: true, repeat: 2,
                ease: 'Sine.easeInOut',
                onComplete: () => { if (cell.sprite) cell.sprite.x = origX; }
            });
        });

        this.time.delayedCall(500, () => this.clearSelection());
    }

    removeCards(first, second)
    {
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        // Match animation: flash white bg, scale up, fade out
        [firstCell, secondCell].forEach(c => {
            if (c.cardBg) c.cardBg.setFillStyle(0xffffff).setStrokeStyle(1, 0xaaffaa);
        });

        this.tweens.add({
            targets: [firstCell.sprite, secondCell.sprite],
            scaleX: 1.3, scaleY: 1.3,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                [firstCell, secondCell].forEach(cell => {
                    if (cell.sprite) cell.sprite.destroy();
                    cell.visible = false;
                    cell.type = 0;
                    cell.sprite = null;
                    cell.cardBg = null;
                });
                this.clearPathLines();
            }
        });

        this.selectedCards = [];
    }

    clearSelection()
    {
        this.selectedCards.forEach(({ row, col }) => {
            const cell = this.board[row][col];
            if (cell.sprite) {
                cell.cardBg.setFillStyle(CARD_BG);
                this.tweens.add({
                    targets: cell.sprite, scaleX: 1, scaleY: 1, duration: 150
                });
            }
        });
        this.selectedCards = [];
        this.clearPathLines();
    }

    clearPathLines()
    {
        this.pathLines.forEach(line => { if (line?.destroy) line.destroy(); });
        this.pathLines = [];
    }

    matrixToScreen(row, col)
    {
        const baseX = BOARD_X - (BOARD_WIDTH * CARD_W) / 2 + CARD_W / 2;
        return {
            x: baseX + (col - 1) * CARD_W,
            y: BOARD_Y + (row - 1) * CARD_H
        };
    }

    /** Draw connecting path between points with color and fade-in animation */
    drawPath(path, color)
    {
        this.clearPathLines();
        if (!path || path.length < 2) return;

        const gfx = this.add.graphics().setDepth(5).setAlpha(0);
        gfx.lineStyle(3, color, 1);
        const p0 = this.matrixToScreen(path[0].row, path[0].col);
        gfx.moveTo(p0.x, p0.y);
        for (let i = 1; i < path.length; i++) {
            const p = this.matrixToScreen(path[i].row, path[i].col);
            gfx.lineTo(p.x, p.y);
        }
        gfx.strokePath();
        this.tweens.add({ targets: gfx, alpha: 0.9, duration: 150 });
        this.pathLines.push(gfx);
    }

    checkGameComplete()
    {
        let remaining = 0;
        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                if (this.board[row][col].visible) remaining++;
            }
        }

        if (remaining === 0) {
            this.gameStarted = false;
            this.time.delayedCall(600, () => this.showCompletionScreen());
        }
    }

    showCompletionScreen()
    {
        const overlay = this.add.rectangle(BOARD_X, 450, 1200, 900, 0x000000, 0).setDepth(10);
        this.tweens.add({ targets: overlay, fillAlpha: 0.6, duration: 400 });

        const congrats = this.add.text(BOARD_X, 380, 'Congratulations!', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#f1c40f',
            stroke: '#1a1a2e', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(11);

        this.tweens.add({
            targets: congrats, alpha: 1, scale: 1,
            duration: 600, delay: 200, ease: 'Back.easeOut'
        });

        const stats = this.add.text(BOARD_X, 450, `Completed in ${this.moves} moves`, {
            fontFamily: 'Arial', fontSize: 22, color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0).setDepth(11);

        this.tweens.add({ targets: stats, alpha: 1, duration: 400, delay: 600 });

        const btn = this.add.rectangle(BOARD_X, 530, 200, 50, 0x27ae60)
            .setInteractive({ useHandCursor: true }).setAlpha(0).setDepth(11);
        const btnText = this.add.text(BOARD_X, 530, 'Play Again', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0).setDepth(11);

        this.tweens.add({ targets: [btn, btnText], alpha: 1, duration: 400, delay: 900 });

        btn.on('pointerover', () => {
            btn.setFillStyle(0x2ecc71);
            this.tweens.add({ targets: [btn, btnText], scaleX: 1.06, scaleY: 1.06, duration: 100 });
        });
        btn.on('pointerout', () => {
            btn.setFillStyle(0x27ae60);
            this.tweens.add({ targets: [btn, btnText], scaleX: 1, scaleY: 1, duration: 100 });
        });
        btn.on('pointerdown', () => {
            overlay.destroy(); congrats.destroy(); stats.destroy();
            btn.destroy(); btnText.destroy();
            this.startNewGame();
        });
    }

    startNewGame()
    {
        this.selectedCards = [];
        this.moves = 0;
        this.movesText.setText('Moves: 0');
        this.clearPathLines();
        this.initializeBoard();
    }

    toggleDebugMode()
    {
        this.debugMode = !this.debugMode;
        this.debugText.setText(this.debugMode ? 'Debug: ON' : 'Debug: OFF');
        this.debugBtn.setFillStyle(this.debugMode ? 0x27ae60 : 0x8e44ad);
        if (!this.debugMode) this.clearPathLines();
    }

    showHint()
    {
        for (let r1 = 1; r1 < this.matrixHeight - 1; r1++) {
            for (let c1 = 1; c1 < this.matrixWidth - 1; c1++) {
                if (!this.board[r1][c1].visible) continue;
                for (let r2 = 1; r2 < this.matrixHeight - 1; r2++) {
                    for (let c2 = 1; c2 < this.matrixWidth - 1; c2++) {
                        if (!this.board[r2][c2].visible) continue;
                        if (r1 === r2 && c1 === c2) continue;
                        if (this.board[r1][c1].type !== this.board[r2][c2].type) continue;

                        if (this.logic.hasValidPath({ row: r1, col: c1 }, { row: r2, col: c2 })) {
                            const cells = [this.board[r1][c1], this.board[r2][c2]];
                            cells.forEach(cell => {
                                if (!cell.sprite) return;
                                cell.cardBg.setFillStyle(0xfff3cd);
                                this.tweens.add({
                                    targets: cell.sprite,
                                    scaleX: 1.12, scaleY: 1.12,
                                    duration: 400, yoyo: true, repeat: 1,
                                    ease: 'Sine.easeInOut',
                                    onComplete: () => {
                                        if (cell.sprite) cell.sprite.setScale(1);
                                        if (cell.cardBg) cell.cardBg.setFillStyle(CARD_BG);
                                    }
                                });
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
}
