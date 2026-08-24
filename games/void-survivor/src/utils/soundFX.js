// 8-Bit Web Audio API Sound Synthesizer for Game 2: Void Survivor

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('wiznerdz_audio_muted') === 'true';
        this.bgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;
    }

    setMuted(value) {
        this.muted = !!value;
        localStorage.setItem('wiznerdz_audio_muted', this.muted ? 'true' : 'false');
        if (this.muted) {
            this.stopBGM();
        } else if (!this.bgmPlaying) {
            this.startBGM();
        }
        return this.muted;
    }

    toggleMute() {
        return this.setMuted(!this.muted);
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startBGM() {
        if (this.muted || this.bgmPlaying) return;
        this.init();
        if (!this.ctx) return;

        this.bgmPlaying = true;
        this.bgmStep = 0;

        // Dark Driving Techno-Chiptune Loop for Horde Survival
        const melody = [
            146, 174, 220, 261, 293, 261, 220, 174,
            130, 164, 196, 246, 261, 246, 196, 164,
            116, 146, 174, 220, 246, 220, 174, 146,
            130, 164, 196, 261, 293, 329, 293, 261
        ];
        const bass = [
            73, 73, 73, 73,
            65, 65, 65, 65,
            58, 58, 58, 58,
            65, 65, 73, 82
        ];

        const stepDuration = 110; // Fast-paced ~136 BPM

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.muted || !this.ctx) return;

            const now = this.ctx.currentTime;
            const noteIndex = this.bgmStep % melody.length;
            const bassIndex = Math.floor(this.bgmStep / 2) % bass.length;
            const freq = melody[noteIndex];
            const bassFreq = bass[bassIndex];

            // 1. Synth Pulse
            if (freq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq * 1.5, now);

                gain.gain.setValueAtTime(0.035, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
            }

            // 2. Heavy Sub-Bass Kick
            if (this.bgmStep % 2 === 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bassFreq, now);

                bGain.gain.setValueAtTime(0.08, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + 0.16);
            }

            this.bgmStep++;
        }, stepDuration);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playXpGem() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playLevelUp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const now = this.ctx.currentTime + (i * 0.08);
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        });
    }

    playSpellCast() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }
}

export const soundFX = new SoundEffects();
