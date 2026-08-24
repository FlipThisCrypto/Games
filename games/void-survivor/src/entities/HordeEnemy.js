// Horde Enemy Entity System for Game 2: Void Survivor
import { soundFX } from '../utils/soundFX.js';

export class HordeEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'crawler') {
        let tex = 'enemy_crawler';
        let hp = 30;
        let speed = 90;
        let xpVal = 10;
        let gemTex = 'gem_blue';

        if (type === 'bat') {
            tex = 'enemy_bat';
            hp = 20;
            speed = 135;
            xpVal = 15;
            gemTex = 'gem_blue';
        } else if (type === 'brute') {
            tex = 'enemy_brute';
            hp = 120;
            speed = 60;
            xpVal = 50;
            gemTex = 'gem_red';
        }

        super(scene, x, y, tex);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.enemyType = type;
        this.hp = hp;
        this.speed = speed;
        this.xpValue = xpVal;
        this.gemTexture = gemTex;
        this.damage = 10;
        this.isDead = false;
        this.setDepth(10);
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.hp -= amount;

        if (this.scene && this.scene.showCombatText) {
            this.scene.showCombatText(this.x, this.y - 12, `-${amount}`, '#ff4757', '11px');
        }

        // Flash white
        this.setTint(0xffffff);
        this.scene.time.delayedCall(80, () => {
            if (this.active) this.clearTint();
        });

        // Knockback away from player
        if (this.scene.player) {
            const angle = Phaser.Math.Angle.Between(this.scene.player.x, this.scene.player.y, this.x, this.y);
            this.x += Math.cos(angle) * 12;
            this.y += Math.sin(angle) * 12;
        }

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        // Spawn XP Gem
        this.scene.spawnXpGem(this.x, this.y, this.xpValue, this.gemTexture);
        this.scene.addKill();

        // Special Elite Drops
        if (this.enemyType === 'brute') {
            if (Math.random() < 0.75) {
                this.scene.spawnChestRelic(this.x, this.y);
            } else {
                this.scene.spawnMagnetOrb(this.x, this.y);
            }
        } else if (Math.random() < 0.04) {
            // Rare magnet drop from normal horde
            this.scene.spawnMagnetOrb(this.x, this.y);
        }

        // Death particle burst
        const emitter = this.scene.add.particles(this.x, this.y, 'spell_void_spark', {
            speed: { min: 30, max: 90 },
            lifespan: 200,
            quantity: 5
        });
        this.scene.time.delayedCall(220, () => emitter.destroy());

        this.destroy();
    }

    update() {
        if (this.isDead || !this.scene.player || this.scene.player.isDead) return;

        // Move towards player
        const player = this.scene.player;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);

        if (player.x < this.x) this.setFlipX(true);
        else this.setFlipX(false);
    }
}
