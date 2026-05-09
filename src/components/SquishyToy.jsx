import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function makeShapeGeometry(shape) {
  if (shape === 'bean') {
    const geometry = new THREE.SphereGeometry(0.72, 96, 64);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const bottomFlat = y < -0.46 ? -0.46 + (y + 0.46) * 0.28 : y;
      position.setXYZ(i, x * (1.05 + y * 0.08), bottomFlat * 1.02, z * (0.82 + x * 0.05));
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  if (shape === 'star') {
    const geometry = new THREE.SphereGeometry(0.68, 96, 64);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const angle = Math.atan2(z, x);
      const ridge = 1 + Math.cos(angle * 5) * 0.085 * (1 - Math.abs(y) * 0.8);
      const bottomFlat = y < -0.44 ? -0.44 + (y + 0.44) * 0.3 : y;
      position.setXYZ(i, x * ridge, bottomFlat * 1.05, z * ridge);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  const geometry = new THREE.SphereGeometry(0.7, 112, 72);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const bottomFlat = y < -0.5 ? -0.5 + (y + 0.5) * 0.18 : y;
    const dome = 1 + Math.max(0, y) * 0.08;
    position.setXYZ(i, x * dome, bottomFlat * 1.16, z * dome);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeGelTexture() {
  const size = 384;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const wave =
        Math.sin(x * 0.27 + Math.sin(y * 0.12) * 3.4) * 32 +
        Math.sin(y * 0.31 + x * 0.08) * 27 +
        Math.sin((x + y) * 0.18) * 21 +
        Math.sin((x - y) * 0.24) * 16;
      const cells = Math.sin(Math.hypot(x - size * 0.48, y - size * 0.52) * 0.54) * 18;
      const value = 128 + wave + cells;
      const index = (y * size + x) * 4;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.7, 3.7);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export default function SquishyToy({ squeezeAmount, color, shape, jigglePulse }) {
  const meshRef = useRef();
  const geometry = useMemo(() => makeShapeGeometry(shape), [shape]);
  const basePositions = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);
  const gelTexture = useMemo(() => makeGelTexture(), []);
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
      const fineWrinkle =
        Math.sin(x * 48 + z * 28 + y * 15) *
        Math.sin(z * 39 - y * 25 + x * 7) *
        0.015;
      const ripple = Math.sin((x * 5.2 + z * 4.6) + t * 7.5) * squeeze * 0.025 + fineWrinkle;

      position.setXYZ(
        i,
        x * sideBulge + Math.sign(x || 1) * squeeze * sidePressure * 0.08 + ripple,
        y * verticalSquash - topPressure * squeeze * 0.16 + wobble * (1 - Math.abs(y)),
        z * (1 + sidePressure * squeeze * 0.32) - contactDimple * squeeze * 0.07 + fineWrinkle * 0.55,
      );
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    meshRef.current.position.y = -0.04 - squeeze * 0.22 + rebound * 0.08 + wobble * 0.2;
    meshRef.current.rotation.x = squeeze * 0.14 + Math.sin(t * 8) * squeeze * 0.025;
    meshRef.current.rotation.z = -squeeze * 0.08 + Math.sin(t * 7.2) * squeeze * 0.03;

  });

  return (
    <group position={[0, 0.05, 0.42]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.58}
          metalness={0}
          transmission={0.42}
          thickness={0.7}
          ior={1.36}
          transparent
          opacity={0.72}
          clearcoat={0.35}
          clearcoatRoughness={0.48}
          emissive={color}
          emissiveIntensity={0.42}
          sheen={0.28}
          sheenColor="#ffffff"
          bumpMap={gelTexture}
          bumpScale={0.095}
        />
      </mesh>
      <mesh position={[-0.18, 0.24, 0.48]} scale={[0.17, 0.055, 0.08]} rotation={[0.35, -0.4, -0.42]}>
        <sphereGeometry args={[1, 24, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.46} />
      </mesh>
    </group>
  );
}
