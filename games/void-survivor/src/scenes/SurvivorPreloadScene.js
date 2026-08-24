// Preload Scene for Game 2: Void Survivor
import { generateSurvivorTextures } from '../utils/textureGenerator.js';

export class SurvivorPreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SurvivorPreloadScene' });
    }

    preload() {
        // Load official avatars for UI
        this.load.image('avatar_2396', './assets/avatars/wiznerd_crimson_staff.png');
        this.load.image('avatar_1337', './assets/avatars/wiznerd_blue_pet.png');
        this.load.image('avatar_101', './assets/avatars/wiznerd_orange.png');
        this.load.image('avatar_512', './assets/avatars/wiznerd_pink.png');
        this.load.image('avatar_4040', './assets/avatars/wiznerd_gold.png');
    }

    create() {
        generateSurvivorTextures(this);
        this.scene.start('SurvivorGameScene');
    }
}
