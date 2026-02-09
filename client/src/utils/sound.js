// Utilidad para generar sonidos con Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export const playSound = (type = 'click') => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
        // Sonido suave y agudo para hover (tipo "blip")
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

        gainNode.gain.setValueAtTime(0.05, now); // Volumen bajo
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
    else if (type === 'click') {
        // Sonido más percusivo para click
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }
    else if (type === 'success') {
        // Sonido de éxito (arpegio rápido)
        const oscillator2 = audioCtx.createOscillator();
        const gainNode2 = audioCtx.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, now); // C5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);

        setTimeout(() => {
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(659.25, now + 0.1); // E5
            gainNode2.gain.setValueAtTime(0.1, now + 0.1);
            gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            oscillator2.start(now + 0.1);
            oscillator2.stop(now + 0.4);
        }, 100);
    }
};
