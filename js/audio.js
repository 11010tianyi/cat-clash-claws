class AudioManager {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.masterVolume = 0.5;
        this.bgMusicPlaying = false;
    }

    init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    playNote(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.isInitialized || this.isMuted) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio playback failed:', e);
        }
    }

    playAttackSound() {
        if (!this.isInitialized || this.isMuted) return;

        const frequencies = [200, 300, 250];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.1, 'sawtooth', 0.2);
                this.playNote(freq * 1.5, 0.08, 'square', 0.15);
            }, i * 30);
        });
    }

    playDefendSound() {
        if (!this.isInitialized || this.isMuted) return;

        this.playNote(400, 0.15, 'sine', 0.3);
        setTimeout(() => {
            this.playNote(500, 0.2, 'sine', 0.25);
        }, 50);
        setTimeout(() => {
            this.playNote(600, 0.25, 'sine', 0.2);
        }, 100);
    }

    playSkillSound() {
        if (!this.isInitialized || this.isMuted) return;

        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const freq = 300 + i * 100;
                this.playNote(freq, 0.15, 'triangle', 0.25);
                this.playNote(freq * 1.5, 0.1, 'sine', 0.2);
            }, i * 40);
        }
    }

    playHitSound() {
        if (!this.isInitialized || this.isMuted) return;

        this.playNote(150, 0.1, 'sawtooth', 0.4);
        this.playNote(100, 0.15, 'square', 0.3);
        this.playNote(80, 0.2, 'triangle', 0.25);
    }

    playCriticalSound() {
        if (!this.isInitialized || this.isMuted) return;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const freq = 400 + i * 150;
                this.playNote(freq, 0.12, 'square', 0.3);
                this.playNote(freq * 2, 0.1, 'sawtooth', 0.2);
            }, i * 50);
        }
    }

    playDodgeSound() {
        if (!this.isInitialized || this.isMuted) return;

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.playNote(800 + i * 200, 0.08, 'sine', 0.2);
            }, i * 40);
        }
    }

    playHealSound() {
        if (!this.isInitialized || this.isMuted) return;

        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.2, 'sine', 0.25);
                this.playNote(freq * 1.5, 0.15, 'triangle', 0.15);
            }, i * 100);
        });
    }

    playVictorySound() {
        if (!this.isInitialized || this.isMuted) return;

        const melody = [523, 659, 784, 1047, 784, 1047, 1319];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.3, 'sine', 0.3);
                this.playNote(freq * 0.5, 0.3, 'triangle', 0.2);
            }, i * 150);
        });
    }

    playDefeatSound() {
        if (!this.isInitialized || this.isMuted) return;

        const notes = [400, 350, 300, 250, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.4, 'sawtooth', 0.25);
            }, i * 200);
        });
    }

    playFoodPickupSound() {
        if (!this.isInitialized || this.isMuted) return;

        this.playNote(800, 0.1, 'sine', 0.2);
        setTimeout(() => {
            this.playNote(1000, 0.1, 'sine', 0.2);
        }, 50);
        setTimeout(() => {
            this.playNote(1200, 0.15, 'sine', 0.25);
        }, 100);
    }

    playCanSound() {
        if (!this.isInitialized || this.isMuted) return;

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const freq = 150 + i * 30;
                this.playNote(freq, 0.08, 'square', 0.15);
                this.playNote(freq * 1.2, 0.06, 'sine', 0.1);
            }, i * 40);
        }
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const freq = 400 + i * 100;
                    this.playNote(freq, 0.1, 'sine', 0.1);
                }, i * 60);
            }
        }, 160);
    }

    playFreezeDriedSound() {
        if (!this.isInitialized || this.isMuted) return;

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const freq = 800 + i * 200;
                this.playNote(freq, 0.05, 'square', 0.12);
                this.playNote(freq * 1.3, 0.04, 'triangle', 0.08);
            }, i * 25);
        }
    }

    playKuroDialogSound() {
        if (!this.isInitialized || this.isMuted) return;

        const baseFreq = 280;
        this.playNote(baseFreq, 0.18, 'triangle', 0.4);
        setTimeout(() => {
            this.playNote(baseFreq * 0.85, 0.12, 'triangle', 0.35);
        }, 80);
        setTimeout(() => {
            this.playNote(baseFreq * 1.15, 0.15, 'triangle', 0.3);
        }, 150);
    }

    playShiroDialogSound() {
        if (!this.isInitialized || this.isMuted) return;

        const baseFreq = 480;
        this.playNote(baseFreq, 0.12, 'sine', 0.35);
        setTimeout(() => {
            this.playNote(baseFreq * 1.2, 0.1, 'sine', 0.3);
        }, 70);
        setTimeout(() => {
            this.playNote(baseFreq * 0.9, 0.08, 'sine', 0.25);
        }, 120);
        setTimeout(() => {
            this.playNote(baseFreq * 1.3, 0.06, 'sine', 0.2);
        }, 170);
    }

    playProjectileSound() {
        if (!this.isInitialized || this.isMuted) return;

        this.playNote(600, 0.1, 'sawtooth', 0.15);
        this.playNote(400, 0.15, 'square', 0.1);
    }

    startBackgroundMusic() {
        if (!this.isInitialized || this.bgMusicPlaying || this.isMuted) return;

        this.bgMusicPlaying = true;
        this.playBackgroundMelody();
    }

    playBackgroundMelody() {
        if (!this.bgMusicPlaying || this.isMuted) return;

        const melody = [
            { note: 262, duration: 0.5 },
            { note: 294, duration: 0.5 },
            { note: 330, duration: 0.5 },
            { note: 349, duration: 0.5 },
            { note: 392, duration: 0.5 },
            { note: 349, duration: 0.5 },
            { note: 330, duration: 0.5 },
            { note: 294, duration: 1 }
        ];

        let time = 0;
        melody.forEach(({ note, duration }) => {
            setTimeout(() => {
                if (this.bgMusicPlaying && !this.isMuted) {
                    this.playNote(note, duration * 0.9, 'sine', 0.08);
                    this.playNote(note * 0.5, duration * 0.9, 'triangle', 0.05);
                }
            }, time * 1000);
            time += duration;
        });

        setTimeout(() => {
            if (this.bgMusicPlaying && !this.isMuted) {
                this.playBackgroundMelody();
            }
        }, time * 1000);
    }

    stopBackgroundMusic() {
        this.bgMusicPlaying = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        }
        return this.isMuted;
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

window.AudioManager = AudioManager;
window.audioManager = new AudioManager();
