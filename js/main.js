// main.js - Game Entry Point
import { Graphics } from './graphics.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';
import { AudioSynth } from './audio.js';
import { ITEMS, CAMPAIGN, INITIAL_STATE } from './data.js';

class Game {
    constructor() {
        this.state = this.loadState();
        this.ui = new UI();
        this.audio = new AudioSynth();
        this.graphics = new Graphics(this.ui.canvas);
        this.physics = new Physics(22, 44); // Field size
        
        this.loopId = null;
        this.lastTime = 0;
        this.currentLevel = null;
        
        this.init();
    }

    init() {
        // Fake Loading
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if(progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.setupHome();
            }
            this.ui.updateLoader(progress);
        }, 200);

        this.setupEvents();
        this.loop(0);
    }

    setupHome() {
        this.ui.show('home');
        this.audio.playSelect(); // Initial sound
    }

    setupEvents() {
        // Menu Navigation
        document.getElementById('btn-campaign').onclick = () => {
            this.audio.playSelect();
            this.ui.show('campaign');
            this.ui.renderCarousel(CAMPAIGN, this.state.campaignProgress, (lvl) => {
                this.ui.updateLevelInfo(lvl);
                this.audio.playSelect();
            });
            // Select first available by default
            const current = CAMPAIGN[Math.min(this.state.campaignProgress, CAMPAIGN.length-1)];
            this.ui.updateLevelInfo(current);
        };

        document.getElementById('btn-quick').onclick = () => {
            this.audio.playSelect();
            this.startMatch(CAMPAIGN[0]); // Quick match is just level 1
        };

        document.getElementById('btn-shop').onclick = () => {
            this.audio.playSelect();
            this.ui.show('shop');
            this.renderShop();
        };

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.onclick = () => {
                this.audio.playSelect();
                this.ui.show(btn.dataset.target);
            };
        });

        // Shop Actions
        const buyBtn = document.getElementById('btn-buy-equip');
        // Logic handled in UI render callback
        
        // Game Input
        window.addEventListener('mousemove', (e) => {
            if (this.state.matchActive) {
                const x = ((e.clientX / window.innerWidth) * 2 - 1) * (this.physics.field.w/2 - 2);
                this.physics.p1.x = Math.max(Math.min(x, 9), -9);
                if (this.pPaddleMesh) this.pPaddleMesh.position.x = this.physics.p1.x;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.state.matchActive) {
                e.preventDefault();
                const x = ((e.touches[0].clientX / window.innerWidth) * 2 - 1) * (this.physics.field.w/2 - 2);
                this.physics.p1.x = Math.max(Math.min(x, 9), -9);
                if (this.pPaddleMesh) this.pPaddleMesh.position.x = this.physics.p1.x;
            }
        }, { passive: false });
        
        // Expose start match to window for UI
        window.startMatch = (lvl) => this.startMatch(lvl);
    }

    renderShop() {
        this.ui.renderShop(ITEMS, this.state.inventory, this.state.credits, 
            (item) => { // Buy
                if (this.state.credits >= item.price) {
                    this.state.credits -= item.price;
                    this.state.inventory.push(item.id);
                    this.audio.playPowerUp();
                    this.saveState();
                    this.renderShop();
                }
            },
            (item) => { // Equip
                if (item.type === 'paddle') this.state.equipped.paddle = item.id;
                else this.state.equipped.ball = item.id;
                this.audio.playSelect();
                this.saveState();
                this.renderShop();
            }
        );
    }

    startMatch(levelData) {
        this.currentLevel = levelData;
        this.state.matchActive = true;
        this.pScore = 0;
        this.eScore = 0;
        
        // Reset Physics
        this.physics.resetBall(0.3); // Base speed
        
        // Setup 3D Scene
        // Clear old meshes
        if (this.pPaddleMesh) this.graphics.scene.remove(this.pPaddleMesh);
        if (this.aiPaddleMesh) this.graphics.scene.remove(this.aiPaddleMesh);
        if (this.ballMesh) this.graphics.scene.remove(this.ballMesh);

        // Get Player Stats
        const pItem = ITEMS.find(i => i.id === this.state.equipped.paddle);
        const bItem = ITEMS.find(i => i.id === this.state.equipped.ball);
        
        // Create Meshes
        this.pPaddleMesh = this.graphics.createPaddle(pItem.color);
        this.pPaddleMesh.position.z = this.physics.p1.z;
        
        this.aiPaddleMesh = this.graphics.createPaddle(levelData.color); // Enemy Color
        this.aiPaddleMesh.position.z = this.physics.p2.z;
        
        this.ballMesh = this.graphics.createBall(bItem.color);
        
        this.ui.show('game');
        this.ui.updateHUD(0, 0);
        this.ui.showMatchMessage('READY');
        
        setTimeout(() => this.ui.showMatchMessage('GO!'), 1500);
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state.matchActive && dt < 0.1) {
            // Update AI
            const aiSpeed = this.currentLevel.speed;
            const targetX = this.physics.ball.x;
            // Simple reaction delay simulation using Lerp
            this.physics.p2.x += (targetX - this.physics.p2.x) * aiSpeed;
            // Clamp
            this.physics.p2.x = Math.max(Math.min(this.physics.p2.x, 9), -9);
            this.aiPaddleMesh.position.x = this.physics.p2.x;

            // Physics Step
            const result = this.physics.update(dt);
            
            // Sync Visuals
            this.ballMesh.position.x = this.physics.ball.x;
            this.ballMesh.position.z = this.physics.ball.z;
            // Add simple rotation
            this.ballMesh.rotation.x += this.physics.ball.vz;
            this.ballMesh.rotation.z -= this.physics.ball.vx;

            // Handle Events
            if (result) {
                if (result === 'wall') {
                    this.audio.playWall();
                    this.graphics.shakeCamera(0.2);
                } else if (result === 'p1' || result === 'p2') {
                    this.audio.playHit();
                    this.graphics.spawnParticles(this.ballMesh.position, result === 'p1' ? 0xffaa00 : 0xff0055);
                    this.graphics.shakeCamera(0.5);
                } else if (result.startsWith('score')) {
                    const isPlayer = result === 'score_p2'; // Ball went past P2 (Top) -> Player Scored? No, Wait.
                    // Physics: Z > fieldH/2 is Top (Enemy side). So if ball > Top, Player Scored.
                    
                    if (isPlayer) this.pScore++; else this.eScore++;
                    
                    this.audio.playScore(isPlayer);
                    this.ui.showMatchMessage(isPlayer ? 'SCORE!' : 'MISS!');
                    this.ui.updateHUD(this.pScore, this.eScore);
                    
                    if (this.pScore >= 5 || this.eScore >= 5) {
                        this.endMatch(this.pScore >= 5);
                    } else {
                        this.physics.resetBall(0.3 + (this.pScore+this.eScore)*0.02);
                    }
                }
            }
        }

        this.graphics.update();
        requestAnimationFrame((t) => this.loop(t));
    }

    endMatch(victory) {
        this.state.matchActive = false;
        setTimeout(() => {
            this.ui.show('result');
            const title = document.getElementById('result-title');
            const xpEl = document.getElementById('res-xp');
            const crEl = document.getElementById('res-cr');
            
            if (victory) {
                title.innerText = "VICTORY";
                title.style.color = "#00f2ff";
                this.audio.playPowerUp();
                
                // Rewards
                const reward = this.currentLevel.winReward;
                xpEl.innerText = "+" + reward.xp;
                crEl.innerText = "+" + reward.cr;
                
                // Update State
                this.state.xp += reward.xp;
                this.state.credits += reward.cr;
                if (this.currentLevel.id > this.state.campaignProgress) {
                    this.state.campaignProgress = this.currentLevel.id;
                }
                this.saveState();
            } else {
                title.innerText = "DEFEAT";
                title.style.color = "#ff0055";
                xpEl.innerText = "+10";
                crEl.innerText = "+5";
                this.state.credits += 5;
                this.saveState();
            }

            document.getElementById('btn-continue').onclick = () => {
                this.audio.playSelect();
                this.setupHome();
            };
        }, 1000);
    }

    loadState() {
        const s = localStorage.getItem('neon_pong_save');
        return s ? { ...INITIAL_STATE, ...JSON.parse(s) } : { ...INITIAL_STATE };
    }

    saveState() {
        localStorage.setItem('neon_pong_save', JSON.stringify(this.state));
    }
}

// Start
window.game = new Game();