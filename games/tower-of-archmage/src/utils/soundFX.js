// 8-Bit Web Audio API Sound Synthesizer for Game 3: Tower of the Archmage

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

        // Mystical Tower Dungeon Melodic Theme
        const melody = [
            220, 261, 329, 392, 440, 392, 329, 261,
            246, 293, 349, 440, 493, 440, 349, 293,
            207, 261, 311, 415, 466, 415, 311, 261,
            220, 261, 329, 392, 440, 523, 440, 329
        ];
        const stepDuration = 180;

        this.bgmTimer = setInterval(() => {
            if (!this.bgmPlaying || this.muted || !this.ctx) return;

            const now = this.ctx.currentTime;
            const noteIndex = this.bgmStep % melody.length;
            const freq = melody[noteIndex];

            // Ambient Bell Synth
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.16);

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

    playMatch() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playSpell() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playBossDefeat() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        [330, 440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const now = this.ctx.currentTime + (i * 0.08);
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
        });
    }
}

export const soundFX = new SoundEffects();
