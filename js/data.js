// data.js - Items, Enemies, Levels
export const ITEMS = [
    // Paddles
    { 
        id: 'pad_striker', 
        name: 'Striker', 
        type: 'paddle', 
        price: 0, 
        desc: 'Standard Issue. Balanced.', 
        stats: { speed: 50, control: 50, power: 50 },
        color: 0x00f2ff, 
        model: 'box' 
    },
    { 
        id: 'pad_heavy', 
        name: 'Titan', 
        type: 'paddle', 
        price: 250, 
        desc: 'Slow but powerful hits.', 
        stats: { speed: 20, control: 40, power: 90 },
        color: 0xff4400, 
        model: 'wide' 
    },
    { 
        id: 'pad_swift', 
        name: 'Viper', 
        type: 'paddle', 
        price: 500, 
        desc: 'Incredibly fast but weak.', 
        stats: { speed: 95, control: 80, power: 30 },
        color: 0x00ff88, 
        model: 'thin' 
    },
    { 
        id: 'pad_curve', 
        name: 'Ghost', 
        type: 'paddle', 
        price: 1000, 
        desc: 'Master of spin.', 
        stats: { speed: 60, control: 100, power: 40 },
        color: 0xaa00ff, 
        model: 'curved' 
    },
    
    // Balls (Cosmetic mainly, slight physics tweak)
    { id: 'ball_std', name: 'Core', type: 'ball', price: 0, color: 0xffffff, trail: 'blue' },
    { id: 'ball_fire', name: 'Comet', type: 'ball', price: 300, color: 0xffaa00, trail: 'orange' },
    { id: 'ball_void', name: 'Null', type: 'ball', price: 600, color: 0xaa00aa, trail: 'purple' }
];

export const CAMPAIGN = [
    {
        id: 1,
        name: 'The Slums',
        opponent: 'Rusty',
        desc: 'A rusted training droid from the old wars.',
        difficulty: 0.3, // AI Reaction delay factor (lower is harder)
        speed: 0.08,    // AI Movement speed
        color: 0x885522,
        winReward: { xp: 100, cr: 50 }
    },
    {
        id: 2,
        name: 'Neon District',
        opponent: 'Viper',
        desc: 'Fast and aggressive street racer.',
        difficulty: 0.2,
        speed: 0.12,
        color: 0x00ff00,
        winReward: { xp: 250, cr: 150 }
    },
    {
        id: 3,
        name: 'High Rise',
        opponent: 'Echo',
        desc: 'Calculated precision. Watch the angles.',
        difficulty: 0.1,
        speed: 0.15,
        color: 0x0088ff,
        winReward: { xp: 500, cr: 300 }
    },
    {
        id: 4,
        name: 'The Spire',
        opponent: 'OMEGA',
        desc: 'The Grandmaster. Perfection incarnate.',
        difficulty: 0.05, // Almost instant reaction
        speed: 0.2,      // Very fast
        color: 0xff0000,
        winReward: { xp: 1000, cr: 1000 }
    }
];

export const INITIAL_STATE = {
    xp: 0,
    credits: 0,
    level: 1,
    inventory: ['pad_striker', 'ball_std'],
    equipped: { paddle: 'pad_striker', ball: 'ball_std' },
    campaignProgress: 0 // Index of last beaten level
};