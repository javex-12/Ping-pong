// main.js - PRO PONG 2026 Edition
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
        this.physics = new Physics(26, 48); // Field size
        
        this.lastTime = 0;
        this.currentLevel = null;
        this.isPaused = false;
        
        // Touch state
        this.touchStartX = 0;
        this.paddleStartX = 0;
        
        this.init();
    }

    init() {
        // High-end loading sequence
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5 + Math.random() * 10;
            if(progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.ui.show('home'), 800);
            }
            this.ui.updateLoader(progress);
        }, 80);

        this.setupEvents();
        this.loop(0);
    }

    setupEvents() {
        // Navigation
        document.getElementById('btn-campaign').onclick = () => {
            this.audio.playSelect();
            this.ui.show('campaign');
            this.ui.renderCarousel(CAMPAIGN, this.state.campaignProgress, (lvl) => {
                this.currentLevel = lvl;
                this.ui.updateLevelInfo(lvl);
                this.audio.playSelect();
            });
            // Select latest
            const latest = CAMPAIGN[Math.min(this.state.campaignProgress, CAMPAIGN.length-1)];
            this.ui.updateLevelInfo(latest);
            this.currentLevel = latest;
        };

        document.getElementById('btn-shop').onclick = () => {
            this.audio.playSelect();
            this.ui.show('shop');
            this.renderShop();
        };

        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.onclick = () => {
                this.audio.playSelect();
                this.isPaused = false;
                this.state.matchActive = false;
                this.ui.show(btn.dataset.target);
            };
        });

        // Pause / Resume
        document.getElementById('btn-pause').onclick = () => {
            this.isPaused = true;
            this.audio.playPause();
            document.getElementById('pause-overlay').classList.remove('hidden');
        };

        document.getElementById('btn-resume').onclick = () => {
            this.isPaused = false;
            this.audio.resumeAudio();
            document.getElementById('pause-overlay').classList.add('hidden');
        };

        // Touch Interaction (Relative)
        window.addEventListener('touchstart', (e) => {
            if (!this.state.matchActive || this.isPaused) return;
            this.touchStartX = e.touches[0].clientX;
            this.paddleStartX = this.physics.p1.x;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.state.matchActive || this.isPaused) return;
            e.preventDefault();
            const delta = (e.touches[0].clientX - this.touchStartX) * 0.08;
            this.physics.p1.x = Math.max(Math.min(this.paddleStartX + delta, 11), -11);
            if (this.pPaddleMesh) this.pPaddleMesh.position.x = this.physics.p1.x;
        }, { passive: false });

        // Mouse Support
        window.addEventListener('mousemove', (e) => {
            if (!this.state.matchActive || this.isPaused) return;
            const x = ((e.clientX / window.innerWidth) * 2 - 1) * 11;
            this.physics.p1.x = Math.max(Math.min(x, 11), -11);
            if (this.pPaddleMesh) this.pPaddleMesh.position.x = this.physics.p1.x;
        });
        
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
                    this.audio.playSelect();
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
        this.isPaused = false;
        this.pScore = 0;
        this.eScore = 0;
        
        this.physics.resetBall(0.35);
        this.physics.p1.x = 0;
        this.physics.p2.x = 0;

        // Scene Prep
        if (this.pPaddleMesh) this.graphics.scene.remove(this.pPaddleMesh);
        if (this.aiPaddleMesh) this.graphics.scene.remove(this.aiPaddleMesh);
        if (this.ballMesh) this.graphics.scene.remove(this.ballMesh);

        const pItem = ITEMS.find(i => i.id === this.state.equipped.paddle);
        const bItem = ITEMS.find(i => i.id === this.state.equipped.ball);
        
        this.pPaddleMesh = this.graphics.createPaddle(pItem.color);
        this.pPaddleMesh.position.z = this.physics.p1.z;
        
        this.aiPaddleMesh = this.graphics.createPaddle(levelData.color);
        this.aiPaddleMesh.position.z = this.physics.p2.z;
        
        this.ballMesh = this.graphics.createBall(bItem.color);
        
        this.ui.show('game');
        this.ui.updateHUD(0, 0);
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.state.matchActive && !this.isPaused && dt < 0.1) {
            // AI
            const aiSpeed = this.currentLevel.speed;
            this.physics.p2.x += (this.physics.ball.x - this.physics.p2.x) * aiSpeed;
            this.physics.p2.x = Math.max(Math.min(this.physics.p2.x, 11), -11);
            this.aiPaddleMesh.position.x = this.physics.p2.x;

            // Physics
            const result = this.physics.update(dt);
            
            // Sync
            this.ballMesh.position.x = this.physics.ball.x;
            this.ballMesh.position.z = this.physics.ball.z;
            this.ballMesh.rotation.x += this.physics.ball.vz;
            this.ballMesh.rotation.z -= this.physics.ball.vx;

            if (result) {
                if (result === 'wall') {
                    this.audio.playWall();
                    this.graphics.shakeCamera(0.15);
                } else if (result === 'p1' || result === 'p2') {
                    this.audio.playHit();
                    this.graphics.spawnImpact(this.ballMesh.position, result === 'p1' ? 0xffffff : 0x888888);
                    this.graphics.shakeCamera(0.3);
                } else if (result.startsWith('score')) {
                    const playerPoint = result === 'score_p2';
                    if (playerPoint) this.pScore++; else this.eScore++;
                    
                    this.audio.playScore(playerPoint);
                    this.ui.updateHUD(this.pScore, this.eScore);
                    this.graphics.shakeCamera(0.8);
                    
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
            title.innerText = victory ? "VICTORY" : "DEFEAT";
            title.style.color = victory ? "#fff" : "#ff4444";
            
            const reward = this.currentLevel.winReward;
            document.getElementById('res-xp').innerText = "+" + (victory ? reward.xp : 10);
            document.getElementById('res-cr').innerText = "+" + (victory ? reward.cr : 5);
            
            if (victory) {
                this.state.xp += reward.xp;
                this.state.credits += reward.cr;
                if (this.currentLevel.id > this.state.campaignProgress) {
                    this.state.campaignProgress = this.currentLevel.id;
                }
            }
            this.saveState();

            document.getElementById('btn-continue').onclick = () => {
                this.audio.playSelect();
                this.ui.show('home');
            };
        }, 1000);
    }

    loadState() {
        const s = localStorage.getItem('pro_pong_save');
        return s ? { ...INITIAL_STATE, ...JSON.parse(s) } : { ...INITIAL_STATE };
    }

    saveState() {
        localStorage.setItem('pro_pong_save', JSON.stringify(this.state));
    }
}

window.game = new Game();