// Game 2: WizNerdz Void Survivor - Configuration
export const SURVIVOR_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600,
    WORLD: {
        WIDTH: 2400,
        HEIGHT: 2400
    },
    PLAYER: {
        BASE_SPEED: 210,
        BASE_HP: 100,
        BASE_PICKUP_RADIUS: 90
    },
    SPELLS: {
        CRYSTAL_ORB: { name: 'Orbiting Crystals', damage: 25, cooldown: 1200, count: 2 },
        FIRE_RING: { name: 'Inferno Ring', damage: 40, cooldown: 1800, radius: 110 },
        VOID_NOVA: { name: 'Void Nova', damage: 60, cooldown: 2600, count: 8 },
        LIGHTNING_STRIKE: { name: 'Arcane Thunder', damage: 80, cooldown: 2200 }
    }
};
