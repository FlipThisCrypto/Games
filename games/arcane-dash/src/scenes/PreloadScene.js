// Preload Scene - Programmatic Texture & Audio Setup
import { generateAllTextures } from '../utils/textureGenerator.js';
import { soundFX } from '../utils/soundFX.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Render loading screen text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.add.text(width / 2, height / 2 - 20, 'SUMMONING ARCANE ASSETS...', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '18px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const subText = this.add.text(width / 2, height / 2 + 20, 'Generating 8-Bit WizNerdz Pixel Textures', {
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '12px',
            color: '#a8dadc'
        }).setOrigin(0.5);

        // Generate all in-memory textures
        generateAllTextures(this);

        // Warm up sound effects on first user interaction
        this.input.keyboard.on('keydown', () => soundFX.init());
        this.input.on('pointerdown', () => soundFX.init());
    }

    create() {
        // Fade in to GameScene
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.time.delayedCall(350, () => {
            this.scene.start('GameScene');
        });
    }
}
