// UI components: buttons, stats, timer, completion screen, hint system

import {
    BOARD_X, BOARD_WIDTH, CARD_W, CARD_H, CARD_BG, CARD_BORDER,
    GAME_TIME
} from './pikachu-game-config.js';
import { clearPathLines } from './pikachu-path-renderer.js';

// ===== BUTTONS =====

export function createButton(scene, x, y, label, color, hoverColor, callback, textStyle) {
    const bg = scene.add.rectangle(x, y, 130, 38, color)
        .setInteractive({ useHandCursor: true });
    const text = scene.add.text(x, y, label, textStyle).setOrigin(0.5);

    bg.on('pointerover', () => {
        bg.setFillStyle(hoverColor);
        scene.tweens.add({ targets: [bg, text], scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    bg.on('pointerout', () => {
        bg.setFillStyle(color);
        scene.tweens.add({ targets: [bg, text], scaleX: 1, scaleY: 1, duration: 100 });
    });
    bg.on('pointerdown', () => {
        scene.tweens.add({ targets: [bg, text], scaleX: 0.95, scaleY: 0.95, duration: 60, yoyo: true });
        callback();
    });
    return { bg, text };
}

export function createAllButtons(scene) {
    const btnY = 830;
    const btnStyle = { fontFamily: 'Arial', fontSize: 15, color: '#ffffff' };

    createButton(scene, 180, btnY, 'New Game', 0xffa500, 0xff8c00, () => scene.startNewGame(), btnStyle);
    createButton(scene, 340, btnY, 'Hint', 0x3498db, 0x2980b9, () => showHint(scene), btnStyle);

    const debugBtnData = createButton(scene, 500, btnY, 'Debug: OFF', 0x8e44ad, 0x7d3c98, () => toggleDebugMode(scene), btnStyle);
    scene.debugBtn = debugBtnData.bg;
    scene.debugText = debugBtnData.text;

    createButton(scene, 900, btnY, 'Main Menu', 0x636e72, 0x515a5e, () => {
        stopTimer(scene);
        scene.cameras.main.fadeOut(300, 0, 0, 0);
        scene.time.delayedCall(300, () => scene.scene.start('MainMenu'));
    }, btnStyle);
}

// ===== TIMER =====

export function startTimer(scene) {
    stopTimer(scene);
    scene.timerEvent = scene.time.addEvent({
        delay: 1000, loop: true,
        callback: () => {
            scene.timeLeft--;
            scene.timerText.setText(`Time: ${scene.timeLeft}s`);
            scene.timerText.setColor(scene.timeLeft <= 30 ? '#ff4444' : '#ffffff');
            if (scene.timeLeft <= 0) {
                stopTimer(scene);
                scene.gameStarted = false;
                showCompletionScreen(scene, false);
            }
        }
    });
}

export function stopTimer(scene) {
    if (scene.timerEvent) { scene.timerEvent.destroy(); scene.timerEvent = null; }
}

// ===== STATS =====

export function createStatsBar(scene) {
    const statStyle = { fontFamily: 'Arial', fontSize: 15, color: '#ffffff', align: 'center' };
    scene.scoreText = scene.add.text(350, 80, 'Score: 0', statStyle).setOrigin(0.5);
    scene.timerText = scene.add.text(500, 80, `Time: ${GAME_TIME}s`, statStyle).setOrigin(0.5);
    scene.pairsText = scene.add.text(650, 80, 'Pairs: 0/80', statStyle).setOrigin(0.5);
    scene.comboText = scene.add.text(800, 80, 'Combo: x1', statStyle).setOrigin(0.5);
}

export function updateStats(scene) {
    scene.scoreText.setText(`Score: ${scene.score}`);
    scene.pairsText.setText(`Pairs: ${scene.moves}/80`);
    scene.comboText.setText(`Combo: x${scene.combo}`);
    scene.comboText.setColor(scene.combo > 1 ? '#FFD700' : '#ffffff');
}

// ===== COMPLETION SCREEN =====

export function showCompletionScreen(scene, won) {
    const overlay = scene.add.rectangle(BOARD_X, 450, 1200, 900, 0x000000, 0).setDepth(10);
    scene.tweens.add({ targets: overlay, fillAlpha: 0.7, duration: 400 });

    const title = won ? 'You Win!' : 'Time Up!';
    const titleColor = won ? '#FFD700' : '#ff4444';
    const congrats = scene.add.text(BOARD_X, 360, title, {
        fontFamily: 'Arial Black', fontSize: 52, color: titleColor,
        stroke: '#0d0d2b', strokeThickness: 6, align: 'center'
    }).setOrigin(0.5).setAlpha(0).setScale(0.5).setDepth(11);

    scene.tweens.add({
        targets: congrats, alpha: 1, scale: 1,
        duration: 600, delay: 200, ease: 'Back.easeOut'
    });

    const statsMsg = won
        ? `Score: ${scene.score} | Time left: ${scene.timeLeft}s`
        : `Score: ${scene.score} | Pairs: ${scene.moves}/80`;
    const stats = scene.add.text(BOARD_X, 430, statsMsg, {
        fontFamily: 'Arial', fontSize: 20, color: '#ecf0f1', align: 'center'
    }).setOrigin(0.5).setAlpha(0).setDepth(11);

    scene.tweens.add({ targets: stats, alpha: 1, duration: 400, delay: 600 });

    const btn = scene.add.rectangle(BOARD_X, 510, 200, 50, 0xffa500)
        .setInteractive({ useHandCursor: true }).setAlpha(0).setDepth(11);
    const btnText = scene.add.text(BOARD_X, 510, 'Play Again', {
        fontFamily: 'Arial Black', fontSize: 20, color: '#1a1a2e'
    }).setOrigin(0.5).setAlpha(0).setDepth(11);

    scene.tweens.add({ targets: [btn, btnText], alpha: 1, duration: 400, delay: 900 });

    btn.on('pointerover', () => {
        btn.setFillStyle(0xffb833);
        scene.tweens.add({ targets: [btn, btnText], scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    btn.on('pointerout', () => {
        btn.setFillStyle(0xffa500);
        scene.tweens.add({ targets: [btn, btnText], scaleX: 1, scaleY: 1, duration: 100 });
    });
    btn.on('pointerdown', () => {
        overlay.destroy(); congrats.destroy(); stats.destroy();
        btn.destroy(); btnText.destroy();
        scene.startNewGame();
    });
}

// ===== COMBO POPUP =====

export function showComboPopup(scene, x, y, points, combo) {
    const label = combo > 1 ? `+${points} x${combo}!` : `+${points}`;
    const popup = scene.add.text(x, y - 10, label, {
        fontFamily: 'Arial Black', fontSize: 18, color: '#FFD700',
        stroke: '#000000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setDepth(20);

    scene.tweens.add({
        targets: popup,
        y: y - 60, alpha: 0, scale: 1.3,
        duration: 800, ease: 'Power2',
        onComplete: () => popup.destroy()
    });
}

// ===== HINT =====

export function showHint(scene) {
    const mH = scene.matrixHeight;
    const mW = scene.matrixWidth;

    for (let r1 = 1; r1 < mH - 1; r1++) {
        for (let c1 = 1; c1 < mW - 1; c1++) {
            if (!scene.board[r1][c1].visible) continue;
            for (let r2 = 1; r2 < mH - 1; r2++) {
                for (let c2 = 1; c2 < mW - 1; c2++) {
                    if (!scene.board[r2][c2].visible) continue;
                    if (r1 === r2 && c1 === c2) continue;
                    if (scene.board[r1][c1].type !== scene.board[r2][c2].type) continue;

                    if (scene.logic.hasValidPath({ row: r1, col: c1 }, { row: r2, col: c2 })) {
                        highlightHintPair(scene, scene.board[r1][c1], scene.board[r2][c2]);
                        return;
                    }
                }
            }
        }
    }
}

function highlightHintPair(scene, cell1, cell2) {
    [cell1, cell2].forEach(cell => {
        if (!cell.sprite || !cell.cardBg) return;
        cell.cardBg.setStrokeStyle(2, 0x00ccff);
        cell.cardBg.setFillStyle(0x1a2a4e);
        scene.tweens.add({
            targets: cell.sprite,
            scaleX: 1.08, scaleY: 1.08,
            duration: 300, yoyo: true, repeat: 2,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (cell.sprite) cell.sprite.setScale(1);
                if (cell.cardBg) {
                    cell.cardBg.setFillStyle(CARD_BG);
                    cell.cardBg.setStrokeStyle(1, CARD_BORDER);
                }
            }
        });
    });
}

// ===== DEBUG =====

export function toggleDebugMode(scene) {
    scene.debugMode = !scene.debugMode;
    scene.debugText.setText(scene.debugMode ? 'Debug: ON' : 'Debug: OFF');
    scene.debugBtn.setFillStyle(scene.debugMode ? 0x27ae60 : 0x8e44ad);
    if (!scene.debugMode) clearPathLines(scene);
}
