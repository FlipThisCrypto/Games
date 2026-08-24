// Game 2: Void Survivor - Main Game Scene
import { SURVIVOR_CONFIG } from '../config.js';
import { getSurvivorWizNerdById } from '../utils/nftMetadata.js';
import { soundFX } from '../utils/soundFX.js';
import { SurvivorPlayer } from '../entities/SurvivorPlayer.js';
import { HordeEnemy } from '../entities/HordeEnemy.js';

export class SurvivorGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SurvivorGameScene' });
    }

    init(data) {
        this.selectedWizNerdId = (data && data.wizNerdId) ? data.wizNerdId : '2396';
        this.kills = 0;
        this.elapsedMs = 0;
        this.isGameOver = false;
        this.virtualInputs = { left: false, right: false, up: false, down: false };
    }

    create() {
        // World Bounds
        this.physics.world.setBounds(0, 0, SURVIVOR_CONFIG.WORLD.WIDTH, SURVIVOR_CONFIG.WORLD.HEIGHT);
        this.cameras.main.setBounds(0, 0, SURVIVOR_CONFIG.WORLD.WIDTH, SURVIVOR_CONFIG.WORLD.HEIGHT);

        // Ground Tilemap Pattern
        this.add.tileSprite(
            SURVIVOR_CONFIG.WORLD.WIDTH / 2,
            SURVIVOR_CONFIG.WORLD.HEIGHT / 2,
            SURVIVOR_CONFIG.WORLD.WIDTH,
            SURVIVOR_CONFIG.WORLD.HEIGHT,
            'void_floor'
        );

        // Input Keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Entity Groups
        this.enemies = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group();
        this.gems = this.physics.add.group();

        // Spawn Player
        const metadata = getSurvivorWizNerdById(this.selectedWizNerdId);
        this.player = new SurvivorPlayer(this, SURVIVOR_CONFIG.WORLD.WIDTH / 2, SURVIVOR_CONFIG.WORLD.HEIGHT / 2, metadata);

        // Camera Follow
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Collisions
        this.setupCollisions();

        // Enemy Wave Spawner
        this.spawnTimer = this.time.addEvent({
            delay: 800,
            callback: this.spawnEnemyWave,
            callbackScope: this,
            loop: true
        });

        // Auto Spell Timers
        this.spellTimer = this.time.addEvent({
            delay: 200,
            callback: this.processAutoSpells,
            callbackScope: this,
            loop: true
        });

        // Start BGM
        soundFX.startBGM();

        window.activeGameScene = this;
        this.updateHUD();
    }

    setupCollisions() {
        // Player vs Enemies (Contact Damage)
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            if (player.isDead || enemy.isDead) return;
            player.takeDamage(enemy.damage || 8);
        });

        // Orbiting Crystals vs Enemies
        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                if (!this.player || this.player.isDead) return;
                this.player.orbitSprites.forEach(spr => {
                    this.physics.overlap(spr, this.enemies, (s, enemy) => {
                        if (!enemy.isDead) {
                            enemy.takeDamage(s.damage || 25);
                        }
                    });
                });
            }
        });

        // Player vs XP Gems
        this.physics.add.overlap(this.player, this.gems, (player, gem) => {
            if (gem.active) {
                player.addXp(gem.xpValue || 10);
                gem.destroy();
            }
        });
    }

    spawnXpGem(x, y, xpValue, textureKey) {
        const gem = this.gems.create(x, y, textureKey);
        gem.xpValue = xpValue;
        gem.setDepth(5);
    }

    addKill() {
        this.kills++;
        this.updateHUD();
    }

    spawnEnemyWave() {
        if (this.isGameOver || !this.player || this.player.isDead) return;

        const maxEnemies = 120;
        if (this.enemies.getLength() >= maxEnemies) return;

        const elapsedSec = Math.floor(this.elapsedMs / 1000);
        const waveCount = 2 + Math.floor(elapsedSec / 20);

        for (let i = 0; i < waveCount; i++) {
            // Spawn around camera perimeter
            const angle = Math.random() * Math.PI * 2;
            const dist = 450 + Math.random() * 80;
            const spawnX = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * dist, 60, SURVIVOR_CONFIG.WORLD.WIDTH - 60);
            const spawnY = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * dist, 60, SURVIVOR_CONFIG.WORLD.HEIGHT - 60);

            let type = 'crawler';
            if (elapsedSec > 40 && Math.random() < 0.35) type = 'bat';
            if (elapsedSec > 80 && Math.random() < 0.2) type = 'brute';

            const enemy = new HordeEnemy(this, spawnX, spawnY, type);
            this.enemies.add(enemy);
        }
    }

    processAutoSpells() {
        if (this.isGameOver || !this.player || this.player.isDead) return;

        const now = this.time.now;
        const p = this.player;

        // 1. Fire Ring Spell
        if (p.spells.fireRing.level > 0 && now > p.spells.fireRing.timer + 2000) {
            p.spells.fireRing.timer = now;
            this.castFireRing(p.spells.fireRing.level);
        }

        // 2. Void Nova Spell
        if (p.spells.voidNova.level > 0 && now > p.spells.voidNova.timer + 2800) {
            p.spells.voidNova.timer = now;
            this.castVoidNova(p.spells.voidNova.level);
        }

        // 3. Lightning Strike
        if (p.spells.lightning.level > 0 && now > p.spells.lightning.timer + 2200) {
            p.spells.lightning.timer = now;
            this.castLightning(p.spells.lightning.level);
        }
    }

    castFireRing(level) {
        soundFX.playSpellCast();
        const radius = 90 + (level * 20);
        const ringEmitter = this.add.particles(this.player.x, this.player.y, 'spell_fire_ball', {
            speed: { min: 80, max: 140 },
            lifespan: 300,
            quantity: 16
        });
        this.time.delayedCall(320, () => ringEmitter.destroy());

        this.enemies.getChildren().forEach(e => {
            if (e.active && !e.isDead) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
                if (dist <= radius) {
                    e.takeDamage(35 + (level * 15));
                }
            }
        });
    }

    castVoidNova(level) {
        soundFX.playSpellCast();
        const count = 8 + (level * 2);
        for (let i = 0; i < count; i++) {
            const angle = (i * (Math.PI * 2 / count));
            const vx = Math.cos(angle) * 260;
            const vy = Math.sin(angle) * 260;

            const orb = this.physics.add.sprite(this.player.x, this.player.y, 'spell_void_spark');
            orb.body.setAllowGravity(false);
            orb.setVelocity(vx, vy);
            this.time.delayedCall(1200, () => {
                if (orb.active) orb.destroy();
            });

            this.physics.add.overlap(orb, this.enemies, (o, enemy) => {
                if (!enemy.isDead) {
                    enemy.takeDamage(50 + (level * 20));
                    o.destroy();
                }
            });
        }
    }

    castLightning(level) {
        soundFX.playSpellCast();
        // Find nearest enemy
        let nearest = null;
        let minDist = 400;
        this.enemies.getChildren().forEach(e => {
            if (e.active && !e.isDead) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = e;
                }
            }
        });

        if (nearest) {
            const lightning = this.add.rectangle(nearest.x, nearest.y - 100, 8, 200, 0x00ffff);
            this.tweens.add({
                targets: lightning,
                alpha: 0,
                duration: 250,
                onComplete: () => lightning.destroy()
            });
            nearest.takeDamage(75 + (level * 30));
        }
    }

    showLevelUpModal() {
        if (window.onSurvivorLevelUp) {
            this.scene.pause();
            window.onSurvivorLevelUp(this.player);
        }
    }

    resumeFromUpgrade() {
        this.scene.resume();
    }

    onGameOver() {
        this.isGameOver = true;
        soundFX.stopBGM();
        if (window.onSurvivorGameOver) {
            window.onSurvivorGameOver({
                time: this.elapsedMs,
                kills: this.kills,
                level: this.player.level,
                wizNerd: this.player.metadata
            });
        }
    }

    updateHUD() {
        if (window.updateSurvivorHUD && this.player) {
            window.updateSurvivorHUD({
                time: this.elapsedMs,
                kills: this.kills,
                level: this.player.level,
                hp: Math.floor(this.player.hp),
                maxHp: this.player.maxHp,
                xp: this.player.xp,
                nextXp: this.player.nextXp,
                metadata: this.player.metadata
            });
        }
    }

    update(time, delta) {
        if (this.isGameOver || !this.player || this.player.isDead) return;

        this.elapsedMs += delta;
        this.player.updateMovement(this.cursors, this.keys, this.virtualInputs);

        // Gem Magnet Pull
        this.gems.getChildren().forEach(g => {
            if (g.active) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, g.x, g.y);
                if (dist <= this.player.pickupRadius) {
                    const angle = Phaser.Math.Angle.Between(g.x, g.y, this.player.x, this.player.y);
                    g.x += Math.cos(angle) * 7;
                    g.y += Math.sin(angle) * 7;
                }
            }
        });
    }
}
