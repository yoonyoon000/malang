import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import SquishyToy from './SquishyToy.jsx';

function CameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.7;
    controls.maxDistance = 6.4;
    controls.minPolarAngle = 0.16;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.target.set(0, -0.08, 0.42);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

export default function SquishyScene({ squeezeAmount, toyColor, toyShape, jigglePulse }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [2.6, 1.8, 4.15], fov: 39, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={['#fff7fb']} />
      <fog attach="fog" args={['#fff7fb', 9, 19]} />
      <ambientLight intensity={1.34} />
      <directionalLight position={[3.8, 5.2, 4.4]} intensity={2.35} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3.5, 3, 2]} intensity={2.65} color="#ffd6f1" />
      <pointLight position={[2.4, 1.1, -3]} intensity={1.95} color="#b5f3ff" />

      <group position={[0, -0.3, 0]} rotation={[0.06, -0.18, 0]} scale={1.45}>
        <SquishyToy squeezeAmount={squeezeAmount} color={toyColor} shape={toyShape} jigglePulse={jigglePulse} />
      </group>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <circleGeometry args={[6, 96]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.28} roughness={0.88} />
      </mesh>
      <CameraControls />
    </Canvas>
  );
}
