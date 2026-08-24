// Main Entrypoint - Phaser 3 Setup & HTML HUD Integration
import { GAME_CONFIG } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';
import { WIZNERD_PRESETS, getWizNerdById } from './utils/nftMetadata.js';

const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-canvas-container',
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false
        }
    },
    scene: [PreloadScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(phaserConfig);

// Bridge for HUD Updates
window.updateGameHUD = function (state) {
    // Format Time: mm:ss.ms
    const totalSeconds = Math.floor(state.time / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const millis = Math.floor((state.time % 1000) / 10).toString().padStart(2, '0');

    const timerEl = document.getElementById('hud-timer');
    if (timerEl) timerEl.textContent = `${minutes}:${seconds}.${millis}`;

    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = state.score.toString().padStart(5, '0');

    // HP Hearts
    const hpContainer = document.getElementById('hud-hp');
    if (hpContainer) {
        let heartsHtml = '';
        for (let i = 0; i < state.maxHp; i++) {
            if (i < state.hp) {
                heartsHtml += '<span class="heart full">❤️</span>';
            } else {
                heartsHtml += '<span class="heart empty">🖤</span>';
            }
        }
        hpContainer.innerHTML = heartsHtml;
    }

    // Mana Bar
    const manaFill = document.getElementById('hud-mana-fill');
    const manaText = document.getElementById('hud-mana-text');
    if (manaFill && manaText) {
        const manaPct = (state.mana / state.maxMana) * 100;
        manaFill.style.width = `${manaPct}%`;
        manaText.textContent = `${state.mana} / ${state.maxMana}`;
    }

    // Charge Meter
    const chargeFill = document.getElementById('hud-charge-fill');
    const chargeContainer = document.getElementById('hud-charge-bar');
    if (chargeFill && chargeContainer) {
        if (state.chargeRatio > 0.05) {
            chargeContainer.style.opacity = '1';
            chargeFill.style.width = `${state.chargeRatio * 100}%`;
            if (state.chargeRatio >= 1.0) {
                chargeFill.style.background = '#f1c40f';
            } else {
                chargeFill.style.background = '#00ffff';
            }
        } else {
            chargeContainer.style.opacity = '0';
            chargeFill.style.width = '0%';
        }
    }

    // Shards
    const shard0 = document.getElementById('shard-0');
    const shard1 = document.getElementById('shard-1');
    const shard2 = document.getElementById('shard-2');
    if (shard0) shard0.className = state.shards[0] ? 'shard active' : 'shard inactive';
    if (shard1) shard1.className = state.shards[1] ? 'shard active' : 'shard inactive';
    if (shard2) shard2.className = state.shards[2] ? 'shard active' : 'shard inactive';

    // State Card Badges
    const classBadge = document.getElementById('hud-class-badge');
    if (classBadge) {
        classBadge.textContent = state.metadata.class;
    }

    const staffBadge = document.getElementById('hud-staff-badge');
    if (staffBadge) {
        staffBadge.textContent = state.metadata.staff;
    }
};

// Victory Callback
window.onGameVictory = function (data) {
    const totalSeconds = Math.floor(data.time / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const millis = Math.floor((data.time % 1000) / 10).toString().padStart(2, '0');

    const modal = document.getElementById('victory-modal');
    document.getElementById('vic-time').textContent = `${minutes}:${seconds}.${millis}`;
    document.getElementById('vic-score').textContent = data.score;
    document.getElementById('vic-shards').textContent = `${data.shards} / 3`;
    document.getElementById('vic-wiznerd').textContent = data.wizNerd.name;

    if (modal) modal.style.display = 'flex';
};

// Game Over Callback
window.onGameOver = function (data) {
    const modal = document.getElementById('gameover-modal');
    document.getElementById('go-score').textContent = data.score;
    if (modal) modal.style.display = 'flex';
};

// UI Initialization
window.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('wiznerd-select');
    if (selector) {
        WIZNERD_PRESETS.forEach(p => {
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

    // Connect Wallet Button & localStorage persistence
    const walletBtn = document.getElementById('wallet-btn');
    const savedWallet = localStorage.getItem('wiznerdz_wallet');
    const savedChar = localStorage.getItem('wiznerdz_active_char');

    if (savedWallet && walletBtn) {
        walletBtn.textContent = `${savedWallet} (Connected)`;
        walletBtn.classList.add('connected');
    }

    if (walletBtn) {
        walletBtn.addEventListener('click', () => {
            const mockAddress = '0x71C...9F4';
            localStorage.setItem('wiznerdz_wallet', mockAddress);
            walletBtn.textContent = `${mockAddress} (Connected)`;
            walletBtn.classList.add('connected');
            if (selector) {
                selector.value = '2396';
                applyWizNerdSelection('2396');
            }
        });
    }

    // Restart Buttons
    const restartVic = document.getElementById('btn-restart-victory');
    if (restartVic) {
        restartVic.addEventListener('click', () => {
            document.getElementById('victory-modal').style.display = 'none';
            if (window.activeGameScene) {
                window.activeGameScene.scene.restart({ wizNerdId: window.activeGameScene.selectedWizNerdId });
            }
        });
    }

    const restartGo = document.getElementById('btn-restart-go');
    if (restartGo) {
        restartGo.addEventListener('click', () => {
            document.getElementById('gameover-modal').style.display = 'none';
            if (window.activeGameScene) {
                window.activeGameScene.scene.restart({ wizNerdId: window.activeGameScene.selectedWizNerdId });
            }
        });
    }

    function applyWizNerdSelection(id) {
        const meta = getWizNerdById(id);
        const cardDesc = document.getElementById('wiznerd-desc');
        const cardAbility = document.getElementById('wiznerd-ability');
        const cardWeapon = document.getElementById('wiznerd-weapon');
        const cardAvatar = document.getElementById('wiznerd-avatar-img');

        if (cardDesc) cardDesc.textContent = meta.description;
        if (cardAbility) cardAbility.textContent = meta.abilityName;
        if (cardWeapon) cardWeapon.textContent = meta.weaponName;
        if (cardAvatar && meta.avatar) {
            cardAvatar.src = meta.avatar;
        }

        if (window.activeGameScene) {
            window.activeGameScene.changeWizNerd(id);
        }
    }

    // Initialize with WizNerd #2396
    applyWizNerdSelection('2396');
});
