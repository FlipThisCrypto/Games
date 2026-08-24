// Procedural Pixel Art Generator for Game 2: Void Survivor

export function generateSurvivorTextures(scene) {
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

    // 1. VOID DUNGEON GROUND TILE (64x64)
    createTexture('void_floor', 64, 64, (ctx) => {
        ctx.fillStyle = '#0c0714';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#160d26';
        ctx.fillRect(2, 2, 60, 60);
        // Subtle arcane grid lines
        ctx.fillStyle = '#22143a';
        ctx.fillRect(0, 0, 64, 2);
        ctx.fillRect(0, 0, 2, 64);
        // Glowing ether flecks
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.fillRect(16, 24, 2, 2);
        ctx.fillRect(48, 40, 2, 2);
    });

    // 2. 5 WIZNERD CHARACTERS (32x32)
    const wizConfigs = [
        { id: '2396', robe: '#4a148c', hat: '#c0392b', skin: '#d1c4e9', glasses: '#8e44ad' },
        { id: '1337', robe: '#0984e3', hat: '#00cec9', skin: '#dfe6e9', glasses: '#00cec9' },
        { id: '101', robe: '#d35400', hat: '#e67e22', skin: '#f5cd79', glasses: '#2ecc71' },
        { id: '512', robe: '#d63031', hat: '#e84393', skin: '#fad390', glasses: '#e84393' },
        { id: '4040', robe: '#f39c12', hat: '#f1c40f', skin: '#f7d794', glasses: '#f1c40f' }
    ];

    wizConfigs.forEach(w => {
        createTexture(`survivor_wiz_${w.id}`, 32, 32, (ctx) => {
            // Robe Body
            ctx.fillStyle = w.robe;
            ctx.fillRect(8, 14, 16, 16);
            // Hat
            ctx.fillStyle = w.hat;
            ctx.fillRect(6, 6, 20, 5);
            ctx.fillRect(10, 2, 12, 5);
            ctx.fillRect(13, 0, 6, 3);
            // Face
            ctx.fillStyle = w.skin;
            ctx.fillRect(10, 9, 12, 7);
            // Nerd Glasses
            ctx.fillStyle = '#000000';
            ctx.fillRect(9, 10, 6, 5);
            ctx.fillRect(17, 10, 6, 5);
            ctx.fillStyle = w.glasses;
            ctx.fillRect(10, 11, 4, 3);
            ctx.fillRect(18, 11, 4, 3);
            // White Glint
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(11, 12, 2, 1);
            ctx.fillRect(19, 12, 2, 1);
        });
    });

    // 3. HORDE ENEMIES (24x24 / 32x32)
    createTexture('enemy_crawler', 20, 20, (ctx) => {
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(4, 4, 12, 12);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(6, 6, 3, 3);
        ctx.fillRect(11, 6, 3, 3);
    });

    createTexture('enemy_bat', 24, 20, (ctx) => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(2, 6, 20, 8);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(8, 8, 8, 8);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(9, 10, 2, 2);
        ctx.fillRect(13, 10, 2, 2);
    });

    createTexture('enemy_brute', 32, 32, (ctx) => {
        ctx.fillStyle = '#2c0b0e';
        ctx.fillRect(4, 4, 24, 24);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(8, 8, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 10, 4, 4);
        ctx.fillRect(18, 10, 4, 4);
    });

    // 4. XP GEMS & PICKUPS (12x12)
    createTexture('gem_blue', 12, 12, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(4, 1, 4, 10);
        ctx.fillRect(1, 4, 10, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 4, 2, 2);
    });

    createTexture('gem_green', 12, 12, (ctx) => {
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(4, 1, 4, 10);
        ctx.fillRect(1, 4, 10, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 4, 2, 2);
    });

    createTexture('gem_red', 14, 14, (ctx) => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(5, 1, 4, 12);
        ctx.fillRect(1, 5, 12, 4);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(5, 5, 4, 4);
    });

    createTexture('chest_relic', 20, 18, (ctx) => {
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(2, 4, 16, 12);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(4, 2, 12, 4);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(8, 8, 4, 4);
    });

    // 5. SPELL PROJECTILES
    createTexture('spell_crystal', 14, 14, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(4, 1, 6, 12);
        ctx.fillRect(1, 4, 12, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 4, 4, 4);
    });

    createTexture('spell_fire_ball', 16, 16, (ctx) => {
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(4, 4, 8, 8);
    });

    createTexture('spell_void_spark', 14, 14, (ctx) => {
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(2, 2, 10, 10);
        ctx.fillStyle = '#fd79a8';
        ctx.fillRect(4, 4, 6, 6);
    });
}
