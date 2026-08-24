// Player Entity - WizNerd Platformer & Action Spellcaster
import { GAME_CONFIG } from '../config.js';
import { WEAPON_CONFIGS } from '../utils/nftMetadata.js';
import { soundFX } from '../utils/soundFX.js';
import { Projectile } from './Projectile.js';
import { Familiar } from './Familiar.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, metadata) {
        super(scene, x, y, `wiznerd_${metadata.id}_idle`);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.metadata = metadata;
        this.hp = 3;
        this.maxHp = 3;
        this.mana = 100;
        this.maxMana = 100;
        this.facing = 1; // 1 = Right, -1 = Left
        this.isDead = false;
        this.isInvulnerable = false;
        this.isDashing = false;
        this.isGliding = false;
        this.isAttacking = false;
        this.isWallSliding = false;

        // Double Jump (Pyromancer #101)
        this.canDoubleJump = false;

        // Attack & Spell Charging
        this.lastAttackTime = 0;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.chargeRatio = 0;

        // Dash Cooldown
        this.lastDashTime = 0;
        this.dashCooldown = GAME_CONFIG.PLAYER.DASH_COOLDOWN;

        // Potion Buffs (Alchemist #4040)
        this.speedBuff = 1.0;
        this.jumpBuff = 1.0;
        this.potionTimer = null;

        // Animation Timer
        this.walkFrameTimer = 0;
        this.currentWalkFrame = 1;

        this.setDepth(20);
        this.initPhysics();
        this.spawnFamiliarIfNeeded();
    }

    initPhysics() {
        this.body.setGravityY(GAME_CONFIG.GRAVITY);
        this.body.setCollideWorldBounds(false);
        this.body.setSize(20, 34);
        this.body.setOffset(4, 4);
    }

    spawnFamiliarIfNeeded() {
        if (this.familiar) {
            this.familiar.destroy();
            this.familiar = null;
        }
        if (this.metadata.hasPet) {
            this.familiar = new Familiar(this.scene, this);
        }
    }

    setMetadata(newMetadata) {
        this.metadata = newMetadata;
        this.setTexture(`wiznerd_${this.metadata.id}_idle`);
        this.spawnFamiliarIfNeeded();
    }

    addMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
        this.scene.updateHUD();
    }

    powerUp() {
        soundFX.playPowerUp();
        this.hp = Math.min(this.maxHp, this.hp + 1);
        this.mana = this.maxMana;
        this.scene.addScore(500);
        this.scene.showCombatText(this.x, this.y - 20, '✨ POWER UP! +500', '#00ffff', '15px');
        this.scene.triggerScreenShake(0.008, 100);
        this.scene.updateHUD();

        // Magic sparkle aura
        const aura = this.scene.add.particles(this.x, this.y, 'particle_sparkle', {
            speed: { min: 40, max: 140 },
            lifespan: 400,
            quantity: 14,
            tint: 0x00ffff
        });
        this.scene.time.delayedCall(450, () => aura.destroy());
    }

    heal(amount = 1) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.scene.showCombatText(this.x, this.y - 20, `+${amount} HP`, '#2ecc71', '14px');
        this.scene.updateHUD();
    }

    applyPotionBuff(type) {
        if (type === 'speed') {
            this.speedBuff = 1.45;
            this.scene.showCombatText(this.x, this.y - 20, '⚡ SPEED BOOST!', '#00ffff', '14px');
        } else if (type === 'jump') {
            this.jumpBuff = 1.3;
            this.scene.showCombatText(this.x, this.y - 20, '🦘 HIGH JUMP!', '#2ecc71', '14px');
        }

        if (this.potionTimer) this.potionTimer.remove();

        this.potionTimer = this.scene.time.delayedCall(6000, () => {
            this.speedBuff = 1.0;
            this.jumpBuff = 1.0;
        });
    }

    handleInput(cursors, keys, time) {
        if (this.isDead) return;

        const onGround = this.body.blocked.down || this.body.touching.down;
        const touchingWallLeft = (this.body.blocked.left || this.body.touching.left) && !onGround;
        const touchingWallRight = (this.body.blocked.right || this.body.touching.right) && !onGround;
        const touchingWall = touchingWallLeft || touchingWallRight;

        // Passive Mana Regeneration (10 per second)
        if (this.mana < this.maxMana) {
            this.mana = Math.min(this.maxMana, this.mana + 0.16);
        }

        if (onGround) {
            this.canDoubleJump = (this.metadata.id === '101'); // Pyromancer gets double jump
        }

        // Check keyboard and virtual touch inputs
        const vInputs = this.scene.virtualInputs || {};

        // 1. DASH ABILITY (Shift or X or Touch Dash)
        const dashKeyJustDown = Phaser.Input.Keyboard.JustDown(keys.shift) || Phaser.Input.Keyboard.JustDown(keys.x) || vInputs.justDash;
        if (vInputs.justDash) vInputs.justDash = false; // consume single frame touch press

        if (dashKeyJustDown && time > this.lastDashTime + this.dashCooldown && !this.isDashing) {
            this.performDash(time);
        }

        if (this.isDashing) return;

        // 2. WALL SLIDE & WALL JUMP
        if (touchingWall && this.body.velocity.y > 0) {
            this.isWallSliding = true;
            this.body.setVelocityY(Math.min(this.body.velocity.y, 80)); // Friction slow fall
        } else {
            this.isWallSliding = false;
        }

        // 3. HORIZONTAL MOVEMENT
        const moveSpeed = (keys.shift.isDown && this.metadata.id !== '2396' ? GAME_CONFIG.PLAYER.RUN_SPEED : GAME_CONFIG.PLAYER.WALK_SPEED) * this.speedBuff;

        if (cursors.left.isDown || keys.a.isDown || vInputs.left) {
            this.setVelocityX(-moveSpeed);
            this.facing = -1;
            this.setFlipX(true);
        } else if (cursors.right.isDown || keys.d.isDown || vInputs.right) {
            this.setVelocityX(moveSpeed);
            this.facing = 1;
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // 4. JUMP, WALL-JUMP, DOUBLE-JUMP, & GLIDE
        const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(keys.w) || Phaser.Input.Keyboard.JustDown(keys.space) || vInputs.justJump;
        const jumpHeld = cursors.up.isDown || keys.w.isDown || keys.space.isDown || vInputs.jump;
        if (vInputs.justJump) vInputs.justJump = false;

        if (jumpPressed) {
            if (onGround) {
                // Standard Ground Jump
                this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_FORCE * this.jumpBuff);
                soundFX.playJump();
            } else if (this.isWallSliding) {
                // Wall Kick
                const wallDir = touchingWallLeft ? 1 : -1;
                this.setVelocity(wallDir * 240, GAME_CONFIG.PLAYER.JUMP_FORCE * 0.9);
                this.facing = wallDir;
                this.setFlipX(wallDir < 0);
                soundFX.playWallJump();
            } else if (this.canDoubleJump) {
                // Flame Double Jump
                this.canDoubleJump = false;
                this.setVelocityY(GAME_CONFIG.PLAYER.JUMP_FORCE * 0.95);
                soundFX.playDoubleJump();
                this.emitFlameBurst();
            }
        }

        // Variable jump height
        if (!jumpHeld && this.body.velocity.y < -120) {
            this.setVelocityY(this.body.velocity.y * 0.65);
        }

        // WIND / LEAF GLIDE (for #1337 and #512)
        if ((this.metadata.id === '1337' || this.metadata.id === '512') && !onGround && this.body.velocity.y > 30 && jumpHeld) {
            this.body.setGravityY(GAME_CONFIG.PLAYER.GLIDE_GRAVITY);
            this.isGliding = true;
            if (Math.random() < 0.2) {
                this.emitGlideParticle();
            }
        } else {
            this.body.setGravityY(GAME_CONFIG.GRAVITY);
            this.isGliding = false;
        }

        // 5. ATTACK & SPELL CHARGING (Z or Mouse Click or Touch Attack)
        const attackKey = keys.z;
        const pointer = this.scene.input.activePointer;
        const isAttackDown = attackKey.isDown || pointer.isDown || vInputs.attack;

        if (isAttackDown) {
            if (!this.isCharging) {
                this.isCharging = true;
                this.chargeStartTime = time;
            }
            const elapsedCharge = time - this.chargeStartTime;
            this.chargeRatio = Math.min(1.0, elapsedCharge / (this.metadata.chargeMaxTime || 900));

            // Charging particles
            if (this.chargeRatio > 0.3 && Math.random() < 0.35) {
                this.emitChargeParticle();
            }
        } else {
            if (this.isCharging) {
                // Released attack button
                if (this.chargeRatio >= 1.0) {
                    this.castChargedSpell(time);
                } else if (time > this.lastAttackTime + 180) {
                    this.castNormalSpell(time);
                }
                this.isCharging = false;
                this.chargeRatio = 0;
            }
        }

        // 6. ANIMATION
        this.updateAnimation(onGround);

        // Update Familiar
        if (this.familiar && this.familiar.active) {
            this.familiar.update(time);
        }
    }

    performDash(time) {
        this.isDashing = true;
        this.lastDashTime = time;
        this.isInvulnerable = true;
        soundFX.playDash();

        const dashSpeed = GAME_CONFIG.PLAYER.DASH_SPEED * this.facing;
        this.setVelocity(dashSpeed, 0);
        this.body.setAllowGravity(false);

        // Ghost Trail
        const ghostTimer = this.scene.time.addEvent({
            delay: 35,
            repeat: 4,
            callback: () => {
                if (this.active) {
                    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key);
                    ghost.setFlipX(this.flipX);
                    ghost.setTint(0x00ffff);
                    ghost.setAlpha(0.6);
                    ghost.setDepth(19);
                    this.scene.tweens.add({
                        targets: ghost,
                        alpha: 0,
                        duration: 220,
                        onComplete: () => ghost.destroy()
                    });
                }
            }
        });

        this.scene.time.delayedCall(GAME_CONFIG.PLAYER.DASH_DURATION, () => {
            this.isDashing = false;
            this.isInvulnerable = false;
            this.body.setAllowGravity(true);
            this.setVelocityX(this.facing * GAME_CONFIG.PLAYER.WALK_SPEED);
        });
    }

    castNormalSpell(time) {
        const staffName = this.metadata.staff || 'Obsidian Crystal Staff';
        const weaponConfig = WEAPON_CONFIGS[staffName] || WEAPON_CONFIGS['Obsidian Crystal Staff'];

        if (this.mana < (weaponConfig.manaCost || 6)) return;
        this.mana -= weaponConfig.manaCost || 6;
        this.lastAttackTime = time;

        soundFX.playShoot(weaponConfig.type);

        this.isAttacking = true;
        this.setTexture(`wiznerd_${this.metadata.id}_attack`);
        this.scene.time.delayedCall(150, () => {
            this.isAttacking = false;
        });

        const spawnX = this.x + (this.facing * 18);
        const spawnY = this.y - 2;
        const proj = new Projectile(this.scene, spawnX, spawnY, weaponConfig.type, this.facing, weaponConfig);
        this.scene.projectiles.add(proj);
    }

    castChargedSpell(time) {
        const staffName = this.metadata.staff || 'Obsidian Crystal Staff';
        const weaponConfig = WEAPON_CONFIGS[staffName] || WEAPON_CONFIGS['Obsidian Crystal Staff'];
        const chargeType = weaponConfig.chargeType || 'mega_crystal_beam';

        if (this.mana < 20) return;
        this.mana -= 20;
        this.lastAttackTime = time;

        soundFX.playChargedShot();
        this.scene.cameras.main.shake(200, 0.01);

        if (window.unlockAchievement) {
            window.unlockAchievement('mega_caster');
        }

        this.isAttacking = true;
        this.setTexture(`wiznerd_${this.metadata.id}_attack`);
        this.scene.time.delayedCall(220, () => {
            this.isAttacking = false;
        });

        const spawnX = this.x + (this.facing * 20);
        const spawnY = this.y - 2;
        const proj = new Projectile(this.scene, spawnX, spawnY, chargeType, this.facing, weaponConfig);
        this.scene.projectiles.add(proj);
    }

    emitChargeParticle() {
        const p = this.scene.add.particles(this.x + Phaser.Math.Between(-10, 10), this.y + Phaser.Math.Between(-10, 10), 'particle_sparkle', {
            speed: { min: 20, max: 60 },
            lifespan: 200,
            quantity: 2,
            tint: (this.chargeRatio >= 1.0) ? 0xf1c40f : 0x00ffff
        });
        this.scene.time.delayedCall(220, () => p.destroy());
    }

    emitFlameBurst() {
        const flame = this.scene.add.particles(this.x, this.y + 16, 'particle_flame', {
            speed: { min: 40, max: 120 },
            lifespan: 300,
            quantity: 8
        });
        this.scene.time.delayedCall(350, () => flame.destroy());
    }

    emitGlideParticle() {
        const leaf = this.scene.add.sprite(this.x + Phaser.Math.Between(-6, 6), this.y + 14, 'particle_sparkle');
        leaf.setDepth(19);
        leaf.setTint(0x00ffff);
        this.scene.tweens.add({
            targets: leaf,
            y: leaf.y + 18,
            alpha: 0,
            duration: 350,
            onComplete: () => leaf.destroy()
        });
    }

    updateAnimation(onGround) {
        if (this.isAttacking) return;

        const prefix = `wiznerd_${this.metadata.id}`;

        if (!onGround) {
            this.setTexture(`${prefix}_jump`);
        } else if (Math.abs(this.body.velocity.x) > 10) {
            this.walkFrameTimer += 1;
            if (this.walkFrameTimer > 7) {
                this.walkFrameTimer = 0;
                this.currentWalkFrame = (this.currentWalkFrame === 1) ? 2 : 1;
            }
            this.setTexture(`${prefix}_walk_${this.currentWalkFrame}`);
        } else {
            this.setTexture(`${prefix}_idle`);
        }
    }

    takeDamage() {
        if (this.isDead || this.isInvulnerable || this.isDashing) return;

        soundFX.playHurt();
        this.hp -= 1;
        this.scene.updateHUD();
        this.scene.showCombatText(this.x, this.y - 20, '-1 HP', '#ff3344', '15px');
        this.scene.triggerScreenShake(0.015, 160);

        if (this.hp <= 0) {
            this.die();
        } else {
            this.startInvulnerability();
        }
    }

    startInvulnerability() {
        this.isInvulnerable = true;
        let count = 0;
        const blinkEvent = this.scene.time.addEvent({
            delay: 100,
            repeat: 12,
            callback: () => {
                count++;
                this.setAlpha(count % 2 === 0 ? 1 : 0.2);
                if (count >= 12) {
                    this.setAlpha(1);
                    this.isInvulnerable = false;
                }
            }
        });
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.hp = 0;
        this.scene.updateHUD();
        soundFX.playGameOver();

        this.body.setVelocity(0, -320);
        this.body.setCollideWorldBounds(false);
        this.body.checkCollision.none = true;
        this.setTint(0xff3333);

        this.scene.time.delayedCall(1500, () => {
            this.scene.onPlayerDied();
        });
    }
}
