// graphics.js - Three.js Rendering
import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';

export class Graphics {
    constructor(container) {
        this.scene = new THREE.Scene();
        // Fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);
        
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 20, 35);
        this.camera.lookAt(0, -2, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);

        this.particles = [];
        this.shakeTimer = 0;
        
        // Initial setup
        this.initScene();
        this.initLights();
        
        // Dynamic Objects
        this.pPaddle = null;
        this.aiPaddle = null;
        this.ball = null;
        this.terrain = null;
        
        window.addEventListener('resize', () => this.onResize());
    }

    initScene() {
        // Floor Grid
        const gridHelper = new THREE.GridHelper(100, 50, 0x00f2ff, 0x222222);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);

        // Retro Sun
        const sunGeo = new THREE.CircleGeometry(40, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(0, 15, -80);
        this.scene.add(sun);
        
        // Rolling Mountains (Wireframe)
        const geometry = new THREE.PlaneGeometry(200, 100, 40, 20);
        const pos = geometry.attributes.position;
        for(let i=0; i < pos.count; i++){
            // Randomize Z (height) based on X distance from center to create a valley
            const x = pos.getX(i);
            if (Math.abs(x) > 20) {
                 pos.setZ(i, Math.random() * 15);
            }
        }
        geometry.computeVertexNormals();
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xaa00ff, 
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.position.y = -2;
        terrain.position.z = -50;
        this.scene.add(terrain);
        this.terrain = terrain;

        // Arena Borders
        const borderGeo = new THREE.BoxGeometry(24, 1, 46);
        const borderMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, wireframe: true });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.y = -0.5;
        this.scene.add(border);
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0x404040);
        this.scene.add(ambient);

        const point = new THREE.PointLight(0xffffff, 0.8, 100);
        point.position.set(0, 20, 0);
        this.scene.add(point);
    }

    createPaddle(color) {
        const group = new THREE.Group();
        
        // Core
        const geo = new THREE.BoxGeometry(4, 0.5, 1);
        const mat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color, 
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);

        // Glow
        const glowGeo = new THREE.PlaneGeometry(6, 3);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -0.4;
        group.add(glow);
        
        this.scene.add(group);
        return group;
    }

    createBall(color) {
        const geo = new THREE.SphereGeometry(0.5, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            emissive: color,
            emissiveIntensity: 1
        });
        const mesh = new THREE.Mesh(geo, mat);
        
        const light = new THREE.PointLight(color, 2, 10);
        mesh.add(light);
        
        this.scene.add(mesh);
        return mesh;
    }

    spawnParticles(pos, color, count=15) {
        const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const mat = new THREE.MeshBasicMaterial({ color: color });
        
        for(let i=0; i<count; i++) {
            const p = new THREE.Mesh(geo, mat);
            p.position.copy(pos);
            // Random Velocity
            const vel = new THREE.Vector3(
                (Math.random()-0.5) * 0.8,
                Math.random() * 0.8,
                (Math.random()-0.5) * 0.8
            );
            
            this.scene.add(p);
            this.particles.push({ mesh: p, vel: vel, life: 1.0 });
        }
    }

    shakeCamera(intensity) {
        this.shakeTimer = intensity;
    }

    update() {
        // Update particles
        for(let i=this.particles.length-1; i>=0; i--) {
            const p = this.particles[i];
            p.mesh.position.add(p.vel);
            p.vel.y -= 0.02; // Gravity
            p.life -= 0.02;
            p.mesh.scale.setScalar(p.life);
            p.mesh.rotation.x += 0.1;
            
            if(p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }

        // Camera Shake
        if(this.shakeTimer > 0) {
            const shakeX = (Math.random()-0.5) * this.shakeTimer;
            const shakeY = (Math.random()-0.5) * this.shakeTimer;
            this.camera.position.set(shakeX, 20 + shakeY, 35); // Base pos
            this.shakeTimer *= 0.9;
            if(this.shakeTimer < 0.1) {
                this.shakeTimer = 0;
                this.camera.position.set(0, 20, 35); // Reset
            }
        }

        // Environment Move
        if(this.terrain) {
            this.terrain.position.z += 0.1;
            if(this.terrain.position.z > -10) this.terrain.position.z = -50;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}