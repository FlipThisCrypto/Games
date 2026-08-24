// Interactive Board Objects: Springs, Geysers, Switches, Barriers, Pots, Crumbling Blocks, and Mana Crystals
import { soundFX } from '../utils/soundFX.js';

export class SpringPad extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, boostForce = -580) {
        super(scene, x, y, 'spring_pad_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.boostForce = boostForce;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(28, 16);
        this.body.setOffset(2, 8);
        this.isCompressing = false;
    }

    bounce(player) {
        if (this.isCompressing) return;
        this.isCompressing = true;

        soundFX.playSpring();
        player.body.setVelocityY(this.boostForce);

        this.setTexture('spring_pad_active');
        this.scene.time.delayedCall(160, () => {
            if (this.active) {
                this.setTexture('spring_pad_idle');
                this.isCompressing = false;
            }
        });

        // Spring particle burst
        const burst = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 60, max: 180 },
            lifespan: 350,
            quantity: 10,
            tint: 0x9b51e0
        });
        this.scene.time.delayedCall(400, () => burst.destroy());
    }
}

export class ManaGeyser extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, height = 96) {
        super(scene, x, y, 'mana_geyser');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDisplaySize(32, height);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(28, height);
        this.setAlpha(0.75);

        // Pulsing glow tween
        scene.tweens.add({
            targets: this,
            alpha: 0.9,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    applyUpdraft(player) {
        // Smoothly elevate player upwards
        if (player.body.velocity.y > -220) {
            player.body.setVelocityY(player.body.velocity.y - 35);
        }
        if (Math.random() < 0.15) {
            soundFX.playGeyser();
        }
    }
}

export class CrystalSwitch extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, targetTag) {
        super(scene, x, y, 'crystal_switch_off');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.targetTag = targetTag;
        this.isActivated = false;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(20, 28);
    }

    activate() {
        if (this.isActivated) return;
        this.isActivated = true;

        soundFX.playSwitch();
        this.setTexture('crystal_switch_on');

        // Toggle linked barriers
        this.scene.toggleBarrierGroup(this.targetTag);

        // Flashy magic ring
        const ring = this.scene.add.circle(this.x, this.y, 8, 0x00ffff, 0.8);
        this.scene.tweens.add({
            targets: ring,
            radius: 80,
            alpha: 0,
            duration: 500,
            onComplete: () => ring.destroy()
        });
    }
}

export class BarrierBlock extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tag) {
        super(scene, x, y, 'barrier_crystal_block');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.tag = tag;
        this.isOpen = false;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.setDepth(9);
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.body.checkCollision.none = true;
            this.scene.tweens.add({
                targets: this,
                alpha: 0.1,
                scale: 0.8,
                duration: 300
            });
        } else {
            this.body.checkCollision.none = false;
            this.scene.tweens.add({
                targets: this,
                alpha: 1.0,
                scale: 1.0,
                duration: 300
            });
        }
    }
}

export class DestructiblePot extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'destructible_pot');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(true);
        this.body.setImmovable(true);
        this.body.setSize(20, 22);
        this.isDestroyed = false;
        this.setDepth(10);
    }

    smash() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        soundFX.playPotShatter();
        this.scene.addScore(150);

        // Spawn Mana Crystal or Gem
        new ManaCrystal(this.scene, this.x, this.y - 12);

        // Ceramic shards burst
        const shards = this.scene.add.particles(this.x, this.y, 'particle_smoke', {
            speed: { min: 60, max: 160 },
            lifespan: 350,
            quantity: 12,
            tint: 0xd35400
        });
        this.scene.time.delayedCall(400, () => shards.destroy());

        this.destroy();
    }
}

export class CrumblingPlatform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'crumbling_platform');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.startX = x;
        this.startY = y;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.isCrumbling = false;
        this.setDepth(8);
    }

    triggerCrumble() {
        if (this.isCrumbling) return;
        this.isCrumbling = true;

        // Shake warning
        this.scene.tweens.add({
            targets: this,
            x: this.startX + 2,
            duration: 40,
            yoyo: true,
            repeat: 12,
            onComplete: () => {
                // Drop & fade
                this.body.checkCollision.none = true;
                this.scene.tweens.add({
                    targets: this,
                    y: this.startY + 40,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        // Respawn after 3.5 seconds
                        this.scene.time.delayedCall(3500, () => {
                            if (this.active) {
                                this.x = this.startX;
                                this.y = this.startY;
                                this.alpha = 1;
                                this.body.checkCollision.none = false;
                                this.isCrumbling = false;
                            }
                        });
                    }
                });
            }
        });
    }
}

export class ManaCrystal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'mana_crystal');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(true);
        this.body.setBounce(0.5, 0.5);
        this.body.setSize(14, 14);
        this.setVelocity(Phaser.Math.Between(-50, 50), -140);
        this.setDepth(11);
        this.collected = false;

        // Bobbing & floating glow
        scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    onCollect(player) {
        if (this.collected) return;
        this.collected = true;

        soundFX.playManaCrystal();
        player.addMana(30);
        this.scene.addScore(100);

        const burst = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 40, max: 120 },
            lifespan: 300,
            quantity: 8,
            tint: 0x00ffff
        });
        this.scene.time.delayedCall(350, () => burst.destroy());

        this.destroy();
    }
}

export class SpikeHazard extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'hazard_spikes');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // static body
        this.body.setSize(30, 16);
        this.body.setOffset(1, 16);
        this.damage = 1;
    }

    onHitPlayer(player) {
        player.takeDamage(this.damage);
        // Bounce player upward slightly
        player.body.setVelocityY(-260);
    }
}

export class RuneTrap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, interval = 2200, offset = 0) {
        super(scene, x, y, 'rune_trap_idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(28, 12);
        this.body.setOffset(2, 4);

        this.isActive = false;
        this.interval = interval;

        scene.time.delayedCall(offset, () => {
            if (!this.active) return;
            this.pulseTimer = scene.time.addEvent({
                delay: this.interval,
                callback: this.triggerSurge,
                callbackScope: this,
                loop: true
            });
        });
    }

    triggerSurge() {
        if (!this.active) return;
        this.isActive = true;
        this.setTexture('rune_trap_active');
        this.body.setSize(28, 36);
        this.body.setOffset(2, 4);

        // Sound & surge particles
        soundFX.playLaser();

        const burst = this.scene.add.particles(this.x, this.y - 8, 'particle_sparkle', {
            speed: { min: 40, max: 120 },
            lifespan: 250,
            quantity: 6,
            tint: 0x00ffff
        });
        this.scene.time.delayedCall(300, () => burst.destroy());

        this.scene.time.delayedCall(900, () => {
            if (this.active) {
                this.isActive = false;
                this.setTexture('rune_trap_idle');
                this.body.setSize(28, 12);
                this.body.setOffset(2, 4);
            }
        });
    }

    onHitPlayer(player) {
        if (this.isActive) {
            player.takeDamage(1);
            player.body.setVelocityY(-240);
        }
    }
}
