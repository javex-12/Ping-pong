// --- Configuration & Data ---
const ITEMS = [
    { id: 'p_gold', type: 'paddle', name: 'Golden Sun', color: 0xffaa00, price: 0 },
    { id: 'p_neon', type: 'paddle', name: 'Neon Void', color: 0x00f2ff, price: 100 },
    { id: 'p_rose', type: 'paddle', name: 'Rose Dusk', color: 0xff0077, price: 250 },
    { id: 'b_white', type: 'ball', name: 'Solar Core', color: 0xffffff, price: 0 },
    { id: 'b_red', type: 'ball', name: 'Red Giant', color: 0xff4400, price: 150 },
    { id: 'b_plasma', type: 'ball', name: 'Plasma', color: 0x00ff88, price: 300 },
];

let state = {
    level: 1, xp: 0, credits: 0,
    owned: ['p_gold', 'b_white'],
    activePaddle: 'p_gold', activeBall: 'b_white',
    playerScore: 0, aiScore: 0,
    isPaused: true,
    difficulty: 1.0,
    matchActive: false
};

// --- Three.js Globals ---
let scene, camera, renderer, ball, pPaddle, aiPaddle, worldGroup;
let ballVel = { x: 0, z: 0 };
const FIELD = { w: 22, h: 44 };
let deferredPrompt;

function init() {
    // Scene Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0a2e, 0.02);
    
    worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Camera Setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 22, 36);
    camera.lookAt(0, -5, 0);

    // Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    document.body.appendChild(renderer.domElement);

    createEnvironment();
    createGameObjects();
    setupEvents();
    loadState();
    renderShop();
    
    // PWA Install Prompt Logic
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('install-btn');
        installBtn.style.display = 'block';
        installBtn.onclick = () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                deferredPrompt = null;
            });
        };
    });

    animate();
}

function createEnvironment() {
    // Sky with Gradient Shader
    const skyGeo = new THREE.SphereGeometry(200, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: `varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
            varying vec3 vPos;
            void main() {
                float h = normalize(vPos).y;
                vec3 bot = vec3(0.1, 0.05, 0.2);
                vec3 mid = vec3(1.0, 0.4, 0.1);
                vec3 top = vec3(0.05, 0.1, 0.4);
                vec3 col = mix(mid, top, max(h, 0.0));
                col = mix(bot, col, max(h + 0.4, 0.0));
                gl_FragColor = vec4(col, 1.0);
            }
        `
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Floating Monoliths
    for(let i=0; i<15; i++) {
        const geo = new THREE.BoxGeometry(2, 10 + Math.random()*20, 2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x1a0a2e, roughness: 0.2 });
        const m = new THREE.Mesh(geo, mat);
        m.position.set((Math.random()-0.5)*100, -10, (Math.random()-0.5)*100);
        worldGroup.add(m);
    }

    // Lighting
    const sun = new THREE.DirectionalLight(0xffaa00, 1.5);
    sun.position.set(0, 10, -60);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x442266, 0.6));

    // Table
    const tableGeo = new THREE.BoxGeometry(FIELD.w, 0.5, FIELD.h);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x050208, metalness: 0.8, roughness: 0.1 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.5;
    table.receiveShadow = true;
    scene.add(table);
    
    // Grid Helper
    const grid = new THREE.GridHelper(FIELD.w, 10, 0xff00aa, 0x222222);
    grid.position.y = -0.24;
    grid.scale.z = 2;
    scene.add(grid);
}

function createGameObjects() {
    // Ball
    ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffaa00, emissiveIntensity: 2 })
    );
    scene.add(ball);

    // Paddles
    const pGeo = new THREE.BoxGeometry(5, 0.6, 1.2);
    pPaddle = new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
    pPaddle.position.set(0, 0, FIELD.h/2 - 2);
    scene.add(pPaddle);

    aiPaddle = new THREE.Mesh(pGeo, new THREE.MeshStandardMaterial({ color: 0xaa00ff }));
    aiPaddle.position.set(0, 0, -FIELD.h/2 + 2);
    scene.add(aiPaddle);
}

