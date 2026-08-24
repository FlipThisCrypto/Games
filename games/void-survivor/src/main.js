// Game 2: WizNerdz Void Survivor - Main Entrypoint & DOM Bridge
import { SURVIVOR_CONFIG } from './config.js';
import { SurvivorPreloadScene } from './scenes/SurvivorPreloadScene.js';
import { SurvivorGameScene } from './scenes/SurvivorGameScene.js';
import { SURVIVOR_WIZNERDS, getSurvivorWizNerdById } from './utils/nftMetadata.js';
import { soundFX } from './utils/soundFX.js';

const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-canvas-container',
    width: SURVIVOR_CONFIG.WIDTH,
    height: SURVIVOR_CONFIG.HEIGHT,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [SurvivorPreloadScene, SurvivorGameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(phaserConfig);

// DOM HUD Bridge
window.updateSurvivorHUD = function (state) {
    const timer = document.getElementById('hud-timer');
    const kills = document.getElementById('hud-kills');
    const level = document.getElementById('hud-level');
    const hpFill = document.getElementById('hud-hp-fill');
    const hpText = document.getElementById('hud-hp-text');
    const xpFill = document.getElementById('hud-xp-fill');
    const xpText = document.getElementById('hud-xp-text');

    if (timer) {
        const totalSec = Math.floor(state.time / 1000);
        const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const secs = (totalSec % 60).toString().padStart(2, '0');
        timer.textContent = `${mins}:${secs}`;
    }

    if (kills) kills.textContent = state.kills;
    if (level) level.textContent = `LV ${state.level}`;

    if (hpFill) {
        const pct = Math.max(0, Math.min(100, (state.hp / state.maxHp) * 100));
        hpFill.style.width = `${pct}%`;
    }
    if (hpText) hpText.textContent = `${state.hp} / ${state.maxHp}`;

    if (xpFill) {
        const pct = Math.max(0, Math.min(100, (state.xp / state.nextXp) * 100));
        xpFill.style.width = `${pct}%`;
    }
    if (xpText) xpText.textContent = `${state.xp} / ${state.nextXp} XP`;
};

// Level Up Upgrade Modal Callback
window.onSurvivorLevelUp = function (player) {
    const modal = document.getElementById('levelup-modal');
    const container = document.getElementById('upgrade-cards-container');
    if (!modal || !container) return;

    const upgrades = [
        { type: 'crystal', title: 'Orbiting Crystals', desc: '+1 Crystal orb & +10 Damage', icon: '💎' },
        { type: 'fireRing', title: 'Inferno Ring', desc: 'Periodic fiery burst surrounding player', icon: '🔥' },
        { type: 'voidNova', title: 'Void Nova', desc: '8-way piercing void projectile blast', icon: '🌌' },
        { type: 'lightning', title: 'Arcane Thunder', desc: 'Smite nearest foe with high voltage', icon: '⚡' }
    ];

    container.innerHTML = '';
    upgrades.forEach(u => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div style="font-size: 24px;">${u.icon}</div>
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; color: var(--neon-cyan);">${u.title} (LV ${player.spells[u.type].level + 1})</div>
                <div style="font-size: 11px; color: var(--text-dim);">${u.desc}</div>
            </div>
        `;
        card.addEventListener('click', () => {
            player.upgradeSpell(u.type);
            modal.style.display = 'none';
            if (window.activeGameScene) window.activeGameScene.resumeFromUpgrade();
        });
        container.appendChild(card);
    });

    modal.style.display = 'flex';
};

// Survivor Leaderboard System
function getSurvivorLeaderboard() {
    try {
        const raw = localStorage.getItem('wiznerdz_survivor_leaderboard');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveSurvivorRecord(record) {
    const board = getSurvivorLeaderboard();
    board.push(record);
    // Sort by longest survival time descending, then kills
    board.sort((a, b) => b.time - a.time || b.kills - a.kills);
    const top10 = board.slice(0, 10);
    localStorage.setItem('wiznerdz_survivor_leaderboard', JSON.stringify(top10));
    return top10;
}

function renderSurvivorLeaderboard() {
    const listEl = document.getElementById('survivor-leaderboard-list');
    if (!listEl) return;

    const board = getSurvivorLeaderboard();
    if (board.length === 0) {
        listEl.innerHTML = '<div style="text-align: center; color: var(--text-dim); padding: 16px;">No Void Survivor records recorded yet. Survive the abyss!</div>';
        return;
    }

    let html = '';
    const medals = ['🥇', '🥈', '🥉'];
    board.forEach((r, idx) => {
        const rankBadge = medals[idx] || `#${idx + 1}`;
        const totalSec = Math.floor(r.time / 1000);
        const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const secs = (totalSec % 60).toString().padStart(2, '0');

        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.1); background: ${idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'};">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 16px; min-width: 24px;">${rankBadge}</span>
                    <div>
                        <div style="font-weight: bold; color: var(--neon-cyan);">${r.wizNerdName || 'WizNerd'}</div>
                        <div style="font-size: 10px; color: var(--text-dim);">${r.date || 'Arcane Run'}</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: var(--neon-gold); font-weight: bold;">⏱️ ${mins}:${secs}</div>
                    <div style="font-size: 10px; color: var(--neon-green);">💀 ${r.kills} Kills | LV ${r.level}</div>
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

// Game Over Callback
window.onSurvivorGameOver = function (data) {
    const modal = document.getElementById('gameover-modal');
    const totalSec = Math.floor(data.time / 1000);
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');

    const boardBefore = getSurvivorLeaderboard();
    const isNewBest = boardBefore.length === 0 || data.time > boardBefore[0].time;

    saveSurvivorRecord({
        time: data.time,
        kills: data.kills,
        level: data.level,
        wizNerdId: data.wizNerd.id,
        wizNerdName: data.wizNerd.name,
        date: new Date().toLocaleDateString()
    });

    document.getElementById('go-time').textContent = `${mins}:${secs}`;
    document.getElementById('go-kills').textContent = data.kills;
    document.getElementById('go-level').textContent = data.level;
    document.getElementById('go-wiznerd').textContent = data.wizNerd.name;

    const newRecEl = document.getElementById('go-new-record');
    if (newRecEl) newRecEl.style.display = isNewBest ? 'block' : 'none';

    if (modal) modal.style.display = 'flex';
};

// UI Initialization
window.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('wiznerd-select');
    if (selector) {
        SURVIVOR_WIZNERDS.forEach(p => {
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

    // Audio Toggle
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

    // Virtual Touch Controls
    function bindTouch(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = (e) => {
            e.preventDefault();
            soundFX.init();
            if (window.activeGameScene && window.activeGameScene.virtualInputs) {
                window.activeGameScene.virtualInputs[key] = true;
            }
        };
        const end = (e) => {
            e.preventDefault();
            if (window.activeGameScene && window.activeGameScene.virtualInputs) {
                window.activeGameScene.virtualInputs[key] = false;
            }
        };
        el.addEventListener('touchstart', start, { passive: false });
        el.addEventListener('touchend', end, { passive: false });
        el.addEventListener('touchcancel', end, { passive: false });
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', end);
        el.addEventListener('mouseleave', end);
    }

    bindTouch('btn-touch-up', 'up');
    bindTouch('btn-touch-down', 'down');
    bindTouch('btn-touch-left', 'left');
    bindTouch('btn-touch-right', 'right');

    // Restart Button
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
    const openBoardBtn = document.getElementById('btn-open-survivor-board');
    const viewBoardGoBtn = document.getElementById('btn-view-board-go');
    const closeBoardBtn = document.getElementById('btn-close-survivor-board');
    const boardModal = document.getElementById('survivor-leaderboard-modal');

    if (openBoardBtn) {
        openBoardBtn.addEventListener('click', () => {
            renderSurvivorLeaderboard();
            if (boardModal) boardModal.style.display = 'flex';
        });
    }

    if (viewBoardGoBtn) {
        viewBoardGoBtn.addEventListener('click', () => {
            renderSurvivorLeaderboard();
            if (boardModal) boardModal.style.display = 'flex';
        });
    }

    if (closeBoardBtn) {
        closeBoardBtn.addEventListener('click', () => {
            if (boardModal) boardModal.style.display = 'none';
        });
    }

    function applyWizNerdSelection(id) {
        const meta = getSurvivorWizNerdById(id);
        const cardDesc = document.getElementById('wiznerd-desc');
        const cardPassive = document.getElementById('wiznerd-passive');
        const cardWeapon = document.getElementById('wiznerd-weapon');
        const cardAvatar = document.getElementById('wiznerd-avatar-img');

        if (cardDesc) cardDesc.textContent = meta.description;
        if (cardPassive) cardPassive.textContent = meta.passive;
        if (cardWeapon) cardWeapon.textContent = meta.startWeapon;
        if (cardAvatar && meta.avatar) cardAvatar.src = meta.avatar;

        if (window.activeGameScene) {
            soundFX.stopBGM();
            window.activeGameScene.scene.restart({ wizNerdId: id });
        }
    }

    applyWizNerdSelection('2396');
});
