// Game Scene - Multi-tiered Arcane Action Level with Rich Board Mechanics
import { GAME_CONFIG } from '../config.js';
import { getWizNerdById } from '../utils/nftMetadata.js';
import { soundFX } from '../utils/soundFX.js';
import { Player } from '../entities/Player.js';
import { SlimeWalker, FlyingWatcher } from '../entities/Enemy.js';
import { ArcaneMushroom, SpellShard } from '../entities/Collectible.js';
import { SpringPad, ManaGeyser, CrystalSwitch, BarrierBlock, DestructiblePot, CrumblingPlatform, ManaCrystal, SpikeHazard, RuneTrap } from '../entities/InteractiveObjects.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.selectedWizNerdId = (data && data.wizNerdId) ? data.wizNerdId : '2396';
        this.score = 0;
        this.shardsCollected = [false, false, false];
        this.startTime = 0;
        this.levelCompleted = false;
        this.elapsedMs = 0;
        this.virtualInputs = {
            left: false,
            right: false,
            jump: false,
            justJump: false,
            attack: false,
            justDash: false
        };
    }

    create() {
        // Set World & Camera Bounds
        this.physics.world.setBounds(0, 0, GAME_CONFIG.LEVEL.WIDTH, GAME_CONFIG.LEVEL.HEIGHT + 200);
        this.cameras.main.setBounds(0, 0, GAME_CONFIG.LEVEL.WIDTH, GAME_CONFIG.LEVEL.HEIGHT);

        // Input Keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            x: Phaser.Input.Keyboard.KeyCodes.X,
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            r: Phaser.Input.Keyboard.KeyCodes.R
        });

        // Physics Groups
        this.platforms = this.physics.add.staticGroup();
        this.questionBlocks = this.physics.add.staticGroup();
        this.emptyBlocks = this.physics.add.staticGroup();
        this.spikes = this.physics.add.staticGroup();
        this.springPads = this.physics.add.staticGroup();
        this.crystalSwitches = this.physics.add.staticGroup();
        this.barriers = this.physics.add.staticGroup();
        this.pots = this.physics.add.group();
        this.crumblingPlatforms = this.physics.add.staticGroup();
        this.geysers = this.add.group();
        this.runeTraps = this.add.group();
        this.enemies = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group();
        this.collectibles = this.add.group({ runChildUpdate: true });

        // Backgrounds & Level Layout
        this.createBackgrounds();
        this.buildLevelLayout();

        // Spawn WizNerd Player
        const metadata = getWizNerdById(this.selectedWizNerdId);
        this.player = new Player(this, 80, 320, metadata);

        // Camera Follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setDeadzone(50, 50);

        // Setup Collisions
        this.setupCollisions();

        // Start Speedrun Timer & Sync HUD
        this.startTime = this.time.now;
        this.updateHUD();

        // Start BGM on scene start / first interaction
        soundFX.startBGM();
        this.input.once('pointerdown', () => {
            soundFX.init();
            soundFX.startBGM();
        });

        // Quick Restart
        this.input.keyboard.on('keydown-R', () => {
            soundFX.stopBGM();
            this.scene.restart({ wizNerdId: this.selectedWizNerdId });
        });

        window.activeGameScene = this;
    }

    createBackgrounds() {
        const width = GAME_CONFIG.LEVEL.WIDTH;

        const bgSky = this.add.graphics();
        bgSky.fillGradientStyle(0x0a0612, 0x0a0612, 0x1a0f2e, 0x2e174d, 1);
        bgSky.fillRect(0, 0, width, GAME_CONFIG.HEIGHT);
        bgSky.setScrollFactor(0);

        // Arcane Mountains
        const mountains = this.add.graphics();
        mountains.fillStyle(0x130a21, 0.75);
        for (let x = 0; x < width; x += 150) {
            mountains.beginPath();
            mountains.moveTo(x, 450);
            mountains.lineTo(x + 75, 180 + Math.sin(x * 0.05) * 50);
            mountains.lineTo(x + 150, 450);
            mountains.closePath();
            mountains.fillPath();
        }
        mountains.setScrollFactor(0.2);

        // Shimmering stars / runes
        for (let i = 0; i < 30; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(40, width - 40),
                Phaser.Math.Between(20, 220),
                Phaser.Math.Between(1, 3),
                0x00ffff,
                0.65
            );
            star.setScrollFactor(0.3);
            this.tweens.add({
                targets: star,
                alpha: 0.15,
                duration: Phaser.Math.Between(900, 2200),
                yoyo: true,
                repeat: -1
            });
        }
    }

    buildLevelLayout() {
        const T = GAME_CONFIG.LEVEL.TILE_SIZE; // 32

        // Main Ground Spans: [startX, endX]
        const groundSpans = [
            [0, 680],      // Zone 1: Entry Sanctuary
            [780, 1420],   // Zone 2: Crystal Switch & Vertical Shaft
            [1520, 2150],  // Zone 3: Mana Geyser & Crumbling Ledges
            [2280, 2900],  // Zone 4: The High Tower & Spring Gauntlet
            [3000, 3600]   // Zone 5: Grand Portal Spire
        ];

        groundSpans.forEach(([x1, x2]) => {
            for (let x = x1; x < x2; x += T) {
                const top = this.platforms.create(x + T / 2, 400 + T / 2, 'tile_ground_top');
                top.refreshBody();
                const dirt = this.platforms.create(x + T / 2, 432 + T / 2, 'tile_ground_dirt');
                dirt.refreshBody();
            }
        });

        // Spike Hazards in Chasms
        [700, 730, 1440, 1470, 2170, 2200, 2230, 2920, 2950].forEach(x => {
            const spike = this.spikes.create(x, 432, 'hazard_spikes');
            spike.refreshBody();
        });

        // 1. ELEVATED STONE PLATFORMS & WALL-JUMP TOWERS
        const stonePlatforms = [
            // Zone 1: Intro steps & High Ledge
            { x: 260, y: 320, w: 3 },
            { x: 380, y: 260, w: 4 },
            { x: 540, y: 190, w: 3 },

            // Zone 2: Vertical Shaft for Wall Jumping
            { x: 860, y: 330, w: 2 },
            { x: 960, y: 280, w: 2 },
            { x: 1040, y: 220, w: 3 },
            { x: 1180, y: 160, w: 4 }, // High treasure chamber
            { x: 1300, y: 270, w: 3 },

            // Zone 3: Geyser Ascent & Mid Cavern
            { x: 1580, y: 310, w: 3 },
            { x: 1720, y: 230, w: 4 },
            { x: 1940, y: 170, w: 3 }, // Shard 2 Ledge

            // Zone 4: Tower Staircase & Spring Drop
            { x: 2340, y: 340, w: 2 },
            { x: 2420, y: 290, w: 2 },
            { x: 2500, y: 230, w: 2 },
            { x: 2580, y: 160, w: 4 }, // Tower Summit
            { x: 2740, y: 260, w: 3 }
        ];

        stonePlatforms.forEach(p => {
            for (let i = 0; i < p.w; i++) {
                const block = this.platforms.create(p.x + i * T + T / 2, p.y + T / 2, 'tile_stone_block');
                block.refreshBody();
            }
        });

        // 2. CRUMBLING PLATFORMS (over hazard gaps)
        const crumblingPlats = [
            { x: 720, y: 340 },
            { x: 1470, y: 310 },
            { x: 2210, y: 280 },
            { x: 2950, y: 320 }
        ];
        crumblingPlats.forEach(cp => {
            const plat = new CrumblingPlatform(this, cp.x, cp.y);
            this.crumblingPlatforms.add(plat);
        });

        // 3. BOUNCY SPRING PADS
        const springs = [
            { x: 420, y: 390, force: -590 },
            { x: 1100, y: 390, force: -620 },
            { x: 2450, y: 390, force: -640 }
        ];
        springs.forEach(sp => {
            const pad = new SpringPad(this, sp.x, sp.y, sp.force);
            this.springPads.add(pad);
        });

        // 4. MANA GEYSERS (Updraft Columns)
        const geyserPositions = [
            { x: 1640, y: 330, h: 120 },
            { x: 2840, y: 300, h: 140 }
        ];
        geyserPositions.forEach(gp => {
            const geyser = new ManaGeyser(this, gp.x, gp.y, gp.h);
            this.geysers.add(geyser);
        });

        // 5. CRYSTAL SWITCHES & ENERGY BARRIERS (Platforming Puzzles)
        // Switch A unlocks barrier blocking Shard 1 at x:1200
        const switchA = new CrystalSwitch(this, 980, 252, 'groupA');
        this.crystalSwitches.add(switchA);

        // Barrier A blocking high chamber
        for (let y = 100; y < 180; y += T) {
            const b = new BarrierBlock(this, 1160, y, 'groupA');
            this.barriers.add(b);
        }

        // Switch B unlocks shortcut near end
        const switchB = new CrystalSwitch(this, 2600, 132, 'groupB');
        this.crystalSwitches.add(switchB);

        for (let y = 220; y < 300; y += T) {
            const b = new BarrierBlock(this, 2710, y, 'groupB');
            this.barriers.add(b);
        }

        // 6. DESTRUCTIBLE POTS (Containing Mana & Gems)
        const potLocations = [
            { x: 300, y: 380 },
            { x: 560, y: 170 },
            { x: 920, y: 380 },
            { x: 1240, y: 140 },
            { x: 1760, y: 210 },
            { x: 2000, y: 380 },
            { x: 2620, y: 140 },
            { x: 3200, y: 380 }
        ];
        potLocations.forEach(pt => {
            const pot = new DestructiblePot(this, pt.x, pt.y);
            this.pots.add(pot);
        });

        // 7. QUESTION '?' BLOCKS
        const qBlocks = [
            { x: 220, y: 300, item: 'mushroom' },
            { x: 360, y: 240, item: 'coin' },
            { x: 1040, y: 170, item: 'mushroom' },
            { x: 1800, y: 180, item: 'mushroom' },
            { x: 2520, y: 180, item: 'mushroom' }
        ];
        qBlocks.forEach(qb => {
            const block = this.questionBlocks.create(qb.x + T / 2, qb.y + T / 2, 'block_question');
            block.setData('item', qb.item);
            block.setData('used', false);
            block.refreshBody();
        });

        // 8. 3 SECRET SPELL SHARDS
        // Shard 0: High Ledge in Zone 1
        new SpellShard(this, 560, 140, 0);
        // Shard 1: Inside Puzzle Barrier Chamber
        new SpellShard(this, 1220, 110, 1);
        // Shard 2: Summit of the Grand Tower
        new SpellShard(this, 2620, 90, 2);

        // 9. ENEMIES
        const slimeSpawns = [
            { x: 480, y: 380, range: 70 },
            { x: 880, y: 380, range: 80 },
            { x: 1320, y: 380, range: 60 },
            { x: 1740, y: 380, range: 80 },
            { x: 2040, y: 380, range: 70 },
            { x: 2420, y: 380, range: 60 },
            { x: 3100, y: 380, range: 90 },
            { x: 3300, y: 380, range: 80 }
        ];
        slimeSpawns.forEach(s => {
            const slime = new SlimeWalker(this, s.x, s.y, s.range);
            this.enemies.add(slime);
        });

        const eyeSpawns = [
            { x: 720, y: 260, rx: 50, ry: 30 },
            { x: 1460, y: 240, rx: 60, ry: 35 },
            { x: 2200, y: 220, rx: 65, ry: 40 },
            { x: 2940, y: 230, rx: 60, ry: 35 }
        ];
        eyeSpawns.forEach(e => {
            const eye = new FlyingWatcher(this, e.x, e.y, e.rx, e.ry);
            this.enemies.add(eye);
        });

        // 10. HAZARD SPIKES & RUNE TRAPS
        const spikePits = [640, 672, 1504, 1536, 2752, 2784];
        spikePits.forEach(sx => {
            const spk = new SpikeHazard(this, sx, 416);
            this.spikes.add(spk);
        });

        const runeTrapSpawns = [
            { x: 1120, y: 250, interval: 2200, offset: 0 },
            { x: 1980, y: 280, interval: 2500, offset: 800 },
            { x: 2860, y: 150, interval: 1900, offset: 400 }
        ];
        runeTrapSpawns.forEach(rt => {
            const trap = new RuneTrap(this, rt.x, rt.y, rt.interval, rt.offset);
            this.runeTraps.add(trap);
        });

        // 11. GOAL PORTAL
        this.goalPortal = this.physics.add.staticSprite(3450, 360, 'portal_gate');
        this.goalPortal.refreshBody();

        this.add.particles(3450, 360, 'particle_sparkle', {
            speed: { min: 20, max: 60 },
            scale: { start: 1, end: 0 },
            lifespan: 600,
            frequency: 100,
            tint: 0x9b51e0
        });
    }

    setupCollisions() {
        // Player Collisions
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.emptyBlocks);
        this.physics.add.collider(this.player, this.barriers);
        this.physics.add.collider(this.player, this.pots);

        // Player vs Crumbling Platforms
        this.physics.add.collider(this.player, this.crumblingPlatforms, (player, plat) => {
            if (player.body.touching.down && plat.body.touching.up) {
                plat.triggerCrumble();
            }
        });

        // Player vs Spring Pads
        this.physics.add.collider(this.player, this.springPads, (player, pad) => {
            if (player.body.touching.down && pad.body.touching.up) {
                pad.bounce(player);
            }
        });

        // Player vs Question Blocks
        this.physics.add.collider(this.player, this.questionBlocks, (player, block) => {
            if (player.body.touching.up || player.body.blocked.up || (player.y > block.y + 10 && player.body.velocity.y <= 0)) {
                this.handleBlockHit(player, block);
            }
        });

        // Enemies vs World
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.enemies, this.emptyBlocks);
        this.physics.add.collider(this.enemies, this.questionBlocks);
        this.physics.add.collider(this.enemies, this.barriers);

        // Collectibles & Pots vs Platforms
        this.physics.add.collider(this.collectibles, this.platforms);
        this.physics.add.collider(this.pots, this.platforms);

        // Player vs Spikes
        this.physics.add.overlap(this.player, this.spikes, (player, spike) => {
            if (spike && spike.onHitPlayer) {
                spike.onHitPlayer(player);
            } else {
                player.takeDamage();
            }
        });

        // Player vs Rune Traps
        this.physics.add.overlap(this.player, this.runeTraps, (player, trap) => {
            if (trap && trap.onHitPlayer) {
                trap.onHitPlayer(player);
            }
        });

        // Player vs Enemies
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (player.isDead || enemy.isDead) return;

            if (enemy.isFrozen) {
                if (player.body.velocity.y > 0 && player.y + 10 < enemy.y) {
                    player.body.setVelocityY(-260);
                    soundFX.playJump();
                }
                return;
            }

            const playerBottom = player.y + player.height / 2;
            if (player.body.velocity.y > 20 && playerBottom < enemy.y + 6) {
                enemy.stomp(player);
            } else {
                player.takeDamage();
            }
        });

        // Projectiles vs World & Objects
        this.physics.add.collider(this.projectiles, this.platforms, (proj, p) => proj.onHitTile(p));
        this.physics.add.collider(this.projectiles, this.emptyBlocks, (proj, b) => proj.onHitTile(b));
        this.physics.add.collider(this.projectiles, this.questionBlocks, (proj, b) => proj.onHitTile(b));
        this.physics.add.overlap(this.projectiles, this.enemies, (proj, e) => proj.onHitEnemy(e));

        // Projectiles vs Crystal Switches (activates switch on spell hit!)
        this.physics.add.overlap(this.projectiles, this.crystalSwitches, (proj, sw) => {
            sw.activate();
            proj.explode();
        });

        // Projectiles vs Destructible Pots
        this.physics.add.overlap(this.projectiles, this.pots, (proj, pot) => {
            pot.smash();
            proj.explode();
        });

        // Player vs Switches (activating by touch/walking into)
        this.physics.add.overlap(this.player, this.crystalSwitches, (player, sw) => {
            sw.activate();
        });

        // Player vs Collectibles
        this.physics.add.overlap(this.player, this.collectibles, (player, item) => {
            if (item.onCollect) item.onCollect(player);
        });

        // Player vs Goal
        this.physics.add.overlap(this.player, this.goalPortal, () => {
            this.handleLevelVictory();
        });
    }

    toggleBarrierGroup(tag) {
        this.barriers.getChildren().forEach(b => {
            if (b.tag === tag) b.toggle();
        });
    }

    handleBlockHit(player, block) {
        if (block.getData('used')) return;
        block.setData('used', true);

        soundFX.playBlockBump();

        this.tweens.add({
            targets: block,
            y: block.y - 8,
            duration: 80,
            yoyo: true,
            onComplete: () => {
                block.setTexture('block_empty');
            }
        });

        const itemType = block.getData('item');
        if (itemType === 'mushroom') {
            const mushroom = new ArcaneMushroom(this, block.x, block.y);
            this.collectibles.add(mushroom);
        } else {
            this.addScore(200);
            soundFX.playShardCollect();
            const ptText = this.add.text(block.x, block.y - 20, '+200', {
                fontFamily: '"Courier New", monospace',
                fontSize: '14px',
                color: '#ffd700',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.tweens.add({
                targets: ptText,
                y: ptText.y - 24,
                alpha: 0,
                duration: 600,
                onComplete: () => ptText.destroy()
            });
        }
    }

    onCollectShard(index) {
        this.shardsCollected[index] = true;
        this.addScore(1000);
        this.updateHUD();
    }

    addScore(amount) {
        this.score += amount;
        this.updateHUD();
    }

    handleLevelVictory() {
        if (this.levelCompleted) return;
        this.levelCompleted = true;

        soundFX.playVictory();
        this.player.setVelocity(0, 0);
        this.player.body.setAllowGravity(false);

        for (let i = 0; i < 6; i++) {
            this.time.delayedCall(i * 180, () => {
                const emitter = this.add.particles(3450 + Phaser.Math.Between(-50, 50), 300 + Phaser.Math.Between(-50, 50), 'particle_sparkle', {
                    speed: { min: 100, max: 280 },
                    lifespan: 600,
                    quantity: 20,
                    tint: [0x00ffff, 0xffeb3b, 0x9b51e0, 0x2ecc71]
                });
                this.time.delayedCall(700, () => emitter.destroy());
            });
        }

        soundFX.stopBGM();
        if (window.onGameVictory) {
            window.onGameVictory({
                time: this.elapsedMs,
                score: this.score,
                shards: this.shardsCollected.filter(Boolean).length,
                wizNerd: this.player.metadata
            });
        }
    }

    onPlayerDied() {
        soundFX.stopBGM();
        if (window.onGameOver) {
            window.onGameOver({
                score: this.score,
                wizNerd: this.player.metadata
            });
        }
    }

    changeWizNerd(wizNerdId) {
        this.selectedWizNerdId = wizNerdId;
        const newMeta = getWizNerdById(wizNerdId);
        if (this.player) {
            this.player.setMetadata(newMeta);
            this.updateHUD();
        }
    }

    updateHUD() {
        if (window.updateGameHUD && this.player) {
            window.updateGameHUD({
                time: this.elapsedMs,
                score: this.score,
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                mana: Math.floor(this.player.mana),
                maxMana: this.player.maxMana,
                chargeRatio: this.player.chargeRatio,
                shards: this.shardsCollected,
                metadata: this.player.metadata
            });
        }
    }

    update(time, delta) {
        if (!this.levelCompleted && !this.player.isDead) {
            this.elapsedMs += delta;
            this.player.handleInput(this.cursors, this.keys, time);

            // Check Mana Geysers
            this.geysers.getChildren().forEach(g => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), g.getBounds())) {
                    g.applyUpdraft(this.player);
                }
            });

            // Update HUD
            this.updateHUD();

            // Bottomless pit check
            if (this.player.y > GAME_CONFIG.LEVEL.HEIGHT + 60) {
                this.player.die();
            }
        }
    }
}
