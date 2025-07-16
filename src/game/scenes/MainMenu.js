import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo').setDepth(100);

        this.title = this.add.text(512, 380, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add Pikachu Game button
        const pikachuBtn = this.add.rectangle(512, 480, 200, 50, 0x3498db)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('PikachuGame'))
            .on('pointerover', () => pikachuBtn.setFillStyle(0x2980b9))
            .on('pointerout', () => pikachuBtn.setFillStyle(0x3498db));

        this.add.text(512, 480, 'Play Pikachu Game', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add Demo Game button
        const demoBtn = this.add.rectangle(512, 550, 200, 50, 0xe74c3c)
            .setInteractive()
            .on('pointerdown', () => this.changeScene())
            .on('pointerover', () => demoBtn.setFillStyle(0xc0392b))
            .on('pointerout', () => demoBtn.setFillStyle(0xe74c3c));

        this.add.text(512, 550, 'Demo Game', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }
    
    changeScene ()
    {
        if (this.logoTween)
        {
            this.logoTween.stop();
            this.logoTween = null;
        }

        this.scene.start('Game');
    }

    moveLogo (reactCallback)
    {
        if (this.logoTween)
        {
            if (this.logoTween.isPlaying())
            {
                this.logoTween.pause();
            }
            else
            {
                this.logoTween.play();
            }
        } 
        else
        {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    if (reactCallback)
                    {
                        reactCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y)
                        });
                    }
                }
            });
        }
    }
}