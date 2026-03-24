// data.js - Items, Enemies, Levels, Environments
export const ITEMS = [
    { 
        id: 'pad_striker', name: 'Striker', type: 'paddle', price: 0, 
        desc: 'Balanced. Standard Issue.', 
        stats: { speed: 60, control: 60, power: 50 },
        color: 0x00f2ff, model: 'box' 
    },
    { 
        id: 'pad_heavy', name: 'Titan', type: 'paddle', price: 300, 
        desc: 'Crushing blows. Slow movement.', 
        stats: { speed: 30, control: 40, power: 95 },
        color: 0xff4400, model: 'wide' 
    },
    { 
        id: 'pad_swift', name: 'Viper', type: 'paddle', price: 600, 
        desc: 'Lightning fast reflexes.', 
        stats: { speed: 95, control: 85, power: 30 },
        color: 0x00ff88, model: 'thin' 
    },
    { 
        id: 'pad_curve', name: 'Phantom', type: 'paddle', price: 1200, 
        desc: 'Unpredictable spin master.', 
        stats: { speed: 70, control: 100, power: 45 },
        color: 0xaa00ff, model: 'curved' 
    },
    
    { id: 'ball_std', name: 'Core', type: 'ball', price: 0, color: 0xffffff },
    { id: 'ball_fire', name: 'Solar', type: 'ball', price: 400, color: 0xffaa00 },
    { id: 'ball_void', name: 'Abyss', type: 'ball', price: 800, color: 0xaa00aa },
    { id: 'ball_plasma', name: 'Plasma', type: 'ball', price: 1500, color: 0x00ff88 }
];

export const ENVIRONMENTS = {
    'cyber_city': {
        name: 'Cyber City',
        skyColor: 0x0a0a1a,
        gridColor: 0x00f2ff,
        sunColor: 0xff00cc,
        fogDensity: 0.02,
        particles: 'digital' // rain code
    },
    'magma_core': {
        name: 'Magma Core',
        skyColor: 0x1a0505,
        gridColor: 0xff4400,
        sunColor: 0xffaa00,
        fogDensity: 0.03,
        particles: 'embers' // rising sparks
    },
    'zen_garden': {
        name: 'Neon Zen',
        skyColor: 0x1a0a1a,
        gridColor: 0xff88cc,
        sunColor: 0xffffff,
        fogDensity: 0.015,
        particles: 'petals' // pink drift
    },
    'ice_void': {
        name: 'Glacier Void',
        skyColor: 0x001122,
        gridColor: 0x00ffff,
        sunColor: 0x88ffff,
        fogDensity: 0.02,
        particles: 'snow'
    }
};

export const CAMPAIGN = [
    {
        id: 1,
        name: 'Sector 1: The Slums',
        opponent: 'RUSTY',
        desc: 'A rusted training droid from the old wars.',
        difficulty: 0.3,
        speed: 0.09,
        color: 0xaa8855,
        env: 'cyber_city',
        winReward: { xp: 100, cr: 50 }
    },
    {
        id: 2,
        name: 'Sector 2: Magma Forge',
        opponent: 'IGNIS',
        desc: 'Aggressive styling. Watch the heat.',
        difficulty: 0.2,
        speed: 0.13,
        color: 0xff4400,
        env: 'magma_core',
        winReward: { xp: 250, cr: 150 }
    },
    {
        id: 3,
        name: 'Sector 3: Cyber Garden',
        opponent: 'LOTUS',
        desc: 'Flow like water. Strike like ice.',
        difficulty: 0.1,
        speed: 0.16,
        color: 0xff88cc,
        env: 'zen_garden',
        winReward: { xp: 500, cr: 300 }
    },
    {
        id: 4,
        name: 'Sector 4: Deep Freeze',
        opponent: 'ZERO',
        desc: 'Absolute zero reaction time.',
        difficulty: 0.05, 
        speed: 0.22,
        color: 0x00ffff,
        env: 'ice_void',
        winReward: { xp: 1000, cr: 1000 }
    }
];

export const INITIAL_STATE = {
    xp: 0,
    credits: 0,
    level: 1,
    settings: { volume: 1.0, haptics: true },
    inventory: ['pad_striker', 'ball_std'],
    equipped: { paddle: 'pad_striker', ball: 'ball_std' },
    campaignProgress: 0
};