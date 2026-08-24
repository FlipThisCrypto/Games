// Survivor Player Entity
import { SURVIVOR_CONFIG } from '../config.js';
import { soundFX } from '../utils/soundFX.js';
import { SurvivorFamiliar } from './SurvivorFamiliar.js';

export class SurvivorPlayer extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, metadata) {
        super(scene, x, y, `survivor_wiz_${metadata.id}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.metadata = metadata;
        this.maxHp = metadata.baseHp || SURVIVOR_CONFIG.PLAYER.BASE_HP;
        this.hp = this.maxHp;
        this.speed = SURVIVOR_CONFIG.PLAYER.BASE_SPEED * (metadata.speedMult || 1.0);
        this.pickupRadius = SURVIVOR_CONFIG.PLAYER.BASE_PICKUP_RADIUS * (metadata.id === '4040' ? 1.5 : 1.0);

        this.level = 1;
        this.xp = 0;
        this.nextXp = 100;
        this.isDead = false;

        // Active Spells Inventory
        this.spells = {
            crystal: { level: metadata.startWeapon === 'CRYSTAL_ORB' ? 1 : (metadata.id === '2396' ? 2 : 0), timer: 0 },
            fireRing: { level: metadata.startWeapon === 'FIRE_RING' ? 1 : 0, timer: 0 },
            voidNova: { level: metadata.startWeapon === 'VOID_NOVA' ? 1 : 0, timer: 0 },
            lightning: { level: metadata.startWeapon === 'LIGHTNING_STRIKE' ? 1 : 0, timer: 0 }
        };

        // Orbiting Crystal Visuals
        this.orbitAngle = 0;
        this.orbitSprites = [];

        // Autonomous Familiar Pet
        this.familiar = (metadata.id === '1337') ? new SurvivorFamiliar(scene, this) : null;

        this.body.setSize(20, 24);
        this.body.setOffset(6, 4);
        this.body.setCollideWorldBounds(true);
        this.setDepth(20);

        this.initOrbitals();
    }

    initOrbitals() {
        this.orbitSprites.forEach(s => s.destroy());
        this.orbitSprites = [];

        const count = this.spells.crystal.level > 0 ? (this.spells.crystal.level + 1) : 0;
        for (let i = 0; i < count; i++) {
            const spr = this.scene.physics.add.sprite(this.x, this.y, 'spell_crystal');
            spr.body.setAllowGravity(false);
            spr.body.setImmovable(true);
            spr.damage = 25 + (this.spells.crystal.level * 10);
            this.orbitSprites.push(spr);
        }
    }

    addXp(amount) {
        if (this.isDead) return;
        soundFX.playXpGem();
        this.xp += amount;

        if (this.xp >= this.nextXp) {
            this.levelUp();
        }
        this.scene.updateHUD();
    }

    levelUp() {
        this.level++;
        this.xp -= this.nextXp;
        this.nextXp = Math.floor(this.nextXp * 1.35);
        this.hp = Math.min(this.maxHp, this.hp + 25);

        soundFX.playLevelUp();
        this.scene.showLevelUpModal();
    }

    upgradeSpell(type) {
        if (this.spells[type]) {
            this.spells[type].level++;
            if (type === 'crystal') this.initOrbitals();
        }
    }

    takeDamage(amount = 10) {
        if (this.isDead) return;
        this.hp -= amount;
        soundFX.playHit();

        this.setTint(0xff0000);
        this.scene.time.delayedCall(120, () => {
            if (this.active) this.clearTint();
        });

        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.orbitSprites.forEach(s => s.destroy());
            this.scene.onGameOver();
        }
        this.scene.updateHUD();
    }

    updateMovement(cursors, keys, vInputs = {}) {
        if (this.isDead) return;

        let vx = 0;
        let vy = 0;

        if (cursors.left.isDown || keys.a.isDown || vInputs.left) vx -= 1;
        if (cursors.right.isDown || keys.d.isDown || vInputs.right) vx += 1;
        if (cursors.up.isDown || keys.w.isDown || vInputs.up) vy -= 1;
        if (cursors.down.isDown || keys.s.isDown || vInputs.down) vy += 1;

        if (vx !== 0 && vy !== 0) {
            vx *= 0.7071;
            vy *= 0.7071;
        }

        this.setVelocity(vx * this.speed, vy * this.speed);

        if (vx < 0) this.setFlipX(true);
        else if (vx > 0) this.setFlipX(false);

        // Update Orbiting Crystals
        this.orbitAngle += 0.045;
        const radius = 65;
        this.orbitSprites.forEach((spr, idx) => {
            const angle = this.orbitAngle + (idx * (Math.PI * 2 / this.orbitSprites.length));
            spr.x = this.x + Math.cos(angle) * radius;
            spr.y = this.y + Math.sin(angle) * radius;
        });

        // Update Familiar
        if (this.familiar && this.familiar.active) {
            this.familiar.update(this.scene.time.now);
        }
    }
}
