import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.cameras.main.setBackgroundColor(0x16213e);

        this.add.text(512, 340, 'Loading...', {
            fontFamily: 'Arial', fontSize: 18, color: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5);

        this.add.rectangle(512, 384, 400, 12, 0x1a1a2e).setStrokeStyle(1, 0x2c3e50);
        const bar = this.add.rectangle(512 - 198, 384, 4, 8, 0xf1c40f);

        this.load.on('progress', (progress) => {
            bar.width = 4 + (392 * progress);
        });
    }

    preload ()
    {
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
    }

    create ()
    {
        this.scene.start('MainMenu');
    }
}
