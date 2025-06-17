import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface ChainOrbProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  distortion?: number;
  chainName: string;
  apy: number;
  balance: string;
  onClick?: () => void;
}

const CHAIN_ICONS: Record<string, string> = {
  Solana: '◎',
  Ethereum: 'Ξ',
  Polygon: '◈',
  Avalanche: '❄',
  Arbitrum: '⟁',
  Optimism: '⚡',
};

const ChainOrb: React.FC<ChainOrbProps> = ({
  position,
  color,
  size = 1.2,
  speed = 1.5,
  distortion = 0.5,
  chainName,
  apy,
  balance,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.1;
      meshRef.current.rotation.y += 0.01 * speed;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      let scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * (apy / 10);
      if (hovered) scale *= 1.18;
      if (active) scale *= 1.08;
      groupRef.current.scale.setScalar(scale);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.7;
      const mat = ringRef.current.material;
      if (mat && 'opacity' in mat) {
        (mat as THREE.MeshBasicMaterial).opacity = 0.4 + 0.2 * Math.sin(state.clock.elapsedTime * 2) + (hovered ? 0.3 : 0);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Sparkles effect */}
      <Sparkles count={30} scale={[size * 2, size * 2, size * 2]} color={color} speed={0.7} opacity={0.7} />
      {/* Main orb with animated distortion */}
      <Sphere
        args={[size, 32, 32]}
        onClick={() => { setActive(true); onClick?.(); setTimeout(() => setActive(false), 200); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        ref={meshRef}
      >
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distortion}
          speed={2}
          roughness={0.15}
          metalness={0.7}
          emissive={color}
          emissiveIntensity={hovered ? 0.7 : 0.3}
          transparent
          opacity={0.95}
        />
      </Sphere>
      {/* Animated glowing ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[size * 1.15, 0.07, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      {/* Glow effect */}
      <Sphere args={[size * 1.3, 16, 16]}>
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </Sphere>
      {/* Chain icon above orb */}
      <Text
        position={[0, size * 2.1, 0]}
        fontSize={0.38}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineColor="#000"
        outlineWidth={0.02}
      >
        {CHAIN_ICONS[chainName] || '◎'}
      </Text>
      {/* Chain name label above orb */}
      <Text
        position={[0, size * 1.5, 0]}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="bottom"
        outlineColor="#000"
        outlineWidth={0.02}
      >
        {chainName}
      </Text>
      {/* APY label below orb */}
      <Text
        position={[0, -size * 1.2, 0]}
        fontSize={0.22}
        color="#fff"
        anchorX="center"
        anchorY="top"
        outlineColor={color}
        outlineWidth={0.01}
      >
        {apy ? `${apy.toFixed(2)}% APY` : ''}
      </Text>
    </group>
  );
};

export default ChainOrb; 