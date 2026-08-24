// Projectile Entity System - Standard & Charged Spells
import { soundFX } from '../utils/soundFX.js';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, direction, config = {}) {
        let tex = 'proj_fireball';
        if (type === 'crystal_laser') tex = 'proj_crystal_laser';
        else if (type === 'mega_crystal_beam') tex = 'proj_mega_beam';
        else if (type === 'shadow_bolt') tex = 'proj_shadow_bolt';
        else if (type === 'void_nova') tex = 'proj_void_nova';
        else if (type === 'inferno_blast') tex = 'proj_inferno_blast';
        else if (type === 'root_bolt') tex = 'proj_root_bolt';
        else if (type === 'alchemy_bolt') tex = 'proj_alchemy_bolt';

        super(scene, x, y, tex);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.projType = type;
        this.direction = direction;
        this.config = config;
        this.damage = config.damage || 1;
        this.bounces = 0;
        this.maxBounces = config.bouncesMax || 0;
        this.isPiercing = (type === 'mega_crystal_beam' || type === 'void_nova');

        this.setDepth(18);
        this.initPhysics();
    }

    initPhysics() {
        if (this.projType === 'fireball') {
            this.body.setGravityY(this.config.gravity || 700);
            this.body.setBounce(this.config.bounce || 0.85, this.config.bounce || 0.85);
            this.setVelocity(this.direction * (this.config.speedX || 340), this.config.speedY || -180);
            this.body.setSize(10, 10);
            this.scene.tweens.add({
                targets: this,
                angle: this.direction * 360,
                duration: 400,
                repeat: -1
            });
        } else if (this.projType === 'inferno_blast') {
            this.body.setAllowGravity(false);
            this.setVelocityX(this.direction * 380);
            this.body.setSize(22, 22);
            this.scene.tweens.add({
                targets: this,
                angle: this.direction * 360,
                duration: 300,
                repeat: -1
            });
        } else if (this.projType === 'crystal_laser' || this.projType === 'mega_crystal_beam') {
            this.body.setAllowGravity(false);
            this.setVelocityX(this.direction * (this.config.speedX || 520));
            this.setFlipX(this.direction < 0);
        } else if (this.projType === 'void_nova') {
            this.body.setAllowGravity(false);
            this.setVelocityX(this.direction * 260);
            this.scene.tweens.add({
                targets: this,
                scale: 1.3,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        } else {
            // Linear magic projectile
            this.body.setAllowGravity(false);
            this.setVelocityX(this.direction * (this.config.speedX || 400));
            this.setFlipX(this.direction < 0);
        }

        // Auto expire after 3.5 seconds
        this.scene.time.delayedCall(3500, () => {
            if (this.active) this.destroy();
        });
    }

    onHitTile(tile) {
        if (!this.active) return;

        if (this.projType === 'fireball') {
            this.bounces++;
            if (this.bounces > this.maxBounces || this.body.blocked.left || this.body.blocked.right) {
                this.explode();
            } else {
                this.setVelocityX(this.direction * (this.config.speedX || 340));
            }
        } else if (!this.isPiercing) {
            this.explode();
        }
    }

    onHitEnemy(enemy) {
        if (!this.active || !enemy.active || enemy.isDead) return;

        if (this.projType === 'root_bolt') {
            soundFX.playFreeze();
            enemy.freezeIntoPlatform(this.config.freezeDuration || 4000);
            if (this.scene.showCombatText) this.scene.showCombatText(enemy.x, enemy.y - 14, '❄️ FROZEN!', '#00ffff', '13px');
            this.explode();
        } else if (this.projType === 'inferno_blast') {
            enemy.takeDamage(4);
            this.createImpactParticles(0xe74c3c);
            if (this.scene.triggerScreenShake) this.scene.triggerScreenShake(0.014, 150);
            if (this.scene.triggerHitStop) this.scene.triggerHitStop(40);
            if (this.scene.showCombatText) this.scene.showCombatText(enemy.x, enemy.y - 14, '💥 INFERNO! -4', '#ff4757', '15px');
        } else if (this.projType === 'mega_crystal_beam') {
            enemy.takeDamage(3);
            this.createImpactParticles(0x00ffff);
            if (this.scene.triggerScreenShake) this.scene.triggerScreenShake(0.012, 130);
            if (this.scene.triggerHitStop) this.scene.triggerHitStop(35);
            if (this.scene.showCombatText) this.scene.showCombatText(enemy.x, enemy.y - 14, '⚡ BEAM! -3', '#00ffff', '15px');
        } else if (this.projType === 'void_nova') {
            enemy.takeDamage(3);
            this.createImpactParticles(0x9b51e0);
            if (this.scene.triggerScreenShake) this.scene.triggerScreenShake(0.012, 130);
            if (this.scene.triggerHitStop) this.scene.triggerHitStop(35);
            if (this.scene.showCombatText) this.scene.showCombatText(enemy.x, enemy.y - 14, '🌌 VOID! -3', '#a29bfe', '15px');
        } else {
            enemy.takeDamage(this.damage);
            if (this.scene.showCombatText) this.scene.showCombatText(enemy.x, enemy.y - 14, `-${this.damage}`, '#ffd700', '12px');
            if (!this.isPiercing) this.explode();
        }
    }

    explode() {
        if (!this.active) return;
        this.createImpactParticles();
        this.destroy();
    }

    createImpactParticles(customTint) {
        if (!this.scene) return;
        const tint = customTint || (this.projType.includes('fire') ? 0xff5722 : (this.projType.includes('root') ? 0x2ecc71 : 0x00ffff));
        const emitter = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 40, max: 130 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 300,
            quantity: 8,
            tint: tint
        });
        this.scene.time.delayedCall(350, () => {
            if (emitter && emitter.active) emitter.destroy();
        });
    }
}

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, velocityX, velocityY) {
        super(scene, x, y, 'enemy_dark_orb');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setAllowGravity(false);
        this.body.setSize(8, 8);
        this.setVelocity(velocityX, velocityY);
        this.setDepth(16);

        // Slow spin
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 800,
            repeat: -1
        });

        // Auto destroy after 4.5 seconds
        scene.time.delayedCall(4500, () => {
            if (this.active) this.destroy();
        });
    }

    onHitPlayer(player) {
        player.takeDamage(1);
        this.explode();
    }

    explode() {
        if (!this.active) return;
        if (this.scene) {
            const emitter = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
                speed: { min: 30, max: 90 },
                lifespan: 250,
                quantity: 6,
                tint: 0x9b51e0
            });
            this.scene.time.delayedCall(300, () => {
                if (emitter && emitter.active) emitter.destroy();
            });
        }
        this.destroy();
    }
}
