// physics.js - 3D Collision Logic
export class Physics {
    constructor(fieldW, fieldH) {
        this.field = { w: fieldW, h: fieldH };
        this.ball = { x: 0, z: 0, vx: 0, vz: 0, spin: 0 };
        this.p1 = { x: 0, z: fieldH/2 - 2, w: 4, h: 0.5, d: 1 };
        this.p2 = { x: 0, z: -fieldH/2 + 2, w: 4, h: 0.5, d: 1 };
    }

    resetBall(speed) {
        this.ball.x = 0;
        this.ball.z = 0;
        this.ball.vx = (Math.random() - 0.5) * 0.4;
        this.ball.vz = speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.spin = 0;
    }

    update(dt) {
        // Move Ball
        this.ball.x += this.ball.vx * dt * 60; // Normalize to 60fps
        this.ball.z += this.ball.vz * dt * 60;
        
        // Spin Effect (Magnus-ish)
        this.ball.vx += this.ball.spin * 0.002;
        this.ball.spin *= 0.98; // Drag

        // Wall Bounce
        if (Math.abs(this.ball.x) > this.field.w / 2 - 0.5) {
            this.ball.vx *= -1;
            this.ball.x = Math.sign(this.ball.x) * (this.field.w / 2 - 0.5);
            return 'wall';
        }

        // Paddle Collision
        // Player
        if (this.checkPaddle(this.p1, 1)) return 'p1';
        // Enemy
        if (this.checkPaddle(this.p2, -1)) return 'p2';

        // Score
        if (this.ball.z > this.field.h / 2 + 2) return 'score_p2';
        if (this.ball.z < -this.field.h / 2 - 2) return 'score_p1';

        return null;
    }

    checkPaddle(p, side) {
        // Simple AABB for Z, precise for X
        // Ball Radius approx 0.5
        const bz = this.ball.z;
        const bx = this.ball.x;
        
        // Check Z Depth
        let hitZ = false;
        if (side === 1) { // Bottom
            if (bz + 0.5 >= p.z - 0.5 && bz < p.z + 0.5) hitZ = true;
        } else { // Top
            if (bz - 0.5 <= p.z + 0.5 && bz > p.z - 0.5) hitZ = true;
        }

        if (hitZ && Math.abs(bx - p.x) < (p.w / 2 + 0.5)) {
            // Hit!
            // Reflect Z
            this.ball.vz *= -1.05; // Speed up
            this.ball.vz = Math.max(Math.min(this.ball.vz, 1.2), -1.2); // Cap speed

            // English / Spin based on hit offset
            const offset = (bx - p.x) / (p.w / 2);
            this.ball.vx += offset * 0.2; 
            this.ball.spin = offset * 2; // Add spin for curvature

            // Prevent Sticking
            this.ball.z = p.z - (1.0 * side);
            
            return true;
        }
        return false;
    }
}