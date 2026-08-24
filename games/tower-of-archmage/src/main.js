// Game 3: Tower of the Archmage - Main Entrypoint & DOM Bridge
import { TOWER_CONFIG } from './config.js';
import { TowerPreloadScene } from './scenes/TowerPreloadScene.js';
import { TowerBattleScene } from './scenes/TowerBattleScene.js';
import { TOWER_WIZNERDS, getTowerWizNerdById } from './utils/nftMetadata.js';
import { soundFX } from './utils/soundFX.js';

const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-canvas-container',
    width: TOWER_CONFIG.WIDTH,
    height: TOWER_CONFIG.HEIGHT,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [TowerPreloadScene, TowerBattleScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(phaserConfig);

// DOM HUD Bridge
window.updateTowerHUD = function (state) {
    const floorEl = document.getElementById('hud-floor');
    const playerHpFill = document.getElementById('player-hp-fill');
    const playerHpText = document.getElementById('player-hp-text');
    const playerManaFill = document.getElementById('player-mana-fill');
    const playerManaText = document.getElementById('player-mana-text');
    const ultBtn = document.getElementById('btn-cast-ult');

    const bossNameEl = document.getElementById('hud-boss-name');
    const bossHpFill = document.getElementById('boss-hp-fill');
    const bossHpText = document.getElementById('boss-hp-text');

    if (floorEl) floorEl.textContent = `FLOOR ${state.floor}`;

    if (playerHpFill) {
        const pct = Math.max(0, Math.min(100, (state.playerHp / state.playerMaxHp) * 100));
        playerHpFill.style.width = `${pct}%`;
    }
    if (playerHpText) playerHpText.textContent = `${state.playerHp} / ${state.playerMaxHp} HP (🛡️ ${state.playerShield})`;

    if (playerManaFill) {
        const pct = Math.max(0, Math.min(100, (state.playerMana / state.playerMaxMana) * 100));
        playerManaFill.style.width = `${pct}%`;
    }
    if (playerManaText) playerManaText.textContent = `${state.playerMana} / ${state.playerMaxMana} MANA`;

    if (ultBtn) {
        const skillName = state.wizNerd ? state.wizNerd.specialSkill.split('(')[0].trim() : 'Ultimate';
        if (state.playerMana >= 100) {
            ultBtn.disabled = false;
            ultBtn.classList.add('ready');
            ultBtn.textContent = `⚡ CAST ${skillName.toUpperCase()} (READY!)`;
        } else {
            ultBtn.disabled = true;
            ultBtn.classList.remove('ready');
            ultBtn.textContent = `⚡ ${skillName} (${state.playerMana}/100)`;
        }
    }

    if (bossNameEl) bossNameEl.textContent = state.bossName;
    if (bossHpFill) {
        const pct = Math.max(0, Math.min(100, (state.bossHp / state.bossMaxHp) * 100));
        bossHpFill.style.width = `${pct}%`;
    }
    if (bossHpText) bossHpText.textContent = `${state.bossHp} / ${state.bossMaxHp} HP`;
};

// Floor Victory Callback
window.onTowerFloorVictory = function (data) {
    const modal = document.getElementById('victory-modal');
    document.getElementById('vic-floor').textContent = `Floor ${data.floor} Cleared!`;
    document.getElementById('vic-wiznerd').textContent = data.wizNerd.name;

    const nextFloorBtn = document.getElementById('btn-next-floor');
    if (data.floor >= 5) {
        document.getElementById('vic-title').textContent = '👑 ARCHMAGE TOWER CONQUERED! 👑';
        if (nextFloorBtn) nextFloorBtn.style.display = 'none';
    } else {
        document.getElementById('vic-title').textContent = '✨ TOWER FLOOR CLEARED! ✨';
        if (nextFloorBtn) nextFloorBtn.style.display = 'inline-block';
    }

    if (modal) modal.style.display = 'flex';
};

// Game Over Callback
window.onTowerGameOver = function (data) {
    const modal = document.getElementById('gameover-modal');
    document.getElementById('go-floor').textContent = `Fell on Floor ${data.floor}`;
    document.getElementById('go-wiznerd').textContent = data.wizNerd.name;
    if (modal) modal.style.display = 'flex';
};

// UI Initialization
window.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('wiznerd-select');
    if (selector) {
        TOWER_WIZNERDS.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name}`;
            selector.appendChild(opt);
        });

        selector.addEventListener('change', (e) => {
            const newId = e.target.value;
            applyWizNerdSelection(newId);
        });
    }

    // Connect Wallet Button
    const walletBtn = document.getElementById('wallet-btn');
    const savedWallet = localStorage.getItem('wiznerdz_wallet');
    if (savedWallet && walletBtn) {
        walletBtn.textContent = `${savedWallet} (Connected)`;
        walletBtn.classList.add('connected');
    }

    // Sound Toggle
    const soundBtn = document.getElementById('sound-btn');
    function updateSoundUI() {
        if (soundBtn) {
            soundBtn.textContent = soundFX.muted ? '🔇' : '🔊';
            soundBtn.style.opacity = soundFX.muted ? '0.6' : '1';
        }
    }
    updateSoundUI();

    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            soundFX.toggleMute();
            updateSoundUI();
        });
    }

    // Ultimate Button Click
    const ultBtn = document.getElementById('btn-cast-ult');
    if (ultBtn) {
        ultBtn.addEventListener('click', () => {
            if (window.activeTowerScene) {
                window.activeTowerScene.castUltimateSpell();
            }
        });
    }

    // Next Floor & Restart Buttons
    const nextFloorBtn = document.getElementById('btn-next-floor');
    if (nextFloorBtn) {
        nextFloorBtn.addEventListener('click', () => {
            document.getElementById('victory-modal').style.display = 'none';
            if (window.activeTowerScene) {
                const nextF = window.activeTowerScene.currentFloor + 1;
                window.activeTowerScene.scene.restart({
                    wizNerdId: window.activeTowerScene.selectedWizNerdId,
                    floor: nextF
                });
            }
        });
    }

    const restartVic = document.getElementById('btn-restart-vic');
    if (restartVic) {
        restartVic.addEventListener('click', () => {
            document.getElementById('victory-modal').style.display = 'none';
            if (window.activeTowerScene) {
                window.activeTowerScene.scene.restart({ wizNerdId: window.activeTowerScene.selectedWizNerdId, floor: 1 });
            }
        });
    }

    const restartGo = document.getElementById('btn-restart-go');
    if (restartGo) {
        restartGo.addEventListener('click', () => {
            document.getElementById('gameover-modal').style.display = 'none';
            if (window.activeTowerScene) {
                window.activeTowerScene.scene.restart({ wizNerdId: window.activeTowerScene.selectedWizNerdId, floor: 1 });
            }
        });
    }

    function applyWizNerdSelection(id) {
        const meta = getTowerWizNerdById(id);
        const cardDesc = document.getElementById('wiznerd-desc');
        const cardSkill = document.getElementById('wiznerd-skill');
        const cardElement = document.getElementById('wiznerd-element');
        const cardAvatar = document.getElementById('wiznerd-avatar-img');

        if (cardDesc) cardDesc.textContent = meta.description;
        if (cardSkill) cardSkill.textContent = meta.specialSkill;
        if (cardElement) cardElement.textContent = meta.element;
        if (cardAvatar && meta.avatar) cardAvatar.src = meta.avatar;

        if (window.activeTowerScene) {
            soundFX.stopBGM();
            window.activeTowerScene.scene.restart({ wizNerdId: id, floor: window.activeTowerScene.currentFloor });
        }
    }

    applyWizNerdSelection('2396');
});
