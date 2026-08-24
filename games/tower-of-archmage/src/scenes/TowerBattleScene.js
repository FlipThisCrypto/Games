// Game 3: Tower of the Archmage - Turn-based Rune Combat Scene
import { TOWER_CONFIG } from '../config.js';
import { getTowerWizNerdById } from '../utils/nftMetadata.js';
import { soundFX } from '../utils/soundFX.js';

export class TowerBattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TowerBattleScene' });
    }

    init(data) {
        this.selectedWizNerdId = (data && data.wizNerdId) ? data.wizNerdId : '2396';
        this.currentFloor = (data && data.floor) ? data.floor : 1;
        this.selectedTile = null;
        this.isProcessing = false;
    }

    create() {
        this.metadata = getTowerWizNerdById(this.selectedWizNerdId);
        this.playerHp = this.metadata.maxHp;
        this.playerMaxHp = this.metadata.maxHp;
        this.playerShield = 0;
        this.playerMana = 0;
        this.playerMaxMana = 100;

        // Init Boss
        this.initBossForFloor(this.currentFloor);

        // Draw Battle Background
        this.createBattlefield();

        // Build Rune Board Grid
        this.grid = [];
        this.tileSprites = [];
        this.initGrid();

        soundFX.startBGM();
        window.activeTowerScene = this;
        this.updateHUD();
    }

    initBossForFloor(floor) {
        const bosses = [
            { name: 'Floor 1: Void Stone Golem', hp: 280, atk: 22, tex: 'boss_golem' },
            { name: 'Floor 2: Arch-Lich Malakar', hp: 480, atk: 34, tex: 'boss_lich' },
            { name: 'Floor 3: Ancient Nether Dragon', hp: 750, atk: 48, tex: 'boss_dragon' }
        ];
        const b = bosses[floor - 1] || bosses[0];
        this.bossName = b.name;
        this.bossHp = b.hp;
        this.bossMaxHp = b.hp;
        this.bossAtk = b.atk;
        this.bossTexture = b.tex;
    }

    createBattlefield() {
        // Dark Void Stage
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0515, 0x0a0515, 0x1d0f33, 0x2e124a, 1);
        bg.fillRect(0, 0, TOWER_CONFIG.WIDTH, TOWER_CONFIG.HEIGHT);

        // Boss Visual & Platform
        this.add.ellipse(TOWER_CONFIG.WIDTH / 2, 110, 160, 40, 0x130a21, 0.8);
        this.bossSprite = this.add.sprite(TOWER_CONFIG.WIDTH / 2, 85, this.bossTexture).setScale(1.5);

        // Bobbing boss tween
        this.tweens.add({
            targets: this.bossSprite,
            y: 80,
            duration: 1200,
            yoyo: true,
            repeat: -1
        });

        // Grid Background Container Box
        const boardBg = this.add.graphics();
        boardBg.fillStyle(0x0c0618, 0.85);
        boardBg.fillRoundedRect(
            TOWER_CONFIG.GRID.OFFSET_X - 10,
            TOWER_CONFIG.GRID.OFFSET_Y - 10,
            (TOWER_CONFIG.GRID.COLS * TOWER_CONFIG.GRID.TILE_SIZE) + 20,
            (TOWER_CONFIG.GRID.ROWS * TOWER_CONFIG.GRID.TILE_SIZE) + 20,
            12
        );
        boardBg.lineStyle(2, 0x9b51e0, 0.6);
        boardBg.strokeRoundedRect(
            TOWER_CONFIG.GRID.OFFSET_X - 10,
            TOWER_CONFIG.GRID.OFFSET_Y - 10,
            (TOWER_CONFIG.GRID.COLS * TOWER_CONFIG.GRID.TILE_SIZE) + 20,
            (TOWER_CONFIG.GRID.ROWS * TOWER_CONFIG.GRID.TILE_SIZE) + 20,
            12
        );
    }

    initGrid() {
        const runeKeys = ['rune_fire', 'rune_ice', 'rune_arcane', 'rune_life', 'rune_shield', 'rune_skull'];

        for (let r = 0; r < TOWER_CONFIG.GRID.ROWS; r++) {
            this.grid[r] = [];
            this.tileSprites[r] = [];
            for (let c = 0; c < TOWER_CONFIG.GRID.COLS; c++) {
                let type;
                do {
                    type = Phaser.Math.Between(0, runeKeys.length - 1);
                } while (
                    (c >= 2 && this.grid[r][c - 1] === type && this.grid[r][c - 2] === type) ||
                    (r >= 2 && this.grid[r - 1][c] === type && this.grid[r - 2][c] === type)
                );

                this.grid[r][c] = type;

                const x = TOWER_CONFIG.GRID.OFFSET_X + (c * TOWER_CONFIG.GRID.TILE_SIZE) + 28;
                const y = TOWER_CONFIG.GRID.OFFSET_Y + (r * TOWER_CONFIG.GRID.TILE_SIZE) + 28;

                const spr = this.add.sprite(x, y, runeKeys[type]).setInteractive();
                spr.gridR = r;
                spr.gridC = c;

                spr.on('pointerdown', () => this.onTileClicked(r, c));
                this.tileSprites[r][c] = spr;
            }
        }
    }

    onTileClicked(r, c) {
        if (this.isProcessing) return;

        if (!this.selectedTile) {
            this.selectedTile = { r, c };
            this.tileSprites[r][c].setTint(0xffff00);
            soundFX.playMatch();
        } else {
            const r1 = this.selectedTile.r;
            const c1 = this.selectedTile.c;
            this.tileSprites[r1][c1].clearTint();

            const isAdjacent = (Math.abs(r1 - r) + Math.abs(c1 - c)) === 1;
            if (isAdjacent) {
                this.swapTiles(r1, c1, r, c);
            }
            this.selectedTile = null;
        }
    }

    swapTiles(r1, c1, r2, c2) {
        this.isProcessing = true;

        const spr1 = this.tileSprites[r1][c1];
        const spr2 = this.tileSprites[r2][c2];

        // Swap visual coordinates
        this.tweens.add({
            targets: spr1,
            x: spr2.x,
            y: spr2.y,
            duration: 180
        });

        this.tweens.add({
            targets: spr2,
            x: spr1.x,
            y: spr1.y,
            duration: 180,
            onComplete: () => {
                // Swap in logical grid
                const temp = this.grid[r1][c1];
                this.grid[r1][c1] = this.grid[r2][c2];
                this.grid[r2][c2] = temp;

                this.tileSprites[r1][c1] = spr2;
                this.tileSprites[r2][c2] = spr1;
                spr1.gridR = r2; spr1.gridC = c2;
                spr2.gridR = r1; spr2.gridC = c1;

                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.processMatches(matches);
                } else {
                    // Revert swap if no match
                    this.revertSwap(r1, c1, r2, c2);
                }
            }
        });
    }

    revertSwap(r1, c1, r2, c2) {
        const spr1 = this.tileSprites[r1][c1];
        const spr2 = this.tileSprites[r2][c2];

        this.tweens.add({
            targets: spr1,
            x: spr2.x,
            y: spr2.y,
            duration: 180
        });
        this.tweens.add({
            targets: spr2,
            x: spr1.x,
            y: spr1.y,
            duration: 180,
            onComplete: () => {
                const temp = this.grid[r1][c1];
                this.grid[r1][c1] = this.grid[r2][c2];
                this.grid[r2][c2] = temp;
                this.tileSprites[r1][c1] = spr2;
                this.tileSprites[r2][c2] = spr1;
                spr1.gridR = r2; spr1.gridC = c2;
                spr2.gridR = r1; spr2.gridC = c1;
                this.isProcessing = false;
            }
        });
    }

    findMatches() {
        const matched = [];
        const isMatched = Array(TOWER_CONFIG.GRID.ROWS).fill(null).map(() => Array(TOWER_CONFIG.GRID.COLS).fill(false));

        // Horizontal matches
        for (let r = 0; r < TOWER_CONFIG.GRID.ROWS; r++) {
            for (let c = 0; c < TOWER_CONFIG.GRID.COLS - 2; c++) {
                const type = this.grid[r][c];
                if (type !== -1 && type === this.grid[r][c + 1] && type === this.grid[r][c + 2]) {
                    isMatched[r][c] = true;
                    isMatched[r][c + 1] = true;
                    isMatched[r][c + 2] = true;
                }
            }
        }

        // Vertical matches
        for (let c = 0; c < TOWER_CONFIG.GRID.COLS; c++) {
            for (let r = 0; r < TOWER_CONFIG.GRID.ROWS - 2; r++) {
                const type = this.grid[r][c];
                if (type !== -1 && type === this.grid[r + 1][c] && type === this.grid[r + 2][c]) {
                    isMatched[r][c] = true;
                    isMatched[r + 1][c] = true;
                    isMatched[r + 2][c] = true;
                }
            }
        }

        for (let r = 0; r < TOWER_CONFIG.GRID.ROWS; r++) {
            for (let c = 0; c < TOWER_CONFIG.GRID.COLS; c++) {
                if (isMatched[r][c]) {
                    matched.push({ r, c, type: this.grid[r][c] });
                }
            }
        }
        return matched;
    }

    processMatches(matches) {
        soundFX.playMatch();
        const runeCounts = [0, 0, 0, 0, 0, 0];

        matches.forEach(m => {
            runeCounts[m.type]++;
            const spr = this.tileSprites[m.r][m.c];
            if (spr) {
                this.tweens.add({
                    targets: spr,
                    scaleX: 0,
                    scaleY: 0,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => spr.destroy()
                });
            }
            this.grid[m.r][m.c] = -1;
        });

        // Apply Player Turn Effects based on Matched Runes
        this.applyRuneCombatEffects(runeCounts);

        this.time.delayedCall(250, () => {
            this.refillBoard();
        });
    }

    applyRuneCombatEffects(counts) {
        let dmg = (counts[0] * 18 * this.metadata.atkBonus) + (counts[5] * 28);
        let heal = counts[3] * 15;
        let shield = counts[4] * 12;
        let mana = counts[2] * 20;

        if (dmg > 0) {
            this.bossHp = Math.max(0, this.bossHp - Math.floor(dmg));
            this.showCombatText(this.bossSprite.x, this.bossSprite.y - 30, `-${Math.floor(dmg)} DMG`, '#ff4757', '18px');
            this.cameras.main.shake(120, 0.008);
        }
        if (heal > 0) {
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
            this.showCombatText(180, 560, `+${heal} HP`, '#2ecc71', '14px');
        }
        if (shield > 0) {
            this.playerShield += shield;
            this.showCombatText(180, 580, `+${shield} SHIELD`, '#3498db', '14px');
        }
        if (mana > 0) {
            this.playerMana = Math.min(this.playerMaxMana, this.playerMana + mana);
        }

        this.updateHUD();

        if (this.bossHp <= 0) {
            this.handleBossVictory();
        }
    }

    refillBoard() {
        const runeKeys = ['rune_fire', 'rune_ice', 'rune_arcane', 'rune_life', 'rune_shield', 'rune_skull'];

        // Drop existing tiles down
        for (let c = 0; c < TOWER_CONFIG.GRID.COLS; c++) {
            let emptyRow = TOWER_CONFIG.GRID.ROWS - 1;
            for (let r = TOWER_CONFIG.GRID.ROWS - 1; r >= 0; r--) {
                if (this.grid[r][c] !== -1) {
                    if (r !== emptyRow) {
                        this.grid[emptyRow][c] = this.grid[r][c];
                        this.grid[r][c] = -1;
                        const spr = this.tileSprites[r][c];
                        this.tileSprites[emptyRow][c] = spr;
                        this.tileSprites[r][c] = null;
                        spr.gridR = emptyRow;

                        const targetY = TOWER_CONFIG.GRID.OFFSET_Y + (emptyRow * TOWER_CONFIG.GRID.TILE_SIZE) + 28;
                        this.tweens.add({ targets: spr, y: targetY, duration: 180 });
                    }
                    emptyRow--;
                }
            }

            // Spawn new tiles at top
            for (let r = emptyRow; r >= 0; r--) {
                const type = Phaser.Math.Between(0, runeKeys.length - 1);
                this.grid[r][c] = type;
                const x = TOWER_CONFIG.GRID.OFFSET_X + (c * TOWER_CONFIG.GRID.TILE_SIZE) + 28;
                const startY = TOWER_CONFIG.GRID.OFFSET_Y - 40 - (r * 30);
                const targetY = TOWER_CONFIG.GRID.OFFSET_Y + (r * TOWER_CONFIG.GRID.TILE_SIZE) + 28;

                const spr = this.add.sprite(x, startY, runeKeys[type]).setInteractive();
                spr.gridR = r; spr.gridC = c;
                spr.on('pointerdown', () => this.onTileClicked(r, c));
                this.tileSprites[r][c] = spr;

                this.tweens.add({ targets: spr, y: targetY, duration: 220 });
            }
        }

        // Check for cascade combos
        this.time.delayedCall(260, () => {
            const cascadeMatches = this.findMatches();
            if (cascadeMatches.length > 0) {
                this.processMatches(cascadeMatches);
            } else {
                // End player turn -> Trigger Boss Attack
                if (this.bossHp > 0) {
                    this.triggerBossTurn();
                } else {
                    this.isProcessing = false;
                }
            }
        });
    }

    triggerBossTurn() {
        this.time.delayedCall(400, () => {
            if (this.bossHp <= 0) return;

            soundFX.playSpell();
            this.tweens.add({
                targets: this.bossSprite,
                y: this.bossSprite.y + 15,
                duration: 100,
                yoyo: true
            });

            let damage = this.bossAtk;
            if (this.playerShield > 0) {
                const absorbed = Math.min(this.playerShield, damage);
                this.playerShield -= absorbed;
                damage -= absorbed;
            }

            if (damage > 0) {
                this.playerHp = Math.max(0, this.playerHp - damage);
                this.showCombatText(180, 540, `-${damage} HP`, '#ff3344', '16px');
                this.cameras.main.shake(140, 0.012);
            }

            this.updateHUD();

            if (this.playerHp <= 0) {
                this.handlePlayerDefeat();
            } else {
                this.isProcessing = false;
            }
        });
    }

    castUltimateSpell() {
        if (this.playerMana < 100 || this.isProcessing) return;
        this.playerMana = 0;
        soundFX.playBossDefeat();

        this.bossHp = Math.max(0, this.bossHp - 140);
        this.showCombatText(this.bossSprite.x, this.bossSprite.y - 30, '⚡ ULTIMATE CATACLYSM! -140', '#00ffff', '20px');
        this.cameras.main.shake(200, 0.02);

        this.updateHUD();
        if (this.bossHp <= 0) {
            this.handleBossVictory();
        }
    }

    showCombatText(x, y, text, color = '#ffd700', fontSize = '14px') {
        const txt = this.add.text(x, y, text, {
            fontFamily: '"Courier New", monospace',
            fontSize: fontSize,
            color: color,
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(40);

        this.tweens.add({
            targets: txt,
            y: txt.y - 28,
            alpha: 0,
            duration: 700,
            onComplete: () => txt.destroy()
        });
    }

    handleBossVictory() {
        soundFX.playBossDefeat();
        if (window.onTowerFloorVictory) {
            window.onTowerFloorVictory({
                floor: this.currentFloor,
                wizNerd: this.metadata
            });
        }
    }

    handlePlayerDefeat() {
        soundFX.stopBGM();
        if (window.onTowerGameOver) {
            window.onTowerGameOver({
                floor: this.currentFloor,
                wizNerd: this.metadata
            });
        }
    }

    updateHUD() {
        if (window.updateTowerHUD) {
            window.updateTowerHUD({
                floor: this.currentFloor,
                playerHp: this.playerHp,
                playerMaxHp: this.playerMaxHp,
                playerShield: this.playerShield,
                playerMana: this.playerMana,
                playerMaxMana: this.playerMaxMana,
                bossName: this.bossName,
                bossHp: this.bossHp,
                bossMaxHp: this.bossMaxHp
            });
        }
    }
}
