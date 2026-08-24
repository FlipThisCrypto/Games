// Game Constants & Configuration
export const GAME_CONFIG = {
    WIDTH: 800,
    HEIGHT: 450,
    GRAVITY: 850,
    PLAYER: {
        WALK_SPEED: 190,
        RUN_SPEED: 260,
        JUMP_FORCE: -480,
        BOUNCE_FORCE: -280,
        GLIDE_GRAVITY: 140,
        DASH_SPEED: 420,
        DASH_DURATION: 220,
        DASH_COOLDOWN: 1200,
        INVULNERABLE_TIME: 1500
    },
    PROJECTILE_SPEED: {
        FIRE_STAFF: { x: 260, y: -180 },
        WOODEN_WAND: { x: 440, y: 0 },
        GNARLED_STAFF: { x: 300, y: 0 },
        PULSE: { radius: 70 }
    },
    LEVEL: {
        WIDTH: 3600,
        HEIGHT: 450,
        TILE_SIZE: 32
    }
};
