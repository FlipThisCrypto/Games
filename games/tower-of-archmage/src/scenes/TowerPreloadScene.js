// Preload Scene for Game 3: Tower of the Archmage
import { generateTowerTextures } from '../utils/textureGenerator.js';

export class TowerPreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerPreloadScene' });
    }

    preload() {
        this.load.image('avatar_2396', './assets/avatars/wiznerd_crimson_staff.png');
        this.load.image('avatar_1337', './assets/avatars/wiznerd_blue_pet.png');
        this.load.image('avatar_101', './assets/avatars/wiznerd_orange.png');
        this.load.image('avatar_512', './assets/avatars/wiznerd_pink.png');
        this.load.image('avatar_4040', './assets/avatars/wiznerd_gold.png');
    }

    create() {
        generateTowerTextures(this);
        this.scene.start('TowerBattleScene');
    }
}
