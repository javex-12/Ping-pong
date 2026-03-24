// graphics.js - Realistic Industrial 3D
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export class Graphics {
    constructor(container) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0b0d);
        this.scene.fog = new THREE.FogExp2(0x0a0b0d, 0.015);
        
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 22, 38);
        this.camera.lookAt(0, -6, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.particles = [];
        this.shakeTimer = 0;
        
        this.initScene();
        this.initLights();
        
        window.addEventListener('resize', () => this.onResize());
    }

    initScene() {
        // High-End Industrial Floor
        const floorGeo = new THREE.PlaneGeometry(120, 120);
        const floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.1,
            metalness: 0.8,
            envMapIntensity: 1.0
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Subtle Polished Grid (Not glowing)
        const grid = new THREE.GridHelper(100, 25, 0x222222, 0x0f0f0f);
        grid.position.y = -0.99;
        this.scene.add(grid);

        // Heavy Concrete/Metal Walls (The Arena)
        const wallGeo = new THREE.BoxGeometry(26, 6, 1);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4 });
        
        const leftWall = new THREE.Mesh(wallGeo, wallMat);
        leftWall.position.set(-13, 1, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.scale.set(2, 1, 1);
        this.scene.add(leftWall);

        const rightWall = leftWall.clone();
        rightWall.position.x = 13;
        this.scene.add(rightWall);

        // Distant Industrial Pillars
        for(let i=0; i<10; i++) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40, 16), wallMat);
            pillar.position.set((Math.random()-0.5)*150, 10, -50 - Math.random()*50);
            this.scene.add(pillar);
        }
    }

    initLights() {
        // High-contrast, dramatic studio lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.05);
        this.scene.add(ambient);

        const spot1 = new THREE.SpotLight(0xffffff, 2);
        spot1.position.set(20, 40, 20);
        spot1.angle = Math.PI/6;
        spot1.penumbra = 0.5;
        spot1.castShadow = true;
        this.scene.add(spot1);

        const spot2 = new THREE.SpotLight(0xffffff, 1.5);
        spot2.position.set(-20, 30, -10);
        spot2.angle = Math.PI/4;
        this.scene.add(spot2);
        
        const sun = new THREE.DirectionalLight(0xffffff, 0.5);
        sun.position.set(0, 50, -40);
        this.scene.add(sun);
    }

    createPaddle(color) {
        const group = new THREE.Group();
        
        // Solid Metal Paddle with Beveled Edge
        const geo = new THREE.BoxGeometry(4.5, 0.8, 1.2);
        const mat = new THREE.MeshPhysicalMaterial({ 
            color: color, 
            roughness: 0.1, 
            metalness: 0.9,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        group.add(mesh);
        
        // Precise Indicator Strip
        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(4.6, 0.1, 0.1),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        strip.position.set(0, 0.45, 0.6);
        group.add(strip);

        this.scene.add(group);
        return group;
    }

    createBall(color) {
        // Polished Chrome Sphere
        const geo = new THREE.SphereGeometry(0.6, 64, 64);
        const mat = new THREE.MeshPhysicalMaterial({ 
            color: color, 
            roughness: 0.05, 
            metalness: 1.0,
            emissive: color,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        
        const light = new THREE.PointLight(color, 1.5, 10);
        mesh.add(light);
        
        this.scene.add(mesh);
        return mesh;
    }

    spawnImpact(pos, color) {
        // Real debris particles (no glow)
        const pCount = 8;
        const pGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const pMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 });
        
        for(let i=0; i<pCount; i++) {
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.copy(pos);
            const vel = new THREE.Vector3(
                (Math.random()-0.5) * 0.4,
                Math.random() * 0.4,
                (Math.random()-0.5) * 0.4
            );
            this.scene.add(p);
            this.particles.push({ mesh: p, vel: vel, life: 1.0 });
        }
    }

    shakeCamera(amount) {
        this.shakeTimer = amount;
    }

    update() {
        for(let i=this.particles.length-1; i>=0; i--) {
            const p = this.particles[i];
            p.mesh.position.add(p.vel);
            p.vel.y -= 0.01;
            p.life -= 0.015;
            p.mesh.scale.setScalar(p.life);
            if(p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }

        if(this.shakeTimer > 0) {
            this.camera.position.x += (Math.random()-0.5)*this.shakeTimer;
            this.camera.position.y += (Math.random()-0.5)*this.shakeTimer;
            this.shakeTimer *= 0.9;
            if(this.shakeTimer < 0.05) {
                this.shakeTimer = 0;
                this.camera.position.set(0, 22, 38);
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}