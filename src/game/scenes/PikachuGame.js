import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { PikachuGameLogic } from '../logic/PikachuGameLogic';
import {
    BOARD_WIDTH, BOARD_HEIGHT, CARD_W, CARD_H, BOARD_X, BOARD_Y,
    GAME_TIME, COMBO_WINDOW, CARD_BG, CARD_BORDER, CARD_HOVER_BG,
    CARD_SELECT_BORDER, CARD_MISMATCH_BG, CARD_TYPES
} from './pikachu-game-config.js';
import { drawPath, clearPathLines, matrixToScreen } from './pikachu-path-renderer.js';
import {
    createAllButtons, createStatsBar, startTimer, stopTimer,
    updateStats, showCompletionScreen, showComboPopup
} from './pikachu-game-ui.js';

export class PikachuGame extends Scene {
    constructor() {
        super('PikachuGame');
        this.board = [];
        this.matrixWidth = BOARD_WIDTH + 2;
        this.matrixHeight = BOARD_HEIGHT + 2;
        this.selectedCards = [];
        this.gameStarted = false;
        this.pathLines = [];
        this.debugMode = false;
        this.moves = 0;
        this.score = 0;
        this.combo = 1;
        this.lastMatchTime = 0;
        this.timeLeft = GAME_TIME;
        this.timerEvent = null;
        this.logic = new PikachuGameLogic(BOARD_WIDTH, BOARD_HEIGHT);
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0d0d2b);
        this.cameras.main.fadeIn(400);

        this.add.image(BOARD_X, 450, 'background')
            .setDisplaySize(1200, 900).setAlpha(0.08);

        this.add.text(BOARD_X, 40, 'Pikachu Connect', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#FFD700',
            stroke: '#0d0d2b', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5);

        createStatsBar(this);

        // Grid border
        const gridW = BOARD_WIDTH * CARD_W + 16;
        const gridH = BOARD_HEIGHT * CARD_H + 16;
        const gridX = BOARD_X - gridW / 2;
        const gridY = BOARD_Y - CARD_H / 2 - 8;
        this.add.rectangle(gridX + gridW / 2, gridY + gridH / 2, gridW, gridH, 0x000000, 0.35)
            .setStrokeStyle(1, 0xffd700, 0.25);

        createAllButtons(this);
        this.initializeBoard();
        startTimer(this);

