// Autonomous Shadow Pet Familiar for Game 2: Void Survivor
import { soundFX } from '../utils/soundFX.js';

export class SurvivorFamiliar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, player) {
        super(scene, player.x, player.y - 30, 'spell_void_spark');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.body.setAllowGravity(false);
        this.setDepth(22);
        this.setTint(0x00ffff);

        this.orbitAngle = 0;
        this.lastShotTime = 0;
        this.shotCooldown = 850;
        this.range = 360;

        // Hover bobbing tween
        scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 0.8,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    update(time) {
        if (!this.active || !this.player || this.player.isDead) return;

        // Orbit around player
        this.orbitAngle += 0.04;
        const targetX = this.player.x + Math.cos(this.orbitAngle) * 45;
        const targetY = this.player.y + Math.sin(this.orbitAngle) * 45 - 10;

        this.x = Phaser.Math.Linear(this.x, targetX, 0.15);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.15);

        // Find nearest enemy and attack
        if (time > this.lastShotTime + this.shotCooldown) {
            this.lastShotTime = time;
            this.shootNearestEnemy();
        }
    }

    shootNearestEnemy() {
        let nearest = null;
        let minDist = this.range;

        this.scene.enemies.getChildren().forEach(e => {
            if (e.active && !e.isDead) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = e;
                }
            }
        });

        if (nearest) {
            soundFX.playHit();
            const angle = Phaser.Math.Angle.Between(this.x, this.y, nearest.x, nearest.y);
            const speed = 320;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const dart = this.scene.physics.add.sprite(this.x, this.y, 'spell_crystal');
            dart.setTint(0x9b51e0);
            dart.body.setAllowGravity(false);
            dart.setVelocity(vx, vy);

            this.scene.time.delayedCall(1200, () => {
                if (dart.active) dart.destroy();
            });

            this.scene.physics.add.overlap(dart, this.scene.enemies, (d, enemy) => {
                if (!enemy.isDead) {
                    enemy.takeDamage(40);
                    d.destroy();
                }
            });
        }
    }
}
