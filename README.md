# 🧙‍♂️ WizNerdz Arcade - Multi-Game Universe

A high-performance browser arcade suite inspired by classic 2D action games and powered by **Phaser 3** and modern JavaScript, celebrating the **WizNerdz** pixel art NFT collection.

Live Portal: [`index.html`](./index.html)  
GitHub Repository: [https://github.com/FlipThisCrypto/Games](https://github.com/FlipThisCrypto/Games)

---

## 🎮 The Three Flagship Arcade Titles

### 1. **WizNerdz: Arcane Dash** (`games/arcane-dash/`)
- **Genre**: 2D Fast-Paced Action Platformer & Speedrun Challenge.
- **Features**:
  - **3 Distinct Dungeon Stages**: *Crystal Caverns*, *Nether Ley-Lines*, and *Archmage Pinnacle*.
  - **Dynamic Acrobatics**: Double jumping, wall-sliding, wall-kicking, mana geysers, spring pads, and crumbling platforms.
  - **Tactical Combat**: Charged staff projectiles, destructible rune barriers, slime stomping, freeze ice platforms, and Arcane Sentry turrets with projectile clashing.
  - **6 In-Game Achievements**: Real-time toast notifications and badge collection modal.
  - **Hall of Archmagi Leaderboard**: Sub-millisecond speedrun time tracking.
  - **Virtual Touch Controls**: Full mobile and tablet support.

### 2. **WizNerdz: Void Survivor** (`games/void-survivor/`)
- **Genre**: Auto-Spellcaster Horde Survival Roguelite (Vampire Survivors style).
- **Features**:
  - **360° Top-Down Arena**: Endless swarms of Void Crawlers, Bats, and Elite Brutes.
  - **Autonomous Auto-Casting**: Orbiting Crystals, expanding Inferno Rings, 8-way Void Novas, and Arcane Thunderbolts.
  - **Familiar Pet Combat AI**: Autonomous Shadow Pet companion for WizNerd #1337 tracking and blasting elite foes.
  - **Relic Drops**: Rare treasure chests for instant spell upgrades and arcane vacuum magnets.
  - **Persistent Survival Records**: Survival time and kill count leaderboard.

### 3. **WizNerdz: Tower of the Archmage** (`games/tower-of-archmage/`)
- **Genre**: Turn-Based Rune Match-3 Combat RPG & Dungeon Crawler.
- **Features**:
  - **7x7 Rune Grid**: Match Fire (DMG), Ice (Stun/Weakness), Arcane (Mana), Life (Heal), Shield (Armor), and Skull (Crit Strike) runes.
  - **5-Floor Boss Gauntlet**: Void Stone Golem, Crystal Weaver Spider, Arch-Lich Malakar, Nether Dragon, and Archmage Valerius Supreme.
  - **Character Signature Ultimates**:
    - `#2396 (Crystal Magus)`: *Crystal Cataclysm* (130 DMG + 4 Arcane Runes)
    - `#101 (Pyromancer)`: *Inferno Supernova* (160 DMG + row explosion)
    - `#1337 (Void Summoner)`: *Shadow Drain* (90 DMG + 50 HP Life Steal)
    - `#512 (Illusionist)`: *Absolute Zero* (80 DMG + 50% Boss Attack Weakening)
    - `#4040 (Golden Alchemist)`: *Philosopher Elixir* (+80 HP & +60 Shield)
  - **Dungeon Ascent Leaderboard**: Records top floor ascents and victories.

---

## 🧙‍♂️ Authentic WizNerd NFT Character Roster

| WizNerd ID | Name / Class | Signature Weapon | Passives & Special Skills |
| :--- | :--- | :--- | :--- |
| **#2396** | **Crystal Magus** | Obsidian Crystal Staff | Piercing Mega Beam laser, Orbiting Crystals, Cataclysm |
| **#1337** | **Void Summoner** | Shadow Tendril Staff | Orbiting Shadow Pet Familiar, Void Nova, Shadow Drain |
| **#101** | **Pyromancer** | Cinder Flame Staff | High Jump / Double Jump, Inferno Fireball, Supernova |
| **#512** | **Illusionist** | Prismatic Wand | Wind Glide, Prismatic Rapid Bolt, Absolute Zero Stun |
| **#4040** | **Golden Alchemist** | Philosopher Cane | Alchemical Potions drop on kill, Gem Magnet, Elixir Shield |

---

## 🌐 Unified Web3 Architecture & Data Persistence

The root portal (`index.html`) automatically links and shares player state across all games using `localStorage`:
- `wiznerdz_wallet`: Synced Web3 wallet session address.
- `wiznerdz_audio_muted`: Global sound mute/unmute preference.
- `wiznerdz_leaderboard`: Arcane Dash speedrun records.
- `wiznerdz_survivor_leaderboard`: Void Survivor high scores.
- `wiznerdz_tower_leaderboard`: Tower of Archmage floor ascents.
- `wiznerdz_achievements`: Unlocked badge IDs.
- **Unified Profile System**: Aggregates cross-game metrics into a calculated **Global Arcane Master Rank** (*Novice $\rightarrow$ Adept $\rightarrow$ Archmage $\rightarrow$ Grand Magus Supreme*).

---

## 🚀 Local Development Setup

No build step required! Simply run a local HTTP server:

```bash
# Python 3
python -m http.server 8080

# Or Node.js
npx serve .
```

Open your browser to:
- **Arcade Portal**: `http://localhost:8080/index.html`
- **Game 1 (Arcane Dash)**: `http://localhost:8080/games/arcane-dash/index.html`
- **Game 2 (Void Survivor)**: `http://localhost:8080/games/void-survivor/index.html`
- **Game 3 (Tower of Archmage)**: `http://localhost:8080/games/tower-of-archmage/index.html`
