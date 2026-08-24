// Game 3: WizNerdz Tower of the Archmage - Configuration
export const TOWER_CONFIG = {
    WIDTH: 720,
    HEIGHT: 640,
    GRID: {
        ROWS: 7,
        COLS: 7,
        TILE_SIZE: 56,
        OFFSET_X: 164,
        OFFSET_Y: 210
    },
    RUNES: {
        FIRE: { id: 0, name: 'Fire Rune', color: '#e74c3c', effect: 'damage' },
        ICE: { id: 1, name: 'Ice Rune', color: '#00ffff', effect: 'freeze' },
        ARCANE: { id: 2, name: 'Arcane Rune', color: '#9b51e0', effect: 'mana' },
        LIFE: { id: 3, name: 'Life Rune', color: '#2ecc71', effect: 'heal' },
        SHIELD: { id: 4, name: 'Shield Rune', color: '#3498db', effect: 'shield' },
        SKULL: { id: 5, name: 'Dark Skull', color: '#e67e22', effect: 'power_strike' }
    }
};
