import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { PikachuGame } from './scenes/PikachuGame';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: AUTO,
    width: 1200,
    height: 900,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        MainMenu,
        PikachuGame
    ]
};

const StartGame = (parent) => {
    const params = new URLSearchParams(window.location.search);
    const skipMenu = params.get('scene') === 'game';

    const gameConfig = { ...config, parent };
    if (skipMenu) {
        // Skip Boot/Menu, go directly to game (useful for debugging)
        gameConfig.scene = [Boot, Preloader, PikachuGame];
    }

    return new Game(gameConfig);
}

export default StartGame;