// Collectibles System: Arcane Mushroom, Spell Shards, and Alchemist Potions
import { soundFX } from '../utils/soundFX.js';

export class ArcaneMushroom extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y - 8, 'arcane_mushroom');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(12);
        this.body.setAllowGravity(false);
        this.body.setSize(18, 18);
        this.canBeCollected = false;
        this.collected = false;

        // Spawn upward animation out of block
        soundFX.playItemSpawn();
        scene.tweens.add({
            targets: this,
            y: y - 28,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                if (this.active && !this.collected) {
                    this.canBeCollected = true;
                    this.body.setAllowGravity(true);
                    this.body.setGravityY(600);
                    this.body.setBounce(0.3, 0.3);
                    this.setVelocityX(80);
                }
            }
        });
    }

    update() {
        if (!this.active || this.collected) return;

        // Reverse direction if hitting wall
        if (this.body.blocked.left) {
            this.setVelocityX(80);
        } else if (this.body.blocked.right) {
            this.setVelocityX(-80);
        }

        // Despawn if falling off world
        if (this.y > 600) {
            this.destroy();
        }
    }

    onCollect(player) {
        if (this.collected || !this.canBeCollected) return;
        this.collected = true;
        if (player.powerUp) {
            player.powerUp();
        }

        // Sparkle burst
        const emitter = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 50, max: 150 },
            lifespan: 400,
            quantity: 12,
            tint: 0x9b51e0
        });
        this.scene.time.delayedCall(450, () => emitter.destroy());

        this.destroy();
    }
}

export class SpellShard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, shardIndex) {
        super(scene, x, y, 'spell_shard');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.shardIndex = shardIndex; // 0, 1, or 2
        this.setDepth(10);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(14, 14);
        this.collected = false;

        // Bobbing & floating tween
        scene.tweens.add({
            targets: this,
            y: y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Rotation pulse
        scene.tweens.add({
            targets: this,
            scaleX: 0.8,
            scaleY: 1.15,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Ambient sparkle particle
        this.emitter = scene.add.particles(x, y, 'particle_sparkle', {
            speed: { min: 10, max: 30 },
            lifespan: 600,
            frequency: 200,
            scale: { start: 0.8, end: 0 },
            tint: 0x00ffff
        });
    }

    onCollect(player) {
        if (this.collected) return;
        this.collected = true;

        soundFX.playShardCollect();
        player.scene.onCollectShard(this.shardIndex);

        if (this.emitter) this.emitter.destroy();

        // Flashy pickup burst
        const burst = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 80, max: 200 },
            lifespan: 500,
            quantity: 16,
            tint: 0x00ffff
        });
        this.scene.time.delayedCall(550, () => burst.destroy());

        this.destroy();
    }

    destroy(fromScene) {
        if (this.emitter) this.emitter.destroy();
        super.destroy(fromScene);
    }
}

export class AlchemistPotion extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'speed') {
        const tex = (type === 'speed') ? 'potion_speed' : 'potion_jump';
        super(scene, x, y, tex);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.potionType = type; // 'speed' or 'jump'
        this.setDepth(11);
        this.body.setGravityY(500);
        this.body.setBounce(0.4, 0.4);
        this.body.setSize(14, 14);
        this.setVelocity(Phaser.Math.Between(-60, 60), -160);
        this.collected = false;

        // Auto expire in 8s if not collected
        scene.time.delayedCall(8000, () => {
            if (this.active && !this.collected) {
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => this.destroy()
                });
            }
        });
    }

    onCollect(player) {
        if (this.collected) return;
        this.collected = true;

        soundFX.playShardCollect();
        player.applyPotionBuff(this.potionType);

        if (window.unlockAchievement) {
            window.unlockAchievement('potion_master');
        }

        // Burst particles
        const burst = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 50, max: 120 },
            lifespan: 400,
            quantity: 10,
            tint: (this.potionType === 'speed') ? 0x2ecc71 : 0x3498db
        });
        this.scene.time.delayedCall(450, () => burst.destroy());

        this.destroy();
    }
}
