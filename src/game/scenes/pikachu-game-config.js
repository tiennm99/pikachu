// Board dimensions and visual constants for PikachuGame scene

export const BOARD_WIDTH = 20;
export const BOARD_HEIGHT = 8;
export const CARD_W = 52;
export const CARD_H = 52;
export const BOARD_X = 600;
export const BOARD_Y = 200;
export const GAME_TIME = 180;
export const COMBO_WINDOW = 2500;

export const CARD_BG = 0x1a1a3e;
export const CARD_BORDER = 0x333366;
export const CARD_HOVER_BG = 0x2a2a5e;
export const CARD_SELECT_BORDER = 0xffd700;
export const CARD_MISMATCH_BG = 0x4a1a1a;

export const CARD_RADIUS = 6;
export const BTN_RADIUS = 8;
export const GRID_RADIUS = 10;

export const CARD_TYPES = [
    '😀', '😂', '🥰', '😎', '🤩', '😴', '🤔', '😱',
    '🐶', '🐱', '🐸', '🦊', '🐻', '🐼', '🐨', '🦁',
    '🍎', '🍕', '🚀', '💎', '⭐', '🔥', '🦄', '🌈'
];

// Generate rounded rectangle textures for card states (called once in scene create)
export function generateCardTextures(scene) {
    const w = CARD_W - 4;
    const h = CARD_H - 4;
    const r = CARD_RADIUS;

    const states = [
        { key: 'card-normal', fill: CARD_BG, stroke: CARD_BORDER, sw: 1 },
        { key: 'card-hover', fill: CARD_HOVER_BG, stroke: 0x555588, sw: 1 },
        { key: 'card-selected', fill: 0x2a2a3e, stroke: CARD_SELECT_BORDER, sw: 2 },
        { key: 'card-mismatch', fill: CARD_MISMATCH_BG, stroke: CARD_BORDER, sw: 1 },
        { key: 'card-hint', fill: 0x1a2a4e, stroke: 0x00ccff, sw: 2 },
    ];

    for (const { key, fill, stroke, sw } of states) {
        // Skip if already generated (e.g. on New Game)
        if (scene.textures.exists(key)) continue;
        const gfx = scene.make.graphics({ add: false });
        gfx.fillStyle(fill, 1);
        gfx.fillRoundedRect(0, 0, w, h, r);
        gfx.lineStyle(sw, stroke, 1);
        gfx.strokeRoundedRect(sw / 2, sw / 2, w - sw, h - sw, r);
        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }
}

// Draw a rounded rectangle on a Graphics object (for buttons, grid border)
export function drawRoundedRect(graphics, x, y, w, h, radius, fillColor, fillAlpha = 1) {
    graphics.fillStyle(fillColor, fillAlpha);
    graphics.fillRoundedRect(x, y, w, h, radius);
}
