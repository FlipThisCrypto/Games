// Main Entrypoint - Phaser 3 Setup & HTML HUD Integration
import { GAME_CONFIG } from './config.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';
import { WIZNERD_PRESETS, getWizNerdById } from './utils/nftMetadata.js';
import { soundFX } from './utils/soundFX.js';

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

// Leaderboard Storage & Rendering
function getLeaderboard() {
    try {
        const raw = localStorage.getItem('wiznerdz_leaderboard');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveLeaderboardRecord(entry) {
    const board = getLeaderboard();
    board.push(entry);
    // Sort by fastest time, then highest score
    board.sort((a, b) => a.time - b.time || b.score - a.score);
    const trimmed = board.slice(0, 10);
    localStorage.setItem('wiznerdz_leaderboard', JSON.stringify(trimmed));
    return trimmed;
}

function renderLeaderboard() {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    const board = getLeaderboard();

    if (board.length === 0) {
        listEl.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 12px;">No speedruns recorded yet. Clear the stage to set the first record!</div>';
        return;
    }

    let html = '';
    board.forEach((r, idx) => {
        const medals = ['🥇', '🥈', '🥉'];
        const rankBadge = medals[idx] || `#${idx + 1}`;
        const totalSec = Math.floor(r.time / 1000);
        const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const secs = (totalSec % 60).toString().padStart(2, '0');
        const ms = Math.floor((r.time % 1000) / 10).toString().padStart(2, '0');

        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 4px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 14px; font-weight: bold; width: 22px;">${rankBadge}</span>
                    <div>
                        <div style="font-weight: bold; color: var(--neon-cyan);">${r.wizNerdName}</div>
                        <div style="font-size: 10px; color: var(--text-dim);">${r.date || 'Arcane Run'}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--neon-gold); font-weight: bold;">⏱️ ${mins}:${secs}.${ms}</div>
                    <div style="font-size: 10px; color: var(--neon-green);">🏆 ${r.score} pts | 💎 ${r.shards}/3</div>
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

// Wizard Achievements System
export const ACHIEVEMENTS_DEF = [
    { id: 'first_blood', name: 'First Arcane Strike', desc: 'Defeat your first enemy in combat', icon: '⚔️' },
    { id: 'shard_master', name: 'Grand Magus Collector', desc: 'Collect all 3 hidden Spell Shards in a single run', icon: '💎' },
    { id: 'mega_caster', name: 'Ley-Line Overload', desc: 'Release a fully charged Mega Spell attack', icon: '⚡' },
    { id: 'sentry_buster', name: 'Siege Breaker', desc: 'Destroy an Arcane Sentry Turret', icon: '🛡️' },
    { id: 'potion_master', name: 'Alchemical Surge', desc: 'Collect an Alchemist Potion buff', icon: '🧪' },
    { id: 'portal_walker', name: 'Archmage Ascendant', desc: 'Clear the stage and step into the Goal Portal', icon: '🌟' }
];

function getUnlockedAchievements() {
    try {
        const raw = localStorage.getItem('wiznerdz_achievements');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

window.unlockAchievement = function (achId) {
    const unlocked = getUnlockedAchievements();
    if (unlocked.includes(achId)) return; // already unlocked

    const def = ACHIEVEMENTS_DEF.find(a => a.id === achId);
    if (!def) return;

    unlocked.push(achId);
    localStorage.setItem('wiznerdz_achievements', JSON.stringify(unlocked));

    // Show celebratory toast
    const toast = document.getElementById('achievement-toast');
    const toastTitle = document.getElementById('toast-title');
    if (toast && toastTitle) {
        toastTitle.textContent = `${def.icon} ${def.name}`;
        toast.style.transform = 'translateX(-50%) translateY(0px)';
        soundFX.playShardCollect();
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-60px)';
        }, 3200);
    }
};

function renderAchievements() {
    const listEl = document.getElementById('achievements-list');
    if (!listEl) return;

    const unlocked = getUnlockedAchievements();
    let html = '';

    ACHIEVEMENTS_DEF.forEach(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        const icon = isUnlocked ? ach.icon : '🔒';
        const borderColor = isUnlocked ? 'var(--neon-gold)' : 'rgba(255,255,255,0.15)';
        const titleColor = isUnlocked ? 'var(--neon-cyan)' : 'var(--text-dim)';
        const statusBadge = isUnlocked ? '<span style="color:#2ecc71; font-weight:bold;">UNLOCKED ✨</span>' : '<span style="color:#7f8c8d;">LOCKED</span>';

        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border: 1px solid ${borderColor}; border-radius: 6px; background: rgba(20,12,35,0.7);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">${icon}</span>
                    <div>
                        <div style="font-weight: bold; color: ${titleColor};">${ach.name}</div>
                        <div style="font-size: 11px; color: var(--text-dim);">${ach.desc}</div>
                    </div>
                </div>
                <div style="font-size: 10px;">${statusBadge}</div>
            </div>
        `;
    });

    listEl.innerHTML = html;
}

// Victory Callback
window.onGameVictory = function (data) {
    const totalSeconds = Math.floor(data.time / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const millis = Math.floor((data.time % 1000) / 10).toString().padStart(2, '0');

    const boardBefore = getLeaderboard();
    const isNewBest = boardBefore.length === 0 || data.time < boardBefore[0].time;

    saveLeaderboardRecord({
        time: data.time,
        score: data.score,
        shards: data.shards,
        wizNerdId: data.wizNerd.id,
        wizNerdName: data.wizNerd.name,
        date: new Date().toLocaleDateString()
    });

    const modal = document.getElementById('victory-modal');
    document.getElementById('vic-time').textContent = `${minutes}:${seconds}.${millis}`;
    document.getElementById('vic-score').textContent = data.score;
    document.getElementById('vic-shards').textContent = `${data.shards} / 3`;
    document.getElementById('vic-wiznerd').textContent = data.wizNerd.name;

    const newRec = document.getElementById('vic-new-record');
    if (newRec) newRec.style.display = isNewBest ? 'block' : 'none';

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

    // Stage Selector
    const stageSelector = document.getElementById('stage-select');
    if (stageSelector) {
        stageSelector.addEventListener('change', (e) => {
            const newStage = Number(e.target.value);
            if (window.activeGameScene) {
                soundFX.stopBGM();
                window.activeGameScene.scene.restart({
                    wizNerdId: window.activeGameScene.selectedWizNerdId,
                    stage: newStage
                });
            }
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

    // Sound Mute Toggle Button & Keyboard Hotkey (M)
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

    window.addEventListener('keydown', (e) => {
        if (e.key === 'm' || e.key === 'M') {
            soundFX.toggleMute();
            updateSoundUI();
        }
    });

    // Restart Buttons
    // Virtual Touch Controls Listeners
    function bindTouch(id, inputKey, isPulse = false) {
        const el = document.getElementById(id);
        if (!el) return;

        const start = (e) => {
            e.preventDefault();
            soundFX.init();
            if (window.activeGameScene && window.activeGameScene.virtualInputs) {
                window.activeGameScene.virtualInputs[inputKey] = true;
                if (isPulse) {
                    const pulseKey = 'just' + inputKey.charAt(0).toUpperCase() + inputKey.slice(1);
                    window.activeGameScene.virtualInputs[pulseKey] = true;
                }
            }
        };

        const end = (e) => {
            e.preventDefault();
            if (window.activeGameScene && window.activeGameScene.virtualInputs) {
                window.activeGameScene.virtualInputs[inputKey] = false;
            }
        };

        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
        el.addEventListener('touchcancel', end, { passive: false });
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
    }

    bindTouch('btn-touch-left', 'left');
    bindTouch('btn-touch-right', 'right');
    bindTouch('btn-touch-jump', 'jump', true);
    bindTouch('btn-touch-dash', 'dash', true);
    bindTouch('btn-touch-attack', 'attack');

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

    // Leaderboard Modal Listeners
    const openBoardBtn = document.getElementById('btn-open-leaderboard');
    const closeBoardBtn = document.getElementById('btn-close-leaderboard');
    const viewBoardVicBtn = document.getElementById('btn-view-board-vic');
    const boardModal = document.getElementById('leaderboard-modal');

    if (openBoardBtn) {
        openBoardBtn.addEventListener('click', () => {
            renderLeaderboard();
            if (boardModal) boardModal.style.display = 'flex';
        });
    }

    if (viewBoardVicBtn) {
        viewBoardVicBtn.addEventListener('click', () => {
            renderLeaderboard();
            if (boardModal) boardModal.style.display = 'flex';
        });
    }

    if (closeBoardBtn) {
        closeBoardBtn.addEventListener('click', () => {
            if (boardModal) boardModal.style.display = 'none';
        });
    }

    // Achievements Modal Listeners
    const openAchBtn = document.getElementById('btn-open-achievements');
    const closeAchBtn = document.getElementById('btn-close-achievements');
    const achModal = document.getElementById('achievements-modal');

    if (openAchBtn) {
        openAchBtn.addEventListener('click', () => {
            renderAchievements();
            if (achModal) achModal.style.display = 'flex';
        });
    }

    if (closeAchBtn) {
        closeAchBtn.addEventListener('click', () => {
            if (achModal) achModal.style.display = 'none';
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