        EventBus.emit('current-scene-ready', this);
    }

    // ===== BOARD =====

    initializeBoard() {
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

    renderBoard() {
        const startX = BOARD_X - (BOARD_WIDTH * CARD_W) / 2 + CARD_W / 2;

        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                const cell = this.board[row][col];
                if (!cell.visible) continue;

                const x = startX + (col - 1) * CARD_W;
                const y = BOARD_Y + (row - 1) * CARD_H;

                const bg = this.add.rectangle(0, 0, CARD_W - 4, CARD_H - 4, CARD_BG)
                    .setStrokeStyle(1, CARD_BORDER);
                const emoji = this.add.text(0, 0, cell.type, {
                    fontSize: 28, padding: { top: 4, bottom: 4, left: 2, right: 2 }
                }).setOrigin(0.5);

                const container = this.add.container(x, y, [bg, emoji]);
                container.setSize(CARD_W - 4, CARD_H - 4);
                container.setInteractive({ useHandCursor: true });

                cell.sprite = container;
                cell.cardBg = bg;
                this.cardGroup.add(container);

                container.on('pointerover', () => {
                    if (!this.isSelected(row, col) && cell.visible) {
                        bg.setFillStyle(CARD_HOVER_BG);
                        bg.setStrokeStyle(1, 0x555588);
                        this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100, ease: 'Power2' });
                    }
                });
                container.on('pointerout', () => {
                    if (!this.isSelected(row, col) && cell.visible) {
                        bg.setFillStyle(CARD_BG);
                        bg.setStrokeStyle(1, CARD_BORDER);
                        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100, ease: 'Power2' });
                    }
                });
                container.on('pointerdown', () => this.selectCard(row, col));
            }
        }
    }

    // ===== INTERACTION =====

    isSelected(row, col) {
        return this.selectedCards.some(s => s.row === row && s.col === col);
    }

    selectCard(row, col) {
        if (!this.gameStarted) return;
        const cell = this.board[row][col];
        if (!cell.visible || this.isSelected(row, col)) return;

        cell.cardBg.setStrokeStyle(2, CARD_SELECT_BORDER);
        cell.cardBg.setFillStyle(0x2a2a3e);
        this.tweens.add({ targets: cell.sprite, scaleX: 1.1, scaleY: 1.1, duration: 120, ease: 'Back.easeOut' });

        this.selectedCards.push({ row, col });
        if (this.selectedCards.length === 2) {
            this.time.delayedCall(200, () => this.checkMatch());
        }
    }

    checkMatch() {
        const [first, second] = this.selectedCards;
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        if (firstCell.type === secondCell.type) {
            const pathResult = this.logic.findPath(first, second);
            if (pathResult.valid) {
                this.handleMatch(first, second, pathResult.path);
                return;
            }
        }

        this.combo = 1;
        updateStats(this);
        drawPath(this, [first, second], 0xff4444);
        this.showMismatch(firstCell, secondCell);
    }

    handleMatch(first, second, path) {
        const now = Date.now();
        this.combo = (now - this.lastMatchTime < COMBO_WINDOW) ? Math.min(this.combo + 1, 8) : 1;
        this.lastMatchTime = now;

        const points = 10 * this.combo;
        this.score += points;
        this.moves++;
        updateStats(this);

        drawPath(this, path, 0x00ff88);

        const p = matrixToScreen(second.row, second.col);
        showComboPopup(this, p.x, p.y, points, this.combo);

        this.time.delayedCall(400, () => {
            this.removeCards(first, second);
            this.checkGameComplete();
        });

        this.selectedCards = [];
    }

    showMismatch(cell1, cell2) {
        [cell1, cell2].forEach(cell => {
            if (!cell.sprite) return;
            cell.cardBg.setFillStyle(CARD_MISMATCH_BG);
            const origX = cell.sprite.x;
            this.tweens.add({
                targets: cell.sprite,
                x: { from: origX - 5, to: origX + 5 },
                duration: 50, yoyo: true, repeat: 2, ease: 'Sine.easeInOut',
                onComplete: () => { if (cell.sprite) cell.sprite.x = origX; }
            });
        });
        this.time.delayedCall(450, () => this.clearSelection());
    }

    removeCards(first, second) {
        const firstCell = this.board[first.row][first.col];
        const secondCell = this.board[second.row][second.col];

        this.tweens.add({
            targets: [firstCell.sprite, secondCell.sprite],
            scaleX: 1.3, scaleY: 1.3, angle: 20, alpha: 0,
            duration: 350, ease: 'Power2',
            onComplete: () => {
                [firstCell, secondCell].forEach(cell => {
                    if (cell.sprite) cell.sprite.destroy();
                    cell.visible = false;
                    cell.type = 0;
                    cell.sprite = null;
                    cell.cardBg = null;
                });
                clearPathLines(this);
            }
        });
    }

    clearSelection() {
        this.selectedCards.forEach(({ row, col }) => {
            const cell = this.board[row][col];
            if (cell.sprite) {
                cell.cardBg.setFillStyle(CARD_BG);
                cell.cardBg.setStrokeStyle(1, CARD_BORDER);
                this.tweens.add({ targets: cell.sprite, scaleX: 1, scaleY: 1, duration: 150 });
            }
        });
        this.selectedCards = [];
        clearPathLines(this);
    }

    // ===== GAME STATE =====

    checkGameComplete() {
        let remaining = 0;
        for (let row = 1; row < this.matrixHeight - 1; row++) {
            for (let col = 1; col < this.matrixWidth - 1; col++) {
                if (this.board[row][col].visible) remaining++;
            }
        }
        if (remaining === 0) {
            this.gameStarted = false;
            stopTimer(this);
            this.time.delayedCall(600, () => showCompletionScreen(this, true));
        }
    }

    startNewGame() {
        this.selectedCards = [];
        this.moves = 0;
        this.score = 0;
        this.combo = 1;
        this.lastMatchTime = 0;
        this.timeLeft = GAME_TIME;
        this.timerText.setText(`Time: ${GAME_TIME}s`);
        this.timerText.setColor('#ffffff');
        updateStats(this);
        clearPathLines(this);
        this.initializeBoard();
        startTimer(this);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
