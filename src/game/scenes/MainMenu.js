import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x2c3e50);

        this.background = this.add.image(600, 450, 'background');
        this.background.setDisplaySize(1200, 900);
        this.background.setAlpha(0.3);

        // Title
        this.add.text(600, 300, 'Pikachu Card Matching', {
            fontFamily: 'Arial Black', fontSize: 48, color: '#f39c12',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(600, 360, 'Find matching pairs using I, L, U, or Z patterns', {
            fontFamily: 'Arial', fontSize: 18, color: '#ecf0f1',
            align: 'center'
        }).setOrigin(0.5);

        // Play Game button
        const playBtn = this.add.rectangle(600, 450, 250, 60, 0x27ae60)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('PikachuGame'))
            .on('pointerover', () => playBtn.setFillStyle(0x229954))
            .on('pointerout', () => playBtn.setFillStyle(0x27ae60));

        this.add.text(600, 450, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        EventBus.emit('current-scene-ready', this);
    }
}