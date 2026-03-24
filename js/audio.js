// audio.js - Advanced Audio Engine with Massive Reverb
export class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
        
        // Reverb Chain
        this.reverbNode = this.ctx.createConvolver();
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        
        // Dynamic Impulse Response for Reverb
        this.createReverbImpulse(2.5, 0.2); // Massive, long tail
        
        this.reverbGain.connect(this.ctx.destination);
        this.reverbNode.connect(this.reverbGain);
    }

    createReverbImpulse(duration, decay) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        for (let i = 0; i < 2; i++) {
            const channel = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
            }
        }
        this.reverbNode.buffer = impulse;
    }

    playSound(freq, type, duration, vol = 0.1, useReverb = true) {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        if (useReverb) gain.connect(this.reverbNode);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playHit() {
        // High-end metallic ping
        this.playSound(900, 'triangle', 0.15, 0.08);
        this.playSound(450, 'sine', 0.2, 0.05);
    }

    playWall() {
        // Lower bassy thud
        this.playSound(180, 'sine', 0.2, 0.1);
    }

    playScore(player) {
        if (player) {
            // Success Major
            this.playSound(523, 'sine', 0.15, 0.05);
            setTimeout(() => this.playSound(659, 'sine', 0.15, 0.05), 100);
            setTimeout(() => this.playSound(783, 'sine', 0.3, 0.05), 200);
        } else {
            // Error Dissonant
            this.playSound(300, 'sawtooth', 0.2, 0.05);
            setTimeout(() => this.playSound(220, 'sawtooth', 0.3, 0.05), 150);
        }
    }

    playSelect() {
        this.playSound(1200, 'sine', 0.05, 0.03, false);
    }

    playPause() {
        // Deep reverb swoosh
        this.playSound(150, 'sine', 0.5, 0.2, true);
        this.reverbGain.gain.exponentialRampToValueAtTime(0.8, this.ctx.currentTime + 0.1);
    }

    resumeAudio() {
        this.reverbGain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 0.2);
    }
}