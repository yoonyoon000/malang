import { useMemo } from 'react';
import * as THREE from 'three';

const skin = '#ffc8ad';
const crease = '#ef9c8d';

function ease(value) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, value)), 3);
}

function RoundedSegment({ length, radius, position, rotation, color = skin }) {
  return (
    <mesh castShadow receiveShadow position={position} rotation={rotation}>
      <capsuleGeometry args={[radius, length, 16, 26]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.02} />
    </mesh>
  );
}

function Finger({ base, side, curl, spread = 0, radius = 0.12, lengths = [0.56, 0.42, 0.33], delay = 0 }) {
  const c = ease(Math.max(0, curl - delay) / (1 - delay));
  const inward = side * (0.15 + c * 0.18);
  const bend1 = -0.12 - c * 1.08;
  const bend2 = -0.08 - c * 1.2;
  const bend3 = -0.04 - c * 0.82;
  const baseRot = [0.08 + c * 0.18, side * (0.08 + spread - c * 0.38), side * 0.03];

  return (
    <group position={[base[0] - inward * c, base[1] - c * 0.02, base[2] + c * 0.24]} rotation={baseRot}>
      <group rotation={[bend1, 0, 0]}>
        <RoundedSegment length={lengths[0]} radius={radius} position={[0, lengths[0] / 2, 0]} rotation={[0, 0, 0]} />
        <mesh position={[0, lengths[0] + 0.01, 0]} castShadow>
          <sphereGeometry args={[radius * 1.04, 18, 12]} />
          <meshStandardMaterial color={skin} roughness={0.5} />
        </mesh>
        <group position={[0, lengths[0], 0]} rotation={[bend2, 0, 0]}>
          <RoundedSegment length={lengths[1]} radius={radius * 0.92} position={[0, lengths[1] / 2, 0]} rotation={[0, 0, 0]} />
          <mesh position={[0, lengths[1] + 0.005, radius * 0.06]} castShadow>
            <torusGeometry args={[radius * 0.86, radius * 0.025, 8, 24]} />
            <meshStandardMaterial color={crease} roughness={0.62} />
          </mesh>
          <group position={[0, lengths[1], 0]} rotation={[bend3, 0, 0]}>
            <RoundedSegment length={lengths[2]} radius={radius * 0.82} position={[0, lengths[2] / 2, 0]} rotation={[0, 0, 0]} />
            <mesh position={[0, lengths[2] + radius * 0.08, 0.02]} castShadow>
              <sphereGeometry args={[radius * 0.84, 20, 14]} />
              <meshStandardMaterial color={skin} roughness={0.48} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function Thumb({ curl }) {
  const c = ease(Math.max(0, curl - 0.06) / 0.94);
  return (
    <group position={[-0.86 + c * 0.38, -0.02 - c * 0.04, 0.36 - c * 0.15]} rotation={[0.48 + c * 0.32, 0.08 - c * 0.72, 1.02 - c * 0.72]}>
      <group rotation={[-0.08 - c * 0.72, 0, 0]}>
        <RoundedSegment length={0.54} radius={0.16} position={[0, 0.27, 0]} rotation={[0, 0, 0]} />
        <group position={[0, 0.54, 0]} rotation={[-0.12 - c * 0.84, 0, 0]}>
          <RoundedSegment length={0.42} radius={0.145} position={[0, 0.21, 0]} rotation={[0, 0, 0]} />
          <mesh position={[0, 0.45, 0.02]} castShadow>
            <sphereGeometry args={[0.135, 22, 14]} />
            <meshStandardMaterial color={skin} roughness={0.45} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function HandModel({ squeezeAmount }) {
  const palmScale = useMemo(
    () => [1.05 + squeezeAmount * 0.04, 0.72 - squeezeAmount * 0.03, 0.42 + squeezeAmount * 0.05],
    [squeezeAmount],
  );

  return (
    <group position={[0, -0.58, 0.18]} rotation={[-0.38, 0.03, 0]}>
      <mesh castShadow receiveShadow scale={palmScale} position={[0, 0.14, 0.02]}>
        <sphereGeometry args={[0.82, 42, 28]} />
        <meshStandardMaterial color={skin} roughness={0.52} metalness={0.015} />
      </mesh>
      <mesh position={[0, 0.14, 0.41]} scale={[0.76, 0.42, 0.045]} castShadow>
        <sphereGeometry args={[1, 36, 16]} />
        <meshStandardMaterial color="#ffd9c8" roughness={0.7} transparent opacity={0.6} />
      </mesh>
      <Finger base={[-0.45, 0.62, 0.13]} side={-1} curl={squeezeAmount} spread={0.13} radius={0.115} lengths={[0.53, 0.4, 0.32]} delay={0.08} />
      <Finger base={[-0.15, 0.68, 0.11]} side={-0.35} curl={squeezeAmount} spread={0.04} radius={0.125} lengths={[0.62, 0.47, 0.36]} delay={0} />
      <Finger base={[0.17, 0.67, 0.11]} side={0.35} curl={squeezeAmount} spread={-0.03} radius={0.122} lengths={[0.59, 0.44, 0.34]} delay={0.04} />
      <Finger base={[0.47, 0.61, 0.14]} side={1} curl={squeezeAmount} spread={-0.12} radius={0.105} lengths={[0.49, 0.37, 0.3]} delay={0.12} />
      <Thumb curl={squeezeAmount} />
      <mesh position={[-0.44, 0.18, 0.51]} rotation={[0.28, -0.2, -0.55]} castShadow>
        <torusGeometry args={[0.19, 0.018, 8, 28, Math.PI * 1.28]} />
        <meshStandardMaterial color={crease} roughness={0.64} />
      </mesh>
      <mesh position={[0.3, 0.12, 0.5]} rotation={[0.35, 0.15, 0.42]} castShadow>
        <torusGeometry args={[0.16, 0.014, 8, 26, Math.PI * 1.16]} />
        <meshStandardMaterial color={crease} roughness={0.64} />
      </mesh>
    </group>
  );
}
