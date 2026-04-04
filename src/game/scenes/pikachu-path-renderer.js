// Path drawing utilities for connection lines between matched/mismatched cells

import { BOARD_WIDTH, BOARD_X, BOARD_Y, CARD_W, CARD_H } from './pikachu-game-config.js';

/**
 * Convert matrix coordinates (row, col) to screen pixel position.
 */
export function matrixToScreen(row, col) {
    const baseX = BOARD_X - (BOARD_WIDTH * CARD_W) / 2 + CARD_W / 2;
    return {
        x: baseX + (col - 1) * CARD_W,
        y: BOARD_Y + (row - 1) * CARD_H
    };
}

/**
 * Clear all path line graphics from the scene.
 */
export function clearPathLines(scene) {
    scene.pathLines.forEach(obj => { if (obj?.destroy) obj.destroy(); });
    scene.pathLines = [];
}

/**
 * Draw a glowing connection path between points.
 * Renders three layers: thick glow, thin core line, and endpoint dots.
 */
export function drawPath(scene, path, color) {
    clearPathLines(scene);
    if (!path || path.length < 2) return;

    // Glow layer (thick, semi-transparent)
    const glow = scene.add.graphics().setDepth(5).setAlpha(0);
    glow.lineStyle(8, color, 0.3);
    const g0 = matrixToScreen(path[0].row, path[0].col);
    glow.moveTo(g0.x, g0.y);
    for (let i = 1; i < path.length; i++) {
        const p = matrixToScreen(path[i].row, path[i].col);
        glow.lineTo(p.x, p.y);
    }
    glow.strokePath();
    scene.pathLines.push(glow);

    // Core line (thin, bright)
    const core = scene.add.graphics().setDepth(6).setAlpha(0);
    core.lineStyle(3, color, 1);
    core.moveTo(g0.x, g0.y);
    for (let i = 1; i < path.length; i++) {
        const p = matrixToScreen(path[i].row, path[i].col);
        core.lineTo(p.x, p.y);
    }
    core.strokePath();
    scene.pathLines.push(core);

    // Endpoint dots
    const dots = scene.add.graphics().setDepth(7).setAlpha(0);
    const pEnd = matrixToScreen(path[path.length - 1].row, path[path.length - 1].col);
    [g0, pEnd].forEach(pt => {
        dots.fillStyle(color, 1);
        dots.fillCircle(pt.x, pt.y, 5);
    });
    scene.pathLines.push(dots);

    // Fade in all layers
    scene.tweens.add({ targets: [glow, core, dots], alpha: 1, duration: 120 });
}
