import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
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

const ChainOrb: React.FC<ChainOrbProps> = ({
  position,
  color,
  size = 1,
  speed = 1,
  distortion = 0.4,
  chainName,
  apy,
  balance,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Create gradient texture
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.7, color + '80');
    gradient.addColorStop(1, color + '20');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [color]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Rotate the orb
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.1;
      meshRef.current.rotation.y += 0.01 * speed;
      
      // Float animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      
      // Pulse effect based on APY
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * (apy / 10);
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef} onClick={onClick}>
        <Sphere args={[size, 32, 32]}>
          <MeshDistortMaterial
            map={gradientTexture}
            distort={distortion}
            speed={2}
            transparent
            opacity={0.8}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </mesh>
      
      {/* Glow effect */}
      <Sphere args={[size * 1.2, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </Sphere>
      
      {/* Particle ring */}
      <group>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * size * 1.5,
              Math.sin((i / 12) * Math.PI * 2) * size * 1.5,
              0
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default ChainOrb; 