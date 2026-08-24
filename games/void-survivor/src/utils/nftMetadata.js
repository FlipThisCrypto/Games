// NFT Metadata for Game 2: WizNerdz Void Survivor

export const SURVIVOR_WIZNERDS = [
    {
        id: '2396',
        name: 'WizNerd #2396 (Crystal Magus)',
        title: 'Obsidian Magus',
        skin: 'Lavender Mystic',
        headwear: 'Crimson Hat w/ Star Gem',
        staff: 'Obsidian Crystal Staff',
        glasses: 'Vintage Nerd Frames',
        startWeapon: 'CRYSTAL_ORB',
        baseHp: 120,
        speedMult: 1.0,
        passive: '+20% Spell Area & Extra Orbiting Crystal',
        avatar: './assets/avatars/wiznerd_crimson_staff.png',
        description: 'Commanding ancient obsidian prisms that spin around the wizard, pulverizing encroaching swarms.'
    },
    {
        id: '1337',
        name: 'WizNerd #1337 (Void Summoner)',
        title: 'Nether Archmage',
        skin: 'Pale Ether',
        headwear: 'Cyan Striped Wizard Cowl',
        staff: 'Shadow Tendril Staff',
        glasses: 'Void Glasses',
        startWeapon: 'VOID_NOVA',
        baseHp: 100,
        speedMult: 1.1,
        passive: 'Starts with Autonomous Shadow Pet Familiar',
        avatar: './assets/avatars/wiznerd_blue_pet.png',
        description: 'Channeling nether rifts with a loyal shadow pet that seeks out elite enemies.'
    },
    {
        id: '101',
        name: 'WizNerd #101 (Pyromancer)',
        title: 'Inferno Scholar',
        skin: 'Bearded Flame Mage',
        headwear: 'Molten Orange Wizard Hat',
        staff: 'Cinder Staff',
        glasses: 'Emerald Nerd Glasses',
        startWeapon: 'FIRE_RING',
        baseHp: 110,
        speedMult: 1.05,
        passive: '+25% Damage & Burning Ignite Aura',
        avatar: './assets/avatars/wiznerd_orange.png',
        description: 'Surrounds the caster in an expanding ring of blazing inferno flames that burns void beasts.'
    },
    {
        id: '512',
        name: 'WizNerd #512 (Illusionist)',
        title: 'Mirage Weavemaster',
        skin: 'Rose Mystic',
        headwear: 'Magenta Pointed Hat',
        staff: 'Prismatic Wand',
        glasses: 'Ruby Nerd Glasses',
        startWeapon: 'LIGHTNING_STRIKE',
        baseHp: 90,
        speedMult: 1.2,
        passive: '+30% Movement Speed & Faster Cooldowns',
        avatar: './assets/avatars/wiznerd_pink.png',
        description: 'Calls down thunderbolts from the storm while moving with unmatched agility.'
    },
    {
        id: '4040',
        name: 'WizNerd #4040 (Golden Alchemist)',
        title: 'Midas Transmuter',
        skin: 'Golden Scholar',
        headwear: 'Gilded Topaz Hat',
        staff: 'Philosopher Cane',
        glasses: 'Gold Wireframes',
        startWeapon: 'CRYSTAL_ORB',
        baseHp: 130,
        speedMult: 0.95,
        passive: '+50% Gold / XP Drop Rate & Magnet Range',
        avatar: './assets/avatars/wiznerd_gold.png',
        description: 'Draws XP gems from afar and transmutes defeated foes into bonus arcane relics.'
    }
];

export function getSurvivorWizNerdById(id) {
    return SURVIVOR_WIZNERDS.find(w => w.id === id) || SURVIVOR_WIZNERDS[0];
}
