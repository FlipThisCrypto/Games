// NFT Metadata for Game 3: WizNerdz Tower of the Archmage

export const TOWER_WIZNERDS = [
    {
        id: '2396',
        name: 'WizNerd #2396 (Crystal Magus)',
        element: 'ARCANE',
        maxHp: 180,
        atkBonus: 1.2,
        specialSkill: 'Crystal Cataclysm (Deals 120 Arcane DMG & creates 3 Arcane Runes)',
        avatar: './assets/avatars/wiznerd_crimson_staff.png',
        description: 'Wields the Obsidian Staff to transmute matching runes into devastating crystal shatter combos.'
    },
    {
        id: '101',
        name: 'WizNerd #101 (Pyromancer)',
        element: 'FIRE',
        maxHp: 160,
        atkBonus: 1.4,
        specialSkill: 'Inferno Supernova (Deals 160 Fire DMG & explodes matching row)',
        avatar: './assets/avatars/wiznerd_orange.png',
        description: 'Blasts enemies with high-intensity fire rune cascades.'
    },
    {
        id: '1337',
        name: 'WizNerd #1337 (Void Summoner)',
        element: 'ARCANE',
        maxHp: 150,
        atkBonus: 1.15,
        specialSkill: 'Shadow Drain (Deals 90 DMG & leeches 40 HP)',
        avatar: './assets/avatars/wiznerd_blue_pet.png',
        description: 'Summons nether familiars that siphon vital mana from rival tower sentinels.'
    },
    {
        id: '512',
        name: 'WizNerd #512 (Illusionist)',
        element: 'ICE',
        maxHp: 140,
        atkBonus: 1.25,
        specialSkill: 'Absolute Zero (Freezes boss for 2 turns)',
        avatar: './assets/avatars/wiznerd_pink.png',
        description: 'Weaves illusions and glacial runes to stun tower bosses.'
    },
    {
        id: '4040',
        name: 'WizNerd #4040 (Golden Alchemist)',
        element: 'LIFE',
        maxHp: 200,
        atkBonus: 1.1,
        specialSkill: 'Philosopher Elixir (+80 HP & grants 50 Shield)',
        avatar: './assets/avatars/wiznerd_gold.png',
        description: 'Transmutes basic runes into golden shields and restorative potions.'
    }
];

export function getTowerWizNerdById(id) {
    return TOWER_WIZNERDS.find(w => w.id === id) || TOWER_WIZNERDS[0];
}
