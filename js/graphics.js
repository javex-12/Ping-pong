// graphics.js - 3D Renderer with Themes
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { ENVIRONMENTS } from './data.js';

export class Graphics {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 24, 32);
        this.camera.lookAt(0, -6, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.effects = [];
        this.shakeTimer = 0;
        this.currentEnv = null;
        this.envParticles = [];
        
        // Base Lighting
        this.ambientLight = new THREE.AmbientLight(0x202020);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(0, 50, -30);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.scene.add(this.sunLight);

        // Core Objects
        this.createFloor();
        
        window.addEventListener('resize', () => this.onResize());
    }

    createFloor() {
        // Reflective Grid Floor
        const planeGeo = new THREE.PlaneGeometry(100, 100);
        this.floorMat = new THREE.MeshStandardMaterial({ 
            color: 0x050510,
            roughness: 0.1,
            metalness: 0.8,
        });
        this.floor = new THREE.Mesh(planeGeo, this.floorMat);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.y = -1;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);

        // Grid Helper Overlay
        this.gridHelper = new THREE.GridHelper(100, 40, 0x00f2ff, 0x111111);
        this.gridHelper.position.y = -0.99;
        this.scene.add(this.gridHelper);
    }

    setEnvironment(envKey) {
        const env = ENVIRONMENTS[envKey] || ENVIRONMENTS['cyber_city'];
        this.currentEnv = env;

        // Background & Fog
        this.scene.background = new THREE.Color(env.skyColor);
        this.scene.fog = new THREE.FogExp2(env.skyColor, env.fogDensity);

        // Floor Grid Color
        this.gridHelper.material.color.setHex(env.gridColor);
        this.floorMat.color.setHex(0x050505); // Keep floor dark
        this.floorMat.emissive.setHex(env.skyColor);
        this.floorMat.emissiveIntensity = 0.1;

        // Sun Color
        this.sunLight.color.setHex(env.sunColor);
        this.ambientLight.color.setHex(env.skyColor);

        // Particles System
        this.clearEnvParticles();
        this.initEnvParticles(env.particles, env.gridColor);
    }

    initEnvParticles(type, color) {
        let count = 200;
        let geo, mat;

        if (type === 'digital') { // Matrix Rain
            geo = new THREE.BufferGeometry();
            const pos = [];
            for(let i=0; i<count; i++) {
                pos.push((Math.random()-0.5)*80, Math.random()*40, (Math.random()-0.5)*80);
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            mat = new THREE.PointsMaterial({ color: 0x00ff00, size: 0.5, transparent: true, opacity: 0.6 });
            this.envParticles = new THREE.Points(geo, mat);
            this.envParticles.userData = { type: 'rain', speed: 0.5 };
        } else if (type === 'embers') { // Rising Sparks
            geo = new THREE.BufferGeometry();
            const pos = [];
            for(let i=0; i<count; i++) {
                pos.push((Math.random()-0.5)*80, Math.random()*10, (Math.random()-0.5)*80);
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            mat = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.4, transparent: true, opacity: 0.8 });
            this.envParticles = new THREE.Points(geo, mat);
            this.envParticles.userData = { type: 'rise', speed: 0.2 };
        } else if (type === 'snow') { // Falling Snow
             geo = new THREE.BufferGeometry();
            const pos = [];
            for(let i=0; i<count; i++) {
                pos.push((Math.random()-0.5)*100, Math.random()*50, (Math.random()-0.5)*100);
            }
            geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
            mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, transparent: true, opacity: 0.7 });
            this.envParticles = new THREE.Points(geo, mat);
            this.envParticles.userData = { type: 'snow', speed: 0.1 };
        } else {
            // Default stars?
            return;
        }

        this.scene.add(this.envParticles);
    }

    clearEnvParticles() {
        if (this.envParticles && this.envParticles.geometry) {
            this.scene.remove(this.envParticles);
            this.envParticles.geometry.dispose();
            this.envParticles.material.dispose();
            this.envParticles = null;
        }
    }

    createPaddle(color, isPlayer) {
        const group = new THREE.Group();
        
        // Main Body (Sleek)
        const geo = new THREE.BoxGeometry(4.2, 0.8, 1.2);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.2,
            metalness: 0.9,
            emissive: color,
            emissiveIntensity: 0.4
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Neon Stripe
        const stripeGeo = new THREE.BoxGeometry(4.3, 0.2, 0.2);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.35;
        stripe.position.z = 0.5;

        group.add(mesh);
        group.add(stripe);
        
        // Underglow
        const light = new THREE.PointLight(color, 1, 8);
        light.position.y = -1;
        group.add(light);

        this.scene.add(group);
        return group;
    }

    createBall(color) {
        const geo = new THREE.SphereGeometry(0.6, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: color,
            emissiveIntensity: 2,
            roughness: 0,
            metalness: 0
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        
        // Dynamic Light attached to ball
        const light = new THREE.PointLight(color, 2, 15);
        mesh.add(light);
        
        this.scene.add(mesh);
        return mesh;
    }

    spawnImpact(pos, color) {
        // Shockwave Ring
        const ringGeo = new THREE.RingGeometry(0.5, 0.8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: color, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 1 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = -Math.PI / 2;
        ring.userData = { type: 'shockwave', scale: 1, opacity: 1 };
        
        this.scene.add(ring);
        this.effects.push(ring);

        // Particles
        const pCount = 12;
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const pMat = new THREE.MeshBasicMaterial({ color: color });
        
        for(let i=0; i<pCount; i++) {
            const p = new THREE.Mesh(pGeo, pMat);
            p.position.copy(pos);
            p.userData = {
                type: 'particle',
                vel: new THREE.Vector3((Math.random()-0.5), Math.random()*0.8, (Math.random()-0.5)).normalize().multiplyScalar(0.4),
                life: 1.0
            };
            this.scene.add(p);
            this.effects.push(p);
        }
    }

    shakeCamera(amount) {
        this.shakeTimer = amount;
    }

    update() {
        // 1. Update Effects
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const eff = this.effects[i];
            if (eff.userData.type === 'shockwave') {
                eff.scale.multiplyScalar(1.1);
                eff.userData.opacity -= 0.05;
                eff.material.opacity = eff.userData.opacity;
                if (eff.userData.opacity <= 0) {
                    this.scene.remove(eff);
                    this.effects.splice(i, 1);
                }
            } else if (eff.userData.type === 'particle') {
                eff.position.add(eff.userData.vel);
                eff.userData.vel.y -= 0.015; // Gravity
                eff.rotation.x += 0.1;
                eff.rotation.y += 0.1;
                eff.userData.life -= 0.02;
                eff.scale.setScalar(eff.userData.life);
                if (eff.userData.life <= 0) {
                    this.scene.remove(eff);
                    this.effects.splice(i, 1);
                }
            }
        }

        // 2. Update Env Particles
        if (this.envParticles) {
            const positions = this.envParticles.geometry.attributes.position.array;
            const type = this.envParticles.userData.type;
            const speed = this.envParticles.userData.speed;
            
            for(let i=1; i<positions.length; i+=3) { // Y component
                if (type === 'rain' || type === 'snow') {
                    positions[i] -= speed;
                    if (positions[i] < -5) positions[i] = 40;
                } else if (type === 'rise') {
                    positions[i] += speed;
                    if (positions[i] > 20) positions[i] = -5;
                }
            }
            this.envParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 3. Camera Shake
        if (this.shakeTimer > 0) {
            const rx = (Math.random() - 0.5) * this.shakeTimer;
            const ry = (Math.random() - 0.5) * this.shakeTimer;
            this.camera.position.set(rx, 24 + ry, 32);
            this.shakeTimer *= 0.9;
            if (this.shakeTimer < 0.1) {
                this.shakeTimer = 0;
                this.camera.position.set(0, 24, 32);
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