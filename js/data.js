// data.js - PRO Edition
export const ITEMS = [
    { 
        id: 'pad_striker', name: 'CORE SERIES 1', type: 'paddle', price: 0, 
        desc: 'Balanced. Standard issue for professional circuits.', 
        stats: { speed: 50, control: 50 },
        color: 0x888888
    },
    { 
        id: 'pad_heavy', name: 'TITAN X', type: 'paddle', price: 500, 
        desc: 'Heavy alloy construction. High impact power.', 
        stats: { speed: 30, control: 40 },
        color: 0x444444
    },
    { 
        id: 'pad_swift', name: 'VIPER R', type: 'paddle', price: 1000, 
        desc: 'Carbon fiber weave. Peak reaction speed.', 
        stats: { speed: 90, control: 80 },
        color: 0xffffff
    },
    { id: 'ball_std', name: 'PRO BALL', type: 'ball', price: 0, color: 0xffffff },
    { id: 'ball_fire', name: 'PHOENIX', type: 'ball', price: 800, color: 0xff3344 }
];

export const CAMPAIGN = [
    {
        id: 1,
        name: 'QUALIFIERS',
        opponent: 'ROOKIE-7',
        desc: 'Basic training simulation for the Pro Circuit.',
        speed: 0.1,
        color: 0x555555,
        winReward: { xp: 100, cr: 50 }
    },
    {
        id: 2,
        name: 'REGIONAL SEMIS',
        opponent: 'VETERAN',
        desc: 'Higher speed, calculated angles.',
        speed: 0.15,
        color: 0x111111,
        winReward: { xp: 300, cr: 200 }
    },
    {
        id: 3,
        name: 'GRAND FINALS',
        opponent: 'THE MACHINE',
        desc: 'Perfect logic. Near-instant response.',
        speed: 0.22,
        color: 0x00ccff,
        winReward: { xp: 1000, cr: 1000 }
    }
];

export const INITIAL_STATE = {
    xp: 0,
    credits: 0,
    campaignProgress: 0,
    inventory: ['pad_striker', 'ball_std'],
    equipped: { paddle: 'pad_striker', ball: 'ball_std' },
    matchActive: false
};