// Authentic WizNerdz Pixel Art & Board Mechanics Texture Generator
import { WIZNERD_PRESETS } from './nftMetadata.js';

export function generateAllTextures(scene) {
    const tm = scene.textures;

    function createTexture(key, width, height, drawFn) {
        if (tm.exists(key)) return;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, width, height);
        tm.addCanvas(key, canvas);
    }

    const hexToRgb = (hex) => {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgb(${r},${g},${b})`;
    };

    // 1. TILES & PLATFORMS
    // Grass Top Block (32x32)
    createTexture('tile_ground_top', 32, 32, (ctx) => {
        ctx.fillStyle = '#4a2810';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#3a1f0c';
        ctx.fillRect(4, 12, 8, 4);
        ctx.fillRect(18, 16, 8, 4);
        ctx.fillRect(10, 24, 6, 4);
        // Grass top
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, 0, 32, 8);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(0, 0, 32, 5);
        for (let i = 0; i < 32; i += 4) {
            ctx.fillRect(i, 5, 2, (i % 8 === 0) ? 5 : 3);
        }
        ctx.fillStyle = '#a8e6cf';
        ctx.fillRect(0, 0, 32, 2);
    });

    createTexture('tile_ground_dirt', 32, 32, (ctx) => {
        ctx.fillStyle = '#3d200a';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#2e1807';
        ctx.fillRect(2, 6, 10, 6);
        ctx.fillRect(16, 4, 12, 5);
        ctx.fillRect(8, 18, 14, 6);
        ctx.fillStyle = '#522c10';
        ctx.fillRect(4, 8, 6, 3);
    });

    createTexture('tile_stone_block', 32, 32, (ctx) => {
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#1e272e';
        ctx.fillRect(0, 0, 32, 2);
        ctx.fillRect(0, 15, 32, 2);
        ctx.fillRect(0, 30, 32, 2);
        ctx.fillRect(15, 0, 2, 15);
        ctx.fillRect(0, 15, 2, 15);
        ctx.fillRect(30, 15, 2, 15);
        // Arcane rune engravings
        ctx.fillStyle = '#636e72';
        ctx.fillRect(4, 5, 8, 2);
        ctx.fillRect(19, 5, 8, 2);
        ctx.fillRect(5, 20, 8, 2);
        ctx.fillRect(19, 20, 8, 2);
    });

    // 2. INTERACTIVE BOARD OBJECTS
    // Bouncy Spring Mushroom (32x24)
    createTexture('spring_pad_idle', 32, 24, (ctx) => {
        // Wooden base
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(6, 18, 20, 6);
        // Spring coil
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(12, 12, 8, 6);
        // Glowing Bouncy Cap
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(2, 4, 28, 8);
        ctx.fillRect(4, 2, 24, 4);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(6, 4, 4, 3);
        ctx.fillRect(22, 4, 4, 3);
        ctx.fillRect(14, 2, 4, 3);
    });

    createTexture('spring_pad_active', 32, 24, (ctx) => {
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(6, 18, 20, 6);
        // Compressed Cap
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(2, 12, 28, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 13, 20, 4);
    });

    // Mana Geyser / Updraft Stream (32x64)
    createTexture('mana_geyser', 32, 64, (ctx) => {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
        ctx.fillRect(2, 0, 28, 64);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.35)';
        ctx.fillRect(6, 0, 20, 64);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(12, 0, 8, 64);
        // Rising energy chevrons
        ctx.fillStyle = '#00ffff';
        for (let y = 8; y < 64; y += 16) {
            ctx.fillRect(10, y, 12, 2);
            ctx.fillRect(12, y - 2, 8, 2);
            ctx.fillRect(14, y - 4, 4, 2);
        }
    });

    // Crystal Switch (24x32)
    createTexture('crystal_switch_off', 24, 32, (ctx) => {
        // Pedestal
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(4, 18, 16, 14);
        ctx.fillStyle = '#636e72';
        ctx.fillRect(2, 28, 20, 4);
        // Inactive Red/Amber Crystal
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(8, 6, 8, 12);
        ctx.fillRect(6, 8, 12, 8);
        ctx.fillStyle = '#ff7675';
        ctx.fillRect(9, 7, 3, 3);
    });

    createTexture('crystal_switch_on', 24, 32, (ctx) => {
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(4, 18, 16, 14);
        ctx.fillStyle = '#636e72';
        ctx.fillRect(2, 28, 20, 4);
        // Active Glowing Cyan Crystal
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(8, 4, 8, 14);
        ctx.fillRect(6, 6, 12, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(9, 5, 4, 4);
    });

    // Barrier Forcefield Block (32x32)
    createTexture('barrier_crystal_block', 32, 32, (ctx) => {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.45)';
        ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 30, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(8, 8, 16, 2);
        ctx.fillRect(8, 22, 16, 2);
        ctx.fillRect(8, 8, 2, 16);
        ctx.fillRect(22, 8, 2, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(14, 14, 4, 4);
    });

    // Destructible Rune Pot (24x26)
    createTexture('destructible_pot', 24, 26, (ctx) => {
        ctx.fillStyle = '#d35400';
        ctx.fillRect(6, 2, 12, 4);
        ctx.fillRect(4, 6, 16, 16);
        ctx.fillRect(6, 22, 12, 4);
        // Gold Rune band
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(4, 11, 16, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 12, 4, 2);
    });

    // Crumbling Platform (32x16)
    createTexture('crumbling_platform', 32, 16, (ctx) => {
        ctx.fillStyle = '#57606f';
        ctx.fillRect(0, 0, 32, 16);
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(0, 14, 32, 2);
        // Cracks & rune
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(6, 4, 6, 2);
        ctx.fillRect(10, 6, 2, 4);
        ctx.fillRect(18, 4, 8, 2);
        ctx.fillRect(22, 6, 2, 5);
    });

    // Mana Crystal Item (16x16)
    createTexture('mana_crystal', 16, 16, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(6, 1, 4, 14);
        ctx.fillRect(3, 4, 10, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 4, 3, 4);
    });

    // Question & Empty Blocks
    createTexture('block_question', 32, 32, (ctx) => {
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(12, 6, 8, 3);
        ctx.fillRect(17, 9, 3, 4);
        ctx.fillRect(13, 13, 5, 3);
        ctx.fillRect(14, 17, 3, 2);
        ctx.fillRect(14, 21, 3, 3);
        ctx.fillStyle = '#b7770d';
        ctx.fillRect(0, 30, 32, 2);
        ctx.fillRect(30, 0, 2, 32);
    });

    createTexture('block_empty', 32, 32, (ctx) => {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(4, 4, 2, 2);
        ctx.fillRect(26, 4, 2, 2);
        ctx.fillRect(4, 26, 2, 2);
        ctx.fillRect(26, 26, 2, 2);
    });

    // Hazard Spikes & Portal
    createTexture('hazard_spikes', 32, 32, (ctx) => {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(0, 26, 32, 6);
        for (let i = 0; i < 4; i++) {
            const x = i * 8;
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x + 3, 2, 2, 4);
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(x + 2, 6, 4, 10);
            ctx.fillRect(x + 1, 16, 6, 10);
        }
    });

    createTexture('portal_gate', 32, 48, (ctx) => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(2, 4, 6, 44);
        ctx.fillRect(24, 4, 6, 44);
        ctx.fillRect(2, 0, 28, 6);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(8, 6, 16, 42);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(10, 10, 12, 34);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(13, 14, 6, 26);
    });

    // Rune Lightning Trap (32x32)
    createTexture('rune_trap_idle', 32, 16, (ctx) => {
        ctx.fillStyle = '#2d1b4e';
        ctx.fillRect(0, 8, 32, 8);
        ctx.fillStyle = '#5f27cd';
        ctx.fillRect(4, 4, 24, 4);
        ctx.fillStyle = '#341f97';
        ctx.fillRect(12, 0, 8, 4);
    });

    createTexture('rune_trap_active', 32, 40, (ctx) => {
        ctx.fillStyle = '#2d1b4e';
        ctx.fillRect(0, 32, 32, 8);
        // Crackling lightning surge
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(6, 4, 4, 28);
        ctx.fillRect(14, 0, 4, 32);
        ctx.fillRect(22, 4, 4, 28);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 8, 2, 20);
        ctx.fillRect(15, 4, 2, 24);
        ctx.fillRect(23, 8, 2, 20);
    });

    // 3. SHADOW PET FAMILIAR & SENTRY TURRET (16x16 / 24x28)
    createTexture('shadow_pet', 16, 16, (ctx) => {
        ctx.fillStyle = '#1e1435';
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillRect(4, 0, 8, 16);
        ctx.fillRect(0, 4, 16, 8);
        // Piercing yellow eyes
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(3, 6, 3, 3);
        ctx.fillRect(10, 6, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 7, 1, 1);
        ctx.fillRect(11, 7, 1, 1);
    });

    createTexture('enemy_sentry', 24, 28, (ctx) => {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(4, 16, 16, 12);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(6, 6, 12, 14);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(8, 8, 8, 4); // Glowing visor / eye
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(10, 0, 4, 6); // Horn / antenna
    });

    createTexture('enemy_dark_orb', 12, 12, (ctx) => {
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(2, 2, 8, 8);
        ctx.fillRect(4, 0, 4, 12);
        ctx.fillRect(0, 4, 12, 4);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(4, 4, 4, 4);
    });

    // 4. PROJECTILES
    createTexture('proj_crystal_laser', 18, 8, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(0, 1, 18, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, 2, 12, 4);
    });

    createTexture('proj_mega_beam', 32, 16, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(0, 0, 32, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 3, 24, 10);
    });

    createTexture('proj_shadow_bolt', 14, 14, (ctx) => {
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(2, 2, 10, 10);
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(4, 4, 6, 6);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(5, 5, 4, 4);
    });

    createTexture('proj_void_nova', 32, 32, (ctx) => {
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(4, 4, 24, 24);
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(8, 8, 16, 16);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(12, 12, 8, 8);
    });

    createTexture('proj_fireball', 14, 14, (ctx) => {
        ctx.fillStyle = '#d35400';
        ctx.fillRect(2, 2, 10, 10);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(4, 4, 6, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 5, 4, 4);
    });

    createTexture('proj_inferno_blast', 28, 28, (ctx) => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(2, 2, 24, 24);
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(6, 6, 16, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(10, 10, 8, 8);
    });

    createTexture('proj_root_bolt', 14, 14, (ctx) => {
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(2, 2, 10, 10);
        ctx.fillRect(0, 6, 14, 2);
        ctx.fillRect(6, 0, 2, 14);
        ctx.fillStyle = '#a8e6cf';
        ctx.fillRect(4, 4, 6, 6);
    });

    createTexture('proj_alchemy_bolt', 14, 8, (ctx) => {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(0, 1, 14, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3, 2, 8, 4);
    });

    // Particles
    createTexture('particle_sparkle', 6, 6, (ctx) => {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(2, 0, 2, 6);
        ctx.fillRect(0, 2, 6, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(2, 2, 2, 2);
    });

    createTexture('particle_flame', 8, 8, (ctx) => {
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(2, 2, 4, 4);
    });

    createTexture('particle_void', 8, 8, (ctx) => {
        ctx.fillStyle = '#9b51e0';
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillStyle = '#1e1435';
        ctx.fillRect(2, 2, 4, 4);
    });

    createTexture('particle_smoke', 8, 8, (ctx) => {
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(1, 1, 6, 6);
    });

    // 5. AUTHENTIC WIZNERD PIXEL ART SPRITES (28x38)
    WIZNERD_PRESETS.forEach(preset => {
        const hatCol = hexToRgb(preset.hatColor);
        const hatTrimCol = hexToRgb(preset.hatTrimColor);
        const glassesCol = hexToRgb(preset.glassesColor);
        const glassesLens = hexToRgb(preset.glassesLens);
        const eyeCol = hexToRgb(preset.eyeColor);
        const skinCol = hexToRgb(preset.skinColor);
        const robeCol = hexToRgb(preset.robeColor);
        const robeTrimCol = hexToRgb(preset.robeTrimColor);
        const beardCol = hexToRgb(preset.beardColor);

        function drawWizNerd(pose) {
            return (ctx) => {
                // 1. CROOKED TALL WIZARD HAT
                ctx.fillStyle = hatCol;
                ctx.fillRect(12, 0, 5, 3);
                ctx.fillRect(10, 3, 7, 3);
                ctx.fillRect(8, 6, 9, 3);
                ctx.fillRect(7, 9, 11, 3);
                // Broad Brim
                ctx.fillStyle = hatTrimCol;
                ctx.fillRect(2, 12, 20, 3);

                // Optional Hat Gem (for #2396)
                if (preset.hatGem) {
                    ctx.fillStyle = hexToRgb(preset.hatGem);
                    ctx.fillRect(5, 5, 4, 4);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(6, 6, 2, 2);
                }

                // 2. FACE & SKIN
                ctx.fillStyle = skinCol;
                ctx.fillRect(5, 15, 14, 8);

                // 3. THICK SQUARE NERD GLASSES
                ctx.fillStyle = glassesCol;
                // Left Frame
                ctx.fillRect(5, 16, 6, 6);
                // Right Frame
                ctx.fillRect(13, 16, 6, 6);
                // Bridge
                ctx.fillRect(10, 18, 4, 2);

                // Glasses Lenses
                ctx.fillStyle = glassesLens;
                ctx.fillRect(6, 17, 4, 4);
                ctx.fillRect(14, 17, 4, 4);

                // Pupil Dots inside lenses
                ctx.fillStyle = eyeCol;
                ctx.fillRect(8, 18, 2, 2);
                ctx.fillRect(16, 18, 2, 2);

                // 4. OPEN MOUTH
                ctx.fillStyle = '#a31525';
                ctx.fillRect(8, 22, 7, 3);

                // 5. BEARD
                ctx.fillStyle = beardCol;
                if (preset.beardType === 'white_long') {
                    // Flowing straight white beard
                    ctx.fillRect(5, 23, 14, 11);
                    ctx.fillRect(7, 34, 10, 3);
                    ctx.fillStyle = '#dfe6e9';
                    ctx.fillRect(6, 24, 2, 10);
                    ctx.fillRect(16, 24, 2, 10);
                } else {
                    // Textured brown beard
                    ctx.fillRect(5, 22, 14, 8);
                    ctx.fillRect(7, 30, 10, 3);
                    ctx.fillStyle = '#4a2f1e';
                    ctx.fillRect(6, 25, 3, 4);
                    ctx.fillRect(14, 25, 3, 4);
                }

                // 6. ROBES
                ctx.fillStyle = robeCol;
                ctx.fillRect(4, 26, 16, 10);
                ctx.fillStyle = robeTrimCol;
                ctx.fillRect(11, 26, 2, 10);

                // 7. WEAPONS / STAFF (for #2396 Crystal Staff)
                if (preset.staff === 'Obsidian Crystal Staff') {
                    // Black staff shaft
                    ctx.fillStyle = '#2d3436';
                    ctx.fillRect(22, 12, 3, 24);
                    // Glowing cyan crystal diamond head
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(20, 6, 7, 7);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(22, 8, 3, 3);
                }

                // 8. FEET & ANIMATION
                ctx.fillStyle = '#1e1435';
                if (pose === 'walk1') {
                    ctx.fillRect(4, 35, 4, 3);
                    ctx.fillRect(14, 35, 4, 2);
                } else if (pose === 'walk2') {
                    ctx.fillRect(4, 35, 4, 2);
                    ctx.fillRect(14, 35, 4, 3);
                } else if (pose === 'jump') {
                    ctx.fillRect(4, 34, 4, 3);
                    ctx.fillRect(14, 34, 4, 3);
                } else if (pose === 'attack') {
                    ctx.fillRect(4, 35, 4, 3);
                    ctx.fillRect(14, 35, 4, 3);
                    // Glowing spell charge on hand
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(21, 20, 5, 5);
                } else {
                    ctx.fillRect(4, 35, 4, 3);
                    ctx.fillRect(14, 35, 4, 3);
                }
            };
        }

        createTexture(`wiznerd_${preset.id}_idle`, 28, 38, drawWizNerd('idle'));
        createTexture(`wiznerd_${preset.id}_walk_1`, 28, 38, drawWizNerd('walk1'));
        createTexture(`wiznerd_${preset.id}_walk_2`, 28, 38, drawWizNerd('walk2'));
        createTexture(`wiznerd_${preset.id}_jump`, 28, 38, drawWizNerd('jump'));
        createTexture(`wiznerd_${preset.id}_attack`, 28, 38, drawWizNerd('attack'));
    });
}
