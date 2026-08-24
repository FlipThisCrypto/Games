// 8-Bit Web Audio API Procedural Sound Synthesizer

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

        // Chiptune Melodic Loop Pattern (A Minor / F / C / G progression)
        const melody = [
            220, 0, 330, 220, 440, 330, 220, 330,
            174, 0, 261, 174, 349, 261, 174, 261,
            261, 0, 330, 261, 523, 330, 261, 330,
            196, 0, 293, 196, 392, 293, 196, 293
        ];
        const bass = [
            110, 110, 110, 110,
            87, 87, 87, 87,
            130, 130, 130, 130,
            98, 98, 98, 98
        ];

        const stepDuration = 135; // ms per 16th note (~111 BPM)

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.muted || !this.ctx) return;

            const now = this.ctx.currentTime;
            const noteIndex = this.bgmStep % melody.length;
            const bassIndex = Math.floor(this.bgmStep / 2) % bass.length;
            const freq = melody[noteIndex];
            const bassFreq = bass[bassIndex];

            // 1. Lead Melody Pulse
            if (freq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq * 1.5, now);

                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            }

            // 2. Bassline Note (on even steps)
            if (this.bgmStep % 2 === 0) {
                const bOsc = this.ctx.createOscillator();
                const bGain = this.ctx.createGain();
                bOsc.type = 'triangle';
                bOsc.frequency.setValueAtTime(bassFreq, now);

                bGain.gain.setValueAtTime(0.07, now);
                bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

                bOsc.connect(bGain);
                bGain.connect(this.ctx.destination);
                bOsc.start(now);
                bOsc.stop(now + 0.2);
            }

            // 3. Hi-Hat noise tick (on every 4th step)
            if (this.bgmStep % 4 === 2) {
                const bSize = this.ctx.sampleRate * 0.03;
                const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

                const n = this.ctx.createBufferSource();
                n.buffer = buf;
                const f = this.ctx.createBiquadFilter();
                f.type = 'highpass';
                f.frequency.setValueAtTime(4000, now);

                const g = this.ctx.createGain();
                g.gain.setValueAtTime(0.03, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

                n.connect(f);
                f.connect(g);
                g.connect(this.ctx.destination);
                n.start(now);
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

    playJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playDoubleJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.14);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    playWallJump() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playSpring() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        osc.frequency.linearRampToValueAtTime(400, now + 0.2);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playGeyser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.2);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playSwitch() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [440, 880];
        notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const t = this.ctx.currentTime + (idx * 0.08);

            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.1);
        });
    }

    playPotShatter() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    playDash() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.18);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.24, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playShoot(type = 'fireball') {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (type === 'crystal_laser') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        } else if (type === 'fireball') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);
            gain.gain.setValueAtTime(0.16, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        } else if (type === 'shadow_bolt') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(750, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        } else if (type === 'root_bolt') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(340, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        } else {
            // Alchemy bolt
            osc.type = 'sine';
            osc.frequency.setValueAtTime(950, now);
            osc.frequency.exponentialRampToValueAtTime(450, now + 0.07);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        }

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    playChargedShot() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playStomp() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playManaCrystal() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [659, 987, 1318];
        notes.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const t = this.ctx.currentTime + (idx * 0.06);

            osc.frequency.setValueAtTime(f, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        });
    }

    playShardCollect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [587, 880, 1174, 1760];
        const step = 0.07;
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const time = this.ctx.currentTime + (idx * step);

            osc.frequency.setValueAtTime(freq, time);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.2);
        });
    }

    playFreeze() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(320, now + 0.18);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playHurt() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playVictory() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523, d: 0.12 },
            { f: 659, d: 0.12 },
            { f: 784, d: 0.12 },
            { f: 1046, d: 0.3 }
        ];
        let offset = 0;
        melody.forEach(m => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const time = this.ctx.currentTime + offset;
            osc.frequency.setValueAtTime(m.f, time);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + m.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + m.d);
            offset += m.d + 0.04;
        });
    }

    playGameOver() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const tones = [392, 349, 329, 261];
        let offset = 0;
        tones.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const time = this.ctx.currentTime + offset;
            osc.frequency.setValueAtTime(f, time);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.2);
            offset += 0.22;
        });
    }
}

export const soundFX = new SoundEffects();
