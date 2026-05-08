import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function makeShapeGeometry(shape) {
  if (shape === 'bean') {
    const geometry = new THREE.SphereGeometry(0.72, 64, 42);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      position.setXYZ(i, x * (1.08 + y * 0.08), y * 0.82, z * (0.78 + x * 0.05));
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  if (shape === 'star') {
    const geometry = new THREE.SphereGeometry(0.68, 72, 44);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const angle = Math.atan2(z, x);
      const ridge = 1 + Math.cos(angle * 5) * 0.085 * (1 - Math.abs(y) * 0.8);
      position.setXYZ(i, x * ridge, y * 0.86, z * ridge);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  return new THREE.SphereGeometry(0.7, 72, 48);
}

export default function SquishyToy({ squeezeAmount, color, shape, jigglePulse }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const geometry = useMemo(() => makeShapeGeometry(shape), [shape]);
  const basePositions = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  const pulseRef = useRef(0);

  useEffect(() => {
    pulseRef.current = 1;
  }, [jigglePulse, color, shape]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const t = state.clock.elapsedTime;
    const squeeze = Math.max(0, squeezeAmount);
    const rebound = squeezeAmount < 0 ? -squeezeAmount : 0;
    const wobble = Math.sin(t * 16) * squeeze * 0.025 + pulseRef.current * Math.sin(t * 24) * 0.028;
    pulseRef.current *= Math.exp(-delta * 4.2);

    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const ix = i * 3;
      const x = basePositions[ix];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];
      const topPressure = Math.max(0, y);
      const sidePressure = Math.max(0, 1 - Math.abs(y) * 1.4);
      const contactDimple = Math.exp(-((x + 0.48) ** 2 + (z - 0.04) ** 2) * 6.5) + Math.exp(-((x - 0.46) ** 2 + (z - 0.02) ** 2) * 6.2);
      const sideBulge = 1 + sidePressure * squeeze * 0.44 + rebound * 0.18;
      const verticalSquash = 1 - squeeze * (0.38 + topPressure * 0.15) + rebound * 0.14;
      const ripple = Math.sin((x * 5.2 + z * 4.6) + t * 7.5) * squeeze * 0.025;

      position.setXYZ(
        i,
        x * sideBulge + Math.sign(x || 1) * squeeze * sidePressure * 0.08 + ripple,
        y * verticalSquash - topPressure * squeeze * 0.16 + wobble * (1 - Math.abs(y)),
        z * (1 + sidePressure * squeeze * 0.32) - contactDimple * squeeze * 0.07,
      );
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    meshRef.current.position.y = -0.04 - squeeze * 0.22 + rebound * 0.08 + wobble * 0.2;
    meshRef.current.rotation.x = squeeze * 0.14 + Math.sin(t * 8) * squeeze * 0.025;
    meshRef.current.rotation.z = -squeeze * 0.08 + Math.sin(t * 7.2) * squeeze * 0.03;

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + squeeze * 0.22 + pulseRef.current * 0.08);
      glowRef.current.material.opacity = 0.14 + squeeze * 0.1;
    }
  });

  return (
    <group position={[0, 0.05, 0.42]}>
      <mesh ref={glowRef} position={[0, -0.09, 0]} scale={[1.18, 0.18, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef} castShadow receiveShadow geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.18}
          metalness={0}
          transmission={0.34}
          thickness={0.85}
          transparent
          opacity={0.78}
          clearcoat={0.8}
          clearcoatRoughness={0.18}
          sheen={0.42}
          sheenColor="#ffffff"
        />
      </mesh>
      <mesh position={[-0.18, 0.24, 0.48]} scale={[0.17, 0.055, 0.08]} rotation={[0.35, -0.4, -0.42]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.46} />
      </mesh>
    </group>
  );
}
