// Shadow Pet Familiar Entity (Companion for WizNerd #1337)
import { soundFX } from '../utils/soundFX.js';
import { Projectile } from './Projectile.js';

export class Familiar extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, player) {
        super(scene, player.x - 16, player.y - 20, 'shadow_pet');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.player = player;
        this.body.setAllowGravity(false);
        this.setDepth(22);
        this.lastAttackTime = 0;
        this.attackCooldown = 1100;

        // Bobbing & floating tween
        scene.tweens.add({
            targets: this,
            scaleX: 1.15,
            scaleY: 0.9,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    update(time) {
        if (!this.player || !this.player.active || this.player.isDead) {
            this.destroy();
            return;
        }

        // Smoothly follow player shoulder with smooth lerp
        const targetX = this.player.x + (this.player.facing * -14);
        const targetY = this.player.y - 18 + Math.sin(time * 0.005) * 4;

        this.x = Phaser.Math.Linear(this.x, targetX, 0.12);
        this.y = Phaser.Math.Linear(this.y, targetY, 0.12);
        this.setFlipX(this.player.facing < 0);

        // Auto-attack nearest enemy within 180px
        if (time > this.lastAttackTime + this.attackCooldown) {
            this.checkForTarget(time);
        }
    }

    checkForTarget(time) {
        let nearestEnemy = null;
        let minDistance = 200;

        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy.active && !enemy.isDead) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestEnemy = enemy;
                }
            }
        });

        if (nearestEnemy) {
            this.lastAttackTime = time;
            soundFX.playShoot('shadow_bolt');

            const dir = (nearestEnemy.x > this.x) ? 1 : -1;
            const proj = new Projectile(this.scene, this.x, this.y, 'shadow_bolt', dir, {
                speedX: 380,
                speedY: 0,
                damage: 1
            });
            this.scene.projectiles.add(proj);
        }
    }
}
