// Procedural Pixel Art Generator for Game 3: Tower of the Archmage

export function generateTowerTextures(scene) {
    function createTexture(key, width, height, drawFn) {
        if (scene.textures.exists(key)) return;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx);
        scene.textures.addCanvas(key, canvas);
    }

    // 1. RUNES (48x48)
    // Fire Rune
    createTexture('rune_fire', 48, 48, (ctx) => {
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(18, 14, 12, 20);
        ctx.fillRect(14, 22, 20, 12);
    });

    // Ice Rune
    createTexture('rune_ice', 48, 48, (ctx) => {
        ctx.fillStyle = '#0984e3';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#00cec9';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(22, 12, 4, 24);
        ctx.fillRect(12, 22, 24, 4);
    });

    // Arcane Rune
    createTexture('rune_arcane', 48, 48, (ctx) => {
        ctx.fillStyle = '#4a148c';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#e1bee7';
        ctx.fillRect(16, 16, 16, 16);
    });

    // Life Rune
    createTexture('rune_life', 48, 48, (ctx) => {
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(20, 14, 8, 20);
        ctx.fillRect(14, 20, 20, 8);
    });

    // Shield Rune
    createTexture('rune_shield', 48, 48, (ctx) => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#3498db';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#dff9fb';
        ctx.fillRect(14, 14, 20, 14);
        ctx.fillRect(18, 28, 12, 8);
    });

    // Skull Rune
    createTexture('rune_skull', 48, 48, (ctx) => {
        ctx.fillStyle = '#d35400';
        ctx.fillRect(4, 4, 40, 40);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(8, 8, 32, 32);
        ctx.fillStyle = '#000000';
        ctx.fillRect(14, 16, 6, 6);
        ctx.fillRect(28, 16, 6, 6);
        ctx.fillRect(18, 28, 12, 6);
    });

    // 2. BOSS SPRITES (64x64)
    createTexture('boss_golem', 64, 64, (ctx) => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(12, 12, 40, 44);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(18, 22, 10, 6);
        ctx.fillRect(36, 22, 10, 6);
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(26, 36, 12, 12);
    });

    createTexture('boss_lich', 64, 64, (ctx) => {
        ctx.fillStyle = '#1e1435';
        ctx.fillRect(14, 10, 36, 48);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(20, 20, 8, 6);
        ctx.fillRect(36, 20, 8, 6);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(22, 4, 20, 8); // Crown
    });

    createTexture('boss_dragon', 64, 64, (ctx) => {
        ctx.fillStyle = '#8e1a1a';
        ctx.fillRect(8, 14, 48, 42);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(16, 20, 8, 8);
        ctx.fillRect(40, 20, 8, 8);
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(22, 34, 20, 16);
    });
}
