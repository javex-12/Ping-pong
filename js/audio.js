// audio.js - Synthesizer for SFX
export class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHit() {
        // Metallic ping
        this.playTone(800 + Math.random() * 200, 'triangle', 0.1, 0.1);
    }

    playWall() {
        // Thud
        this.playTone(200, 'sine', 0.1, 0.1);
    }

    playScore(isPlayer) {
        if (isPlayer) {
            // Ascending major chord
            setTimeout(() => this.playTone(440, 'sine', 0.2, 0.1), 0);
            setTimeout(() => this.playTone(554, 'sine', 0.2, 0.1), 100);
            setTimeout(() => this.playTone(659, 'square', 0.4, 0.05), 200);
        } else {
            // Descending dissonance
            setTimeout(() => this.playTone(300, 'sawtooth', 0.3, 0.1), 0);
            setTimeout(() => this.playTone(200, 'sawtooth', 0.4, 0.1), 150);
        }
    }

    playSelect() {
        this.playTone(1200, 'sine', 0.05, 0.05);
    }

    playPowerUp() {
        // Sweep
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}