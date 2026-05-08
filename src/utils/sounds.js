let audioContext = null;
let unlocked = false;

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export function unlockAudio() {
  const context = getContext();
  if (context.state === 'suspended') {
    context.resume();
  }
  unlocked = true;
}

function playBlob({ startFrequency, endFrequency, duration, gain, type = 'sine', wobble = 0 }) {
  if (!unlocked) return;

  const context = getContext();
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const wobbleOsc = context.createOscillator();
  const wobbleGain = context.createGain();
  const filter = context.createBiquadFilter();
  const output = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
  wobbleOsc.frequency.value = 18;
  wobbleGain.gain.value = wobble;
  wobbleOsc.connect(wobbleGain);
  wobbleGain.connect(oscillator.frequency);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(900, now);
  filter.frequency.exponentialRampToValueAtTime(260, now + duration);
  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(gain, now + 0.018);
  output.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(filter);
  filter.connect(output);
  output.connect(context.destination);
  wobbleOsc.start(now);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.04);
  wobbleOsc.stop(now + duration + 0.04);
}

export function playSqueezeSquish(amount = 0.5) {
  playBlob({
    startFrequency: 260 + amount * 40,
    endFrequency: 118,
    duration: 0.18,
    gain: 0.065,
    type: 'triangle',
    wobble: 18,
  });
}

export function playReleasePop(amount = 0.5) {
  playBlob({
    startFrequency: 160 + amount * 50,
    endFrequency: 420 + amount * 120,
    duration: 0.15,
    gain: 0.052,
    type: 'sine',
    wobble: 26,
  });
}

export function playStrongSquish(amount = 1) {
  playBlob({
    startFrequency: 128 + amount * 30,
    endFrequency: 58,
    duration: 0.24,
    gain: 0.078,
    type: 'sawtooth',
    wobble: 12,
  });
}