function setupEvents() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const movePaddle = (x) => {
        if(state.isPaused) return;
        const tx = ((x / window.innerWidth) * 2 - 1) * (FIELD.w/2 - 2.5);
        pPaddle.position.x = Math.max(Math.min(tx, FIELD.w/2 - 2.5), -FIELD.w/2 + 2.5);
    };

    window.addEventListener('mousemove', (e) => movePaddle(e.clientX));
    
    // Touch Support
    window.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling
        movePaddle(e.touches[0].clientX);
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') toggleMenu();
    });

    document.getElementById('start-btn').onclick = () => {
        state.isPaused = false;
        state.matchActive = true;
        document.getElementById('menu-overlay').style.display = 'none';
        if(state.playerScore === 0 && state.aiScore === 0) resetBall();
    };

    document.getElementById('shop-btn').onclick = () => {
        state.isPaused = true;
        document.getElementById('shop-overlay').style.display = 'flex';
        document.getElementById('menu-overlay').style.display = 'none';
    };

    document.getElementById('close-shop').onclick = () => {
        document.getElementById('shop-overlay').style.display = 'none';
        document.getElementById('menu-overlay').style.display = 'flex';
        renderShop(); // Refresh to show equipped status
    };
}

function toggleMenu() {
    state.isPaused = !state.isPaused;
    document.getElementById('menu-overlay').style.display = state.isPaused ? 'flex' : 'none';
    if(state.isPaused) document.getElementById('shop-overlay').style.display = 'none';
}

function resetBall() {
    ball.position.set(0, 0, 0);
    // Base speed increases with level
    const baseSpeed = 0.35 + (state.level * 0.01); 
    ballVel = { 
        x: (Math.random()-0.5)*0.3, 
        z: baseSpeed * (Math.random() > 0.5 ? 1 : -1) 
    };
}

function updatePhysics() {
    if(state.isPaused) return;

    ball.position.x += ballVel.x;
    ball.position.z += ballVel.z;

    // Wall Bounce
    if(Math.abs(ball.position.x) > FIELD.w/2 - 0.5) {
        ballVel.x *= -1;
        ball.position.x = Math.sign(ball.position.x) * (FIELD.w/2 - 0.5);
    }

    // Paddle Collisions
    checkCollision(pPaddle, 1);
    checkCollision(aiPaddle, -1);

    // AI Logic (Smart Difficulty)
    // AI target is ball x, but with reaction delay based on difficulty
    // If AI is winning, reduce its speed. If losing, increase slightly.
    let scoreDiff = state.aiScore - state.playerScore;
    let adaptiveFactor = 1.0;
    
    if(scoreDiff > 2) adaptiveFactor = 0.8; // AI goes easy
    if(scoreDiff < -2) adaptiveFactor = 1.2; // AI tries harder
    
    // Base AI speed
    let aiSpeed = (0.08 + (state.level * 0.005)) * adaptiveFactor;
    
    // Lerp towards ball
    aiPaddle.position.x += (ball.position.x - aiPaddle.position.x) * aiSpeed;
    aiPaddle.position.x = Math.max(Math.min(aiPaddle.position.x, FIELD.w/2 - 2.5), -FIELD.w/2 + 2.5);

    // Scoring
    if(ball.position.z > FIELD.h/2 + 2) score(false);
    if(ball.position.z < -FIELD.h/2 - 2) score(true);
}

function checkCollision(paddle, side) {
    const pZ = paddle.position.z;
    const bZ = ball.position.z;
    const margin = 0.8; 

    // Simple AABB for Z axis within range
    const hitZ = side === 1 
        ? (bZ + 0.5 >= pZ - 0.6 && bZ < pZ + 0.5)
        : (bZ - 0.5 <= pZ + 0.6 && bZ > pZ - 0.5);

    if(hitZ && Math.abs(ball.position.x - paddle.position.x) < 3) {
        // Deflect ball
        ballVel.z *= -1.05; // Speed up slightly on hit
        ballVel.z = Math.max(Math.min(ballVel.z, 0.9), -0.9); // Cap speed
        
        // Add spin/angle based on hit position relative to paddle center
        ballVel.x += (ball.position.x - paddle.position.x) * 0.25;
        
        // Prevent sticking
        ball.position.z = pZ - (0.8 * side);
        
        // Visual Shake (simple)
        camera.position.x = (Math.random() - 0.5) * 0.2;
    } else {
        camera.position.x = 0;
    }
}

