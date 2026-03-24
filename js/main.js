// main.js - 2026 Edition
import { Graphics } from './graphics.js';
import { Physics } from './physics.js';
import { UI } from './ui.js';
import { AudioSynth } from './audio.js';
import { ITEMS, CAMPAIGN, INITIAL_STATE, ENVIRONMENTS } from './data.js';

class Game {
    constructor() {
        this.state = this.loadState();
        this.ui = new UI();
        this.audio = new AudioSynth();
        this.graphics = new Graphics(this.ui.canvas);
        this.physics = new Physics(24, 48); // Slightly wider field
        
        this.loopId = null;
        this.lastTime = 0;
        this.currentLevel = null;
        this.touchStartX = 0;
        this.paddleStartX = 0;
        
        this.init();
    }

    init() {
        // Fake Loading Sequence
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5 + Math.random() * 10;
            if(progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.setupHome(), 500);
            }
            this.ui.updateLoader(progress);
        }, 100);

        this.setupEvents();
        this.loop(0);
    }

    setupHome() {
        this.ui.show('home');
        this.graphics.setEnvironment('cyber_city'); // Default background
        this.audio.playSelect();
    }

    setupEvents() {
        // 1. Navigation
        document.getElementById('btn-campaign').onclick = () => {
            this.audio.playSelect();
            this.ui.show('campaign');
            this.ui.renderCarousel(CAMPAIGN, this.state.campaignProgress, (lvl) => {
                this.currentLevel = lvl;
                this.ui.updateLevelInfo(lvl);
                this.audio.playSelect();
            });
            // Auto-select latest
            const latest = CAMPAIGN[Math.min(this.state.campaignProgress, CAMPAIGN.length-1)];
            this.ui.updateLevelInfo(latest);
            this.currentLevel = latest;
        };

        document.getElementById('btn-quick').onclick = () => {
            this.audio.playSelect();
            this.startMatch(CAMPAIGN[0]);
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

        // 2. Input Handling (Relative Touch)
        const handleMove = (x, isRelative, startX) => {
            if (!this.state.matchActive) return;
            
            if (isRelative) {
                const delta = (x - startX) * 0.08; // Sensitivity
                this.physics.p1.x = Math.max(Math.min(this.paddleStartX + delta, 10), -10);
            } else {
                // Mouse fallback (Absolute)
                const normX = ((x / window.innerWidth) * 2 - 1) * 10;
                this.physics.p1.x = Math.max(Math.min(normX, 10), -10);
            }
            
            if (this.pPaddleMesh) this.pPaddleMesh.position.x = this.physics.p1.x;
        };

        // Touch
        window.addEventListener('touchstart', (e) => {
            if (!this.state.matchActive) return;
            this.touchStartX = e.touches[0].clientX;
            this.paddleStartX = this.physics.p1.x;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.state.matchActive) return;
            e.preventDefault();
            handleMove(e.touches[0].clientX, true, this.touchStartX);
        }, { passive: false });

        // Mouse
        window.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, false, 0);
        });
        
        // Expose start match
        window.startMatch = () => {
            if(this.currentLevel) this.startMatch(this.currentLevel);
        };
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
        
        // 1. Setup Environment
        this.graphics.setEnvironment(levelData.env || 'cyber_city');
        
        // 2. Reset Physics
        this.physics.resetBall(0.35); // Base speed
        this.physics.p1.x = 0;
        this.physics.p2.x = 0;

        // 3. Clear & Rebuild Scene
        if (this.pPaddleMesh) this.graphics.scene.remove(this.pPaddleMesh);
        if (this.aiPaddleMesh) this.graphics.scene.remove(this.aiPaddleMesh);
        if (this.ballMesh) this.graphics.scene.remove(this.ballMesh);

        const pItem = ITEMS.find(i => i.id === this.state.equipped.paddle);
        const bItem = ITEMS.find(i => i.id === this.state.equipped.ball);
        
        this.pPaddleMesh = this.graphics.createPaddle(pItem.color, true);
        this.pPaddleMesh.position.z = this.physics.p1.z;
        
        this.aiPaddleMesh = this.graphics.createPaddle(levelData.color, false);
        this.aiPaddleMesh.position.z = this.physics.p2.z;
        
        this.ballMesh = this.graphics.createBall(bItem.color);
        
        // 4. UI Transition
        this.ui.show('game');
        this.ui.updateHUD(0, 0);
        this.ui.showMatchMessage('READY');
        
        setTimeout(() => this.ui.showMatchMessage('ENGAGE'), 1500);
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state.matchActive && dt < 0.1) {
            // AI Logic
            const aiSpeed = this.currentLevel.speed;
            const targetX = this.physics.ball.x;
            this.physics.p2.x += (targetX - this.physics.p2.x) * aiSpeed;
            this.physics.p2.x = Math.max(Math.min(this.physics.p2.x, 10), -10);
            this.aiPaddleMesh.position.x = this.physics.p2.x;

            // Physics Update
            const result = this.physics.update(dt);
            
            // Sync Visuals
            this.ballMesh.position.x = this.physics.ball.x;
            this.ballMesh.position.z = this.physics.ball.z;
            this.ballMesh.rotation.x += this.physics.ball.vz;
            this.ballMesh.rotation.z -= this.physics.ball.vx;

            // Collision Effects
            if (result) {
                if (result === 'wall') {
                    this.audio.playWall();
                    this.graphics.shakeCamera(0.2);
                } else if (result === 'p1' || result === 'p2') {
                    this.audio.playHit();
                    this.graphics.spawnImpact(this.ballMesh.position, result === 'p1' ? 0x00f2ff : 0xff0055);
                    this.graphics.shakeCamera(0.6);
                    if (navigator.vibrate) navigator.vibrate(20); // Haptics
                } else if (result.startsWith('score')) {
                    const isPlayer = result === 'score_p2'; // Top side check
                    
                    if (isPlayer) this.pScore++; else this.eScore++;
                    
                    this.audio.playScore(isPlayer);
                    this.ui.showMatchMessage(isPlayer ? 'GOAL!' : 'BREACH!');
                    this.ui.updateHUD(this.pScore, this.eScore);
                    this.graphics.shakeCamera(1.0);
                    if (navigator.vibrate) navigator.vibrate(50);
                    
                    if (this.pScore >= 5 || this.eScore >= 5) {
                        this.endMatch(this.pScore >= 5);
                    } else {
                        this.physics.resetBall(0.4 + (this.pScore+this.eScore)*0.03);
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

window.game = new Game();