// Enemy Entity System
import { soundFX } from '../utils/soundFX.js';
import { AlchemistPotion } from './Collectible.js';
import { EnemyProjectile } from './Projectile.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey) {
        super(scene, x, y, textureKey);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.hp = 1;
        this.isDead = false;
        this.isFrozen = false;
        this.freezeTimer = null;
        this.defaultTexture = textureKey;
        this.setDepth(10);
    }

    takeDamage(amount = 1) {
        if (this.isDead) return;
        this.hp -= amount;

        // Flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(120, () => {
            if (this.active && !this.isFrozen) this.clearTint();
        });

        if (this.hp <= 0) {
            this.die();
        }
    }

    freezeIntoPlatform(duration = 3000) {
        if (this.isDead) return;
        this.isFrozen = true;
        this.setTexture('enemy_slime_frozen');
        this.body.setVelocity(0, 0);
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.moves = false;
        this.body.checkCollision.down = true;
        this.body.checkCollision.up = true;
        this.body.checkCollision.left = true;
        this.body.checkCollision.right = true;

        if (this.freezeTimer) this.freezeTimer.remove();

        // Shaking warning before unfreezing
        this.scene.time.delayedCall(duration - 600, () => {
            if (this.active && this.isFrozen) {
                this.scene.tweens.add({
                    targets: this,
                    x: this.x + 3,
                    duration: 50,
                    yoyo: true,
                    repeat: 8
                });
            }
        });

        this.freezeTimer = this.scene.time.delayedCall(duration, () => {
            this.unfreeze();
        });
    }

    unfreeze() {
        if (!this.active || this.isDead || !this.isFrozen) return;
        this.isFrozen = false;
        this.setTexture(this.defaultTexture);
        this.body.setAllowGravity(true);
        this.body.setImmovable(false);
        this.body.moves = true;
        this.clearTint();
    }

    stomp(player) {
        if (this.isDead) return;
        if (this.isFrozen) {
            // Act as solid platform bounce
            player.body.setVelocityY(-320);
            soundFX.playJump();
            return;
        }

        soundFX.playStomp();
        player.body.setVelocityY(-280); // Mario bounce
        this.die(true);
    }

    die(fromStomp = false) {
        if (this.isDead) return;
        this.isDead = true;
        this.scene.addScore(200);

        if (window.unlockAchievement) {
            window.unlockAchievement('first_blood');
        }

        // Check if player has Alchemist class for potion drop
        if (this.scene.player && this.scene.player.metadata.class === 'Alchemist') {
            if (Math.random() < 0.65) {
                const pType = Math.random() > 0.5 ? 'speed' : 'jump';
                new AlchemistPotion(this.scene, this.x, this.y, pType);
            }
        }

        if (fromStomp) {
            this.setTexture('enemy_slime_squished');
            this.body.setVelocity(0, 0);
            this.body.setAllowGravity(false);
            this.body.checkCollision.none = true;
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                scaleY: 0.2,
                duration: 400,
                onComplete: () => this.destroy()
            });
        } else {
            // Poof particles & spin off
            this.body.checkCollision.none = true;
            this.body.setVelocity(Phaser.Math.Between(-80, 80), -200);
            this.body.setAllowGravity(true);
            this.setAngle(180);
            this.scene.tweens.add({
                targets: this,
                alpha: 0,
                duration: 500,
                onComplete: () => this.destroy()
            });

            // Smoke explosion
            const emitter = this.scene.add.particles(this.x, this.y, 'particle_smoke', {
                speed: { min: 40, max: 100 },
                lifespan: 300,
                quantity: 8,
                tint: 0x9b59b6
            });
            this.scene.time.delayedCall(350, () => emitter.destroy());
        }
    }
}

export class SlimeWalker extends Enemy {
    constructor(scene, x, y, patrolDistance = 140) {
        super(scene, x, y, 'enemy_slime_1');
        this.startX = x;
        this.patrolDistance = patrolDistance;
        this.moveSpeed = 45;
        this.direction = -1; // -1 = Left, 1 = Right

        this.body.setSize(18, 14);
        this.body.setOffset(1, 2);
        this.body.setBounce(0, 0);

        // Step animation timer
        this.animTimer = scene.time.addEvent({
            delay: 240,
            loop: true,
            callback: () => {
                if (this.active && !this.isDead && !this.isFrozen) {
                    const currentTex = this.texture.key;
                    this.setTexture(currentTex === 'enemy_slime_1' ? 'enemy_slime_2' : 'enemy_slime_1');
                }
            }
        });
    }

    update() {
        if (!this.active || this.isDead || this.isFrozen) return;

        // Patrol logic
        this.setVelocityX(this.direction * this.moveSpeed);

        if (this.x < this.startX - this.patrolDistance) {
            this.direction = 1;
            this.setFlipX(true);
        } else if (this.x > this.startX + this.patrolDistance) {
            this.direction = -1;
            this.setFlipX(false);
        }

        // Wall bump reverse
        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(true);
        } else if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(false);
        }

        if (this.y > 600) {
            this.destroy();
        }
    }

    destroy(fromScene) {
        if (this.animTimer) this.animTimer.remove();
        super.destroy(fromScene);
    }
}

export class FlyingWatcher extends Enemy {
    constructor(scene, x, y, rangeX = 120, rangeY = 40) {
        super(scene, x, y, 'enemy_eye_1');
        this.startX = x;
        this.startY = y;
        this.rangeX = rangeX;
        this.rangeY = rangeY;
        this.timeOffset = Math.random() * 1000;

        this.body.setAllowGravity(false);
        this.body.setSize(18, 16);

        // Flapping animation timer
        this.flapTimer = scene.time.addEvent({
            delay: 180,
            loop: true,
            callback: () => {
                if (this.active && !this.isDead && !this.isFrozen) {
                    const currentTex = this.texture.key;
                    this.setTexture(currentTex === 'enemy_eye_1' ? 'enemy_eye_2' : 'enemy_eye_1');
                }
            }
        });
    }

    update(time) {
        if (!this.active || this.isDead || this.isFrozen) return;

        const t = (time + this.timeOffset) * 0.002;
        this.x = this.startX + Math.sin(t) * this.rangeX;
        this.y = this.startY + Math.cos(t * 1.5) * this.rangeY;

        // Facing direction based on movement
        if (Math.cos(t) > 0) {
            this.setFlipX(false);
        } else {
            this.setFlipX(true);
        }
    }

    destroy(fromScene) {
        if (this.flapTimer) this.flapTimer.remove();
        super.destroy(fromScene);
    }
}

export class ArcaneSentry extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_sentry');
        this.hp = 2;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.body.setSize(20, 24);
        this.lastShotTime = 0;
        this.shotCooldown = 2400;
        this.detectRange = 360;
    }

    update(time) {
        if (!this.active || this.isDead || this.isFrozen) return;

        const player = this.scene.player;
        if (!player || player.isDead) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Face the player
        this.setFlipX(player.x < this.x);

        // Shoot projectile if in range and cooled down
        if (dist <= this.detectRange && time > this.lastShotTime + this.shotCooldown) {
            this.lastShotTime = time;
            this.shootDarkOrb(player);
        }
    }

    shootDarkOrb(player) {
        if (!this.active || this.isDead || !this.scene) return;

        // Charge glow flash
        this.setTint(0x00ffff);
        this.scene.time.delayedCall(160, () => {
            if (this.active && !this.isFrozen) this.clearTint();
        });

        // Compute angle towards player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const speed = 190;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        soundFX.playLaser();

        const orb = new EnemyProjectile(this.scene, this.x, this.y, vx, vy);
        if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.add(orb);
        }
    }

    die(fromStomp = false) {
        if (this.isDead) return;
        super.die(fromStomp);
        this.scene.addScore(300); // bonus score for turret
        if (window.unlockAchievement) {
            window.unlockAchievement('sentry_buster');
        }
    }
}
