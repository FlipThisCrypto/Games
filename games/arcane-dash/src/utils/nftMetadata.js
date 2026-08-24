// WizNerdz NFT Metadata & Trait Engine

export const WIZNERD_PRESETS = [
    {
        id: "2396",
        name: "WizNerd #2396 (Crystal Magus)",
        class: "Crystal Staff Magus",
        staff: "Obsidian Crystal Staff",
        avatar: "./assets/avatars/wiznerd_crimson_staff.png",
        hatColor: 0xd63031,
        hatTrimColor: 0xff7675,
        hatGem: 0xfdcb6e, // Glowing star gem on hat
        glassesColor: 0x8d5b4c,
        glassesLens: 0xdfe6e9,
        eyeColor: 0xcd6133,
        skinColor: 0xc8d6e5, // Lavender blue skin
        beardType: "brown",
        beardColor: 0x63422d,
        robeColor: 0xd63031,
        robeTrimColor: 0x2d3436,
        description: "Armed with the legendary Obsidian Crystal Staff and attuned to deep arcane ley lines. Shoots piercing crystal lasers and phase-dashes through obstacles.",
        abilityName: "Void Phase-Dash (Shift/X) & Wall-Jump",
        weaponName: "Crystal Laser Burst (Z/Click) | Charge for Mega Beam",
        hasPet: false,
        chargeMaxTime: 1000
    },
    {
        id: "1337",
        name: "WizNerd #1337 (Void Summoner)",
        class: "Void Summoner",
        staff: "Shadow Pet Familiar",
        avatar: "./assets/avatars/wiznerd_blue_pet.png",
        hatColor: 0x0984e3,
        hatTrimColor: 0x00cec9,
        hatGem: null,
        glassesColor: 0x8d5b4c,
        glassesLens: 0xdfe6e9,
        eyeColor: 0x0984e3,
        skinColor: 0xa8dadc,
        beardType: "white_long",
        beardColor: 0xffffff,
        robeColor: 0x0984e3,
        robeTrimColor: 0x00cec9,
        description: "Bonded with a living Shadow Familiar orb that hovers over his shoulder, automatically targeting nearby monsters with dark ether sparks.",
        abilityName: "Shadow Pet Companion + Wind Glide (Hold Jump)",
        weaponName: "Dual Shadow Bolts (Z/Click) | Charge for Void Nova",
        hasPet: true,
        chargeMaxTime: 1000
    },
    {
        id: "101",
        name: "WizNerd #101 (Pyromancer Scholar)",
        class: "Pyromancer",
        staff: "Blazing Flame",
        avatar: "./assets/avatars/wiznerd_orange.png",
        hatColor: 0xe17055,
        hatTrimColor: 0xf39c12,
        hatGem: null,
        glassesColor: 0x00b894, // Green nerd glasses
        glassesLens: 0xffffff,
        eyeColor: 0x0984e3,
        skinColor: 0xf5cd79,
        beardType: "white_long",
        beardColor: 0xffffff,
        robeColor: 0xe17055,
        robeTrimColor: 0xd35400,
        description: "Studied the ancient scrolls of infernal ignition. Casts ricocheting fireballs and performs scorching double jumps.",
        abilityName: "Flame Double-Jump (Jump in Air)",
        weaponName: "Bouncing Fireball (Z/Click) | Charge for Inferno Blast",
        hasPet: false,
        chargeMaxTime: 900
    },
    {
        id: "512",
        name: "WizNerd #512 (Illusionist)",
        class: "Illusionist",
        staff: "Gnarled Root Wand",
        avatar: "./assets/avatars/wiznerd_pink.png",
        hatColor: 0xfd79a8,
        hatTrimColor: 0xe84393,
        hatGem: null,
        glassesColor: 0xd63031, // Red nerd glasses
        glassesLens: 0xffffff,
        eyeColor: 0xf39c12,
        skinColor: 0xf5cd79,
        beardType: "brown",
        beardColor: 0x63422d,
        robeColor: 0xfd79a8,
        robeTrimColor: 0xe84393,
        description: "Manipulates time and matter. Freezes enemies into solid platform stepping-stones and slows gravity.",
        abilityName: "Slow Fall Gravity Control + Phase Blink",
        weaponName: "Root Entangle (Z/Click) | Charge for Mass Freeze Ring",
        hasPet: false,
        chargeMaxTime: 900
    },
    {
        id: "4040",
        name: "WizNerd #4040 (Golden Alchemist)",
        class: "Golden Alchemist",
        staff: "Alchemical Catalyst",
        avatar: "./assets/avatars/wiznerd_gold.png",
        hatColor: 0xe67e22,
        hatTrimColor: 0xf1c40f,
        hatGem: null,
        glassesColor: 0xb7791f, // Gold nerd glasses
        glassesLens: 0xffffff,
        eyeColor: 0xa87948,
        skinColor: 0xf5cd79,
        beardType: "brown",
        beardColor: 0x5d4037,
        robeColor: 0xe67e22,
        robeTrimColor: 0xf39c12,
        description: "Masters transmutative alchemy. Defeated foes yield speed/jump potions, and charged attacks create temporary gold bridges.",
        abilityName: "Elixir Transmutation + Golden Shield",
        weaponName: "Rapid Arcane Wand (Z/Click) | Charge for Midas Blast",
        hasPet: false,
        chargeMaxTime: 900
    }
];

export const WEAPON_CONFIGS = {
    "Obsidian Crystal Staff": {
        type: "crystal_laser",
        manaCost: 8,
        cooldown: 220,
        speedX: 520,
        speedY: 0,
        damage: 1.5,
        color: 0x00ffff,
        chargeType: "mega_crystal_beam"
    },
    "Shadow Pet Familiar": {
        type: "shadow_bolt",
        manaCost: 10,
        cooldown: 280,
        speedX: 420,
        speedY: 0,
        damage: 1.2,
        color: 0x9b51e0,
        chargeType: "void_storm"
    },
    "Blazing Flame": {
        type: "fireball",
        manaCost: 12,
        cooldown: 350,
        speedX: 340,
        speedY: -180,
        gravity: 700,
        bounce: 0.85,
        bouncesMax: 3,
        damage: 2.0,
        splashRadius: 55,
        color: 0xff5722,
        chargeType: "inferno_blast"
    },
    "Gnarled Root Wand": {
        type: "root_bolt",
        manaCost: 14,
        cooldown: 400,
        speedX: 360,
        speedY: 0,
        damage: 1.0,
        freezeDuration: 4000,
        color: 0x2ecc71,
        chargeType: "mass_freeze"
    },
    "Alchemical Catalyst": {
        type: "alchemy_bolt",
        manaCost: 6,
        cooldown: 180,
        speedX: 480,
        speedY: 0,
        damage: 1.0,
        color: 0xf1c40f,
        chargeType: "midas_burst"
    }
};

export function getWizNerdById(id) {
    const found = WIZNERD_PRESETS.find(w => w.id.toString() === id.toString());
    return found || WIZNERD_PRESETS[0];
}