function score(playerScored) {
    if(playerScored) {
        state.playerScore++;
        state.xp += 25;
        state.credits += 10;
    } else {
        state.aiScore++;
    }
    
    if(state.xp >= state.level * 100) {
        state.level++;
        state.xp = 0;
        if(state.level > 50) state.level = 50;
    }

    updateUI();
    saveState();
    
    if(state.playerScore >= 11 || state.aiScore >= 11) {
        endMatch(state.playerScore >= 11);
    } else {
        resetBall();
    }
}

function endMatch(playerWon) {
    state.isPaused = true;
    state.matchActive = false;
    document.getElementById('menu-overlay').style.display = 'flex';
    document.getElementById('menu-title').innerText = playerWon ? "VICTORY" : "DEFEAT";
    document.getElementById('start-btn').innerText = "Play Again";
    
    // Reset scores for next match
    state.playerScore = 0;
    state.aiScore = 0;
    updateUI();
}

function updateUI() {
    document.getElementById('level-val').innerText = state.level;
    document.getElementById('score-val').innerText = `${state.playerScore} - ${state.aiScore}`;
    document.getElementById('credits-val').innerText = state.credits;
    document.getElementById('level-fill').style.width = (state.xp / (state.level * 100) * 100) + '%';
}

function renderShop() {
    const container = document.getElementById('shop-container');
    container.innerHTML = '';
    ITEMS.forEach(item => {
        const div = document.createElement('div');
        const isOwned = state.owned.includes(item.id);
        const isActive = state.activePaddle === item.id || state.activeBall === item.id;
        
        div.className = `shop-item ${isOwned ? 'owned' : ''} ${isActive ? 'active' : ''}`;
        
        let btnText = isOwned ? (isActive ? 'EQUIPPED' : 'EQUIP') : `${item.price} CR`;
        
        div.innerHTML = `
            <strong>${item.name}</strong>
            <small>${item.type.toUpperCase()}</small>
            <div style="margin-top:5px; font-weight:bold; color:${isOwned ? '#fff' : '#ffaa00'}">${btnText}</div>
        `;
        
        div.onclick = () => {
            if(!isOwned) {
                if(state.credits >= item.price) {
                    state.credits -= item.price;
                    state.owned.push(item.id);
                } else {
                    return; // Not enough money
                }
            }
            // Equip
            if(item.type === 'paddle') state.activePaddle = item.id;
            else state.activeBall = item.id;
            
            applyCustomization();
            saveState();
            renderShop();
            updateUI();
        };
        container.appendChild(div);
    });
    applyCustomization();
}

function applyCustomization() {
    const pData = ITEMS.find(i => i.id === state.activePaddle);
    const bData = ITEMS.find(i => i.id === state.activeBall);
    if(pPaddle && pData) pPaddle.material.color.setHex(pData.color);
    if(ball && bData) {
        ball.material.emissive.setHex(bData.color);
        ball.material.color.setHex(bData.color);
    }
}

function saveState() { 
    localStorage.setItem('sunset_pong_save', JSON.stringify(state)); 
}

function loadState() {
    const saved = localStorage.getItem('sunset_pong_save');
    if(saved) {
        try {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
            // Reset temp match state
            state.playerScore = 0;
            state.aiScore = 0;
            state.isPaused = true;
        } catch(e) {
            console.error("Save file corrupted", e);
        }
    }
    updateUI();
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    
    // Environment animation
    if(worldGroup) worldGroup.rotation.y += 0.001;
    if(ball) ball.rotation.x += 0.1;
    
    renderer.render(scene, camera);
}

// Start
init();