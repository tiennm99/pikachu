import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { BTN_RADIUS } from './pikachu-game-config.js';

function drawBtnShape(gfx, w, h, radius, color) {
    gfx.clear();
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
}

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0d0d2b);
        this.cameras.main.fadeIn(500);

        const bg = this.add.image(600, 450, 'background');
        bg.setDisplaySize(1200, 900).setAlpha(0.08);

        // Title — entrance: scale from small + fade
        const title = this.add.text(600, 270, 'Pikachu', {
            fontFamily: 'Arial Black', fontSize: 72, color: '#FFD700',
            stroke: '#0d0d2b', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setAlpha(0).setScale(0.6);

        this.tweens.add({
            targets: title, alpha: 1, scale: 1,
            duration: 700, ease: 'Back.easeOut'
        });

        // Subtitle — slide up + fade
        const subtitle = this.add.text(600, 345, 'Emoji Matching', {
            fontFamily: 'Arial', fontSize: 28, color: '#ecf0f1', align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: subtitle, alpha: 1, y: { from: 365, to: 345 },
            duration: 500, delay: 300, ease: 'Power2'
        });

        // Description
        const desc = this.add.text(600, 395, 'Match pairs using I, L, U, or Z shaped paths', {
            fontFamily: 'Arial', fontSize: 16, color: '#7f8c8d', align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: desc, alpha: 0.9, duration: 500, delay: 550 });

        // Rounded start button
        const bw = 240, bh = 55, br = BTN_RADIUS;
        const btnGfx = this.add.graphics().setPosition(600, 490).setAlpha(0);
        drawBtnShape(btnGfx, bw, bh, br, 0x27ae60);
        btnGfx.setInteractive(
            new Phaser.Geom.Rectangle(-bw / 2, -bh / 2, bw, bh),
            Phaser.Geom.Rectangle.Contains
        );
        btnGfx.input.cursor = 'pointer';

        const btnText = this.add.text(600, 490, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 22, color: '#ffffff', align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [btnGfx, btnText], alpha: 1,
            duration: 400, delay: 750, ease: 'Power2'
        });

        btnGfx.on('pointerover', () => {
            drawBtnShape(btnGfx, bw, bh, br, 0x2ecc71);
            this.tweens.add({ targets: [btnGfx, btnText], scaleX: 1.06, scaleY: 1.06, duration: 150, ease: 'Power2' });
        });
        btnGfx.on('pointerout', () => {
            drawBtnShape(btnGfx, bw, bh, br, 0x27ae60);
            this.tweens.add({ targets: [btnGfx, btnText], scaleX: 1, scaleY: 1, duration: 150, ease: 'Power2' });
        });
        btnGfx.on('pointerdown', () => {
            drawBtnShape(btnGfx, bw, bh, br, 0x229954);
            this.tweens.add({ targets: [btnGfx, btnText], scaleX: 0.95, scaleY: 0.95, duration: 80, ease: 'Power2' });
        });
        btnGfx.on('pointerup', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(400, () => this.scene.start('PikachuGame'));
        });

        // Subtle floating title glow
        this.tweens.add({
            targets: title, alpha: { from: 1, to: 0.85 },
            duration: 2000, yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut', delay: 1000
        });

        EventBus.emit('current-scene-ready', this);
    }
}
