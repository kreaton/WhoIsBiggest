// Little synthesized sounds, so the game needs no audio files.
window.gameSounds = (() => {
    let ctx = null;

    function audio() {
        if (!ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            ctx = new Ctx();
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    // iOS only lets audio start inside a user gesture, so wake the context on the first tap.
    function unlock() {
        const c = audio();
        if (!c) return;
        const buffer = c.createBuffer(1, 1, 22050);
        const source = c.createBufferSource();
        source.buffer = buffer;
        source.connect(c.destination);
        source.start(0);
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchend", unlock);
    }
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("touchend", unlock);

    function note(c, { freq, start, length, type = "triangle", volume = 0.25, slideTo = null }) {
        const t = c.currentTime + start;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + length);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
        osc.connect(gain).connect(c.destination);
        osc.start(t);
        osc.stop(t + length + 0.05);
    }

    return {
        // A short "ta-da-da-daaa!" fanfare: C E G, then a held high C chord.
        success() {
            const c = audio();
            if (!c) return;
            const tune = [
                { freq: 523.25, start: 0.00, length: 0.14 },
                { freq: 659.25, start: 0.12, length: 0.14 },
                { freq: 783.99, start: 0.24, length: 0.14 },
            ];
            for (const n of tune) {
                note(c, { ...n, type: "square", volume: 0.12 });
                note(c, { ...n, volume: 0.2 });
            }
            for (const freq of [1046.5, 1318.5, 1568.0]) {
                note(c, { freq, start: 0.38, length: 0.6, type: "square", volume: 0.07 });
                note(c, { freq, start: 0.38, length: 0.7, volume: 0.14 });
            }
        },

        // A friendly, sliding "uh-oh" going downhill.
        tryAgain() {
            const c = audio();
            if (!c) return;
            note(c, { freq: 440, slideTo: 392, start: 0.00, length: 0.22, volume: 0.3 });
            note(c, { freq: 349.23, slideTo: 262, start: 0.24, length: 0.4, volume: 0.3 });
        },
    };
})();
