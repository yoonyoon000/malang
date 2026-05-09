import { useCallback, useEffect, useRef, useState } from 'react';
import SquishyScene from './components/SquishyScene.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import { playReleasePop, playSqueezeSquish, unlockAudio } from './utils/sounds.js';

const colors = ['#42b9e5', '#73d7ef', '#7adbc9', '#9cbdf8', '#d6a8ff'];
const shapes = ['dumpling', 'bean', 'star'];

export default function App() {
  const [isPressing, setIsPressing] = useState(false);
  const [squeezeAmount, setSqueezeAmount] = useState(0);
  const [toyColorIndex, setToyColorIndex] = useState(0);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [jigglePulse, setJigglePulse] = useState(0);
  const [resetViewSignal, setResetViewSignal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const velocityRef = useRef(0);
  const squeezeRef = useRef(0);
  const pressRef = useRef(false);
  const lastSoundRef = useRef(0);

  useEffect(() => {
    pressRef.current = isPressing;
  }, [isPressing]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 780px)');
    const updateMobile = () => setIsMobile(mediaQuery.matches);
    updateMobile();
    mediaQuery.addEventListener('change', updateMobile);

    return () => mediaQuery.removeEventListener('change', updateMobile);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const target = pressRef.current ? 0.78 : 0;
      const stiffness = target > squeezeRef.current ? 16 : 9;
      const damping = target > squeezeRef.current ? 7 : 5.3;
      const displacement = target - squeezeRef.current;

      velocityRef.current += displacement * stiffness * dt;
      velocityRef.current *= Math.exp(-damping * dt);
      squeezeRef.current += velocityRef.current;
      squeezeRef.current = Math.max(-0.08, Math.min(1.12, squeezeRef.current));

      if (squeezeRef.current > 0.72 && now - lastSoundRef.current > 380) {
        playSqueezeSquish(squeezeRef.current);
        lastSoundRef.current = now;
      }

      setSqueezeAmount(squeezeRef.current);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const beginPress = useCallback(() => {
    unlockAudio();
    setIsPressing(true);
    setJigglePulse((value) => value + 1);
    playSqueezeSquish(Math.max(0.25, squeezeRef.current));
  }, []);

  const endPress = useCallback(() => {
    setIsPressing(false);
    setJigglePulse((value) => value + 1);
    playReleasePop(Math.max(0.2, squeezeRef.current));
  }, []);

  return (
    <main className="app-shell">
      <section
        className="scene-wrap"
        onPointerDown={beginPress}
        onPointerUp={endPress}
        onPointerLeave={endPress}
        onPointerCancel={endPress}
      >
        <SquishyScene
          squeezeAmount={squeezeAmount}
          toyColor={colors[toyColorIndex]}
          toyShape={shapes[shapeIndex]}
          jigglePulse={jigglePulse}
          resetViewSignal={resetViewSignal}
          isMobile={isMobile}
        />
      </section>
      <ControlPanel
        onResetView={() => setResetViewSignal((value) => value + 1)}
        onColor={() => setToyColorIndex((value) => (value + 1) % colors.length)}
        onShape={() => setShapeIndex((value) => (value + 1) % shapes.length)}
      />
    </main>
  );
}
