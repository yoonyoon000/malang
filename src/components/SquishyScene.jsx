import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SquishyToy from './SquishyToy.jsx';

const frontCameraPosition = [0, 0.7, 4.6];
const mobileFrontCameraPosition = [0, 0.58, 5.35];

function CameraControls({ resetViewSignal, isMobile }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef(null);
  const currentFrontPosition = isMobile ? mobileFrontCameraPosition : frontCameraPosition;

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = isMobile ? 3.5 : 2.7;
    controls.maxDistance = isMobile ? 7.2 : 6.4;
    controls.minPolarAngle = 0.16;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, -0.08, 0.42);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, isMobile]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  useEffect(() => {
    if (!controlsRef.current) return;
    camera.position.set(...currentFrontPosition);
    controlsRef.current.target.set(0, -0.08, 0.42);
    controlsRef.current.update();
  }, [camera, currentFrontPosition, resetViewSignal]);

  return null;
}

export default function SquishyScene({ squeezeAmount, toyColor, toyShape, jigglePulse, resetViewSignal, isMobile }) {
  const cameraPosition = isMobile ? mobileFrontCameraPosition : frontCameraPosition;
  const toyScale = isMobile ? 1.08 : 1.45;
  const toyPosition = isMobile ? [0, -0.2, 0] : [0, -0.3, 0];

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: cameraPosition, fov: isMobile ? 37 : 39, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#fff7fb']} />
      <fog attach="fog" args={['#fff7fb', 9, 19]} />
      <ambientLight intensity={1.75} />
      <directionalLight position={[3.8, 5.2, 4.4]} intensity={1.65} />
      <pointLight position={[-3.5, 3, 2]} intensity={1.75} color="#ffd6f1" />
      <pointLight position={[2.4, 1.1, -3]} intensity={1.45} color="#b5f3ff" />

      <group position={toyPosition} rotation={[0.06, -0.18, 0]} scale={toyScale}>
        <SquishyToy squeezeAmount={squeezeAmount} color={toyColor} shape={toyShape} jigglePulse={jigglePulse} />
      </group>

      <CameraControls resetViewSignal={resetViewSignal} isMobile={isMobile} />
    </Canvas>
  );
}
