# 🧙‍♂️ WizNerdz Games Suite

Welcome to the official repository for the **WizNerdz Gaming Universe**, a multi-game Web3-enabled arcade portal powered by HTML5, Phaser 3, and modern browser standards.

---

## 📁 Repository Structure

This repository is designed to host multiple independent and interconnected games cleanly organized in the `games/` directory:

```
/
├── index.html                  # WizNerdz Arcade Portal & Game Hub
├── README.md                   # Repository overview & developer guide
├── .gitignore                  # Git ignore rules
└── games/
    └── arcane-dash/            # Game 1: 2D Action Platformer
        ├── index.html          # Game launcher & standalone entrypoint
        ├── assets/
        │   └── avatars/        # Official WizNerd pixel art portraits
        └── src/
            ├── main.js         # Phaser 3 setup & HUD bridge
            ├── config.js       # Resolution, physics, and keybindings
            ├── entities/       # Player, Enemy, Projectile, Familiar, InteractiveObjects
            ├── scenes/         # PreloadScene, GameScene
            └── utils/          # nftMetadata, soundFX, textureGenerator
```

---

## 🎮 Available Games

### 1. **WizNerdz: Arcane Dash** (`games/arcane-dash/`)
- **Genre**: 2D Action Platformer
- **Inspiration**: *Mega Man*, *Cave Story*, *Noita*, *Celeste*
- **Features**:
  - 5 Authentic WizNerd NFT Characters with unique stats, staff weapons, and passives.
  - Charged spell attacks, wall-sliding, wall-jumping, and double-jumping.
  - Interactive board mechanics: Spring Mushroom Pads, Mana Geysers, Crystal Switches, Energy Barriers, Destructible Pots, and Crumbling Platforms.
  - Autonomous Floating Shadow Pet Familiar companion.
  - Procedural 8-bit Web Audio synthesis (zero audio asset dependencies).

---

## 🚀 How to Run Locally

You can run any local static HTTP server from the root of this repository:

```bash
# Python
python -m http.server 8080

# Node / NPX
npx serve .
```

Then open `http://localhost:8080` in your web browser.

---

## 🛠️ Adding New Games

To add a new game to the suite:
1. Create a dedicated folder under `games/<your-game-name>/` (e.g. `games/arcane-survivor/`).
2. Include an `index.html` entrypoint and necessary game modules inside that directory.
3. Add a launcher card to the main Arcade Hub in `/index.html`.
