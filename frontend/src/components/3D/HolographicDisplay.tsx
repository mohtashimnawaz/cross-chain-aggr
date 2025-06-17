import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicDisplayProps {
  position: [number, number, number];
  title: string;
  data: { label: string; value: string; color?: string }[];
  size?: number;
  speed?: number;
}

const HolographicDisplay: React.FC<HolographicDisplayProps> = ({
  position,
  title,
  data,
  size = 1,
  speed = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Create holographic material
  const holographicMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#00ffff',
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
  }, []);

  // Create scan line material
  const scanLineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00ffff') }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float scanLine = sin(vUv.y * 50.0 + time * 3.0) * 0.5 + 0.5;
          float flicker = sin(time * 10.0) * 0.1 + 0.9;
          float alpha = scanLine * flicker * 0.3;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      
      // Rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    
    if (scanLineMaterial.uniforms) {
      scanLineMaterial.uniforms.time.value = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Background panel */}
      <mesh>
        <planeGeometry args={[3 * size, 4 * size]} />
        <primitive object={holographicMaterial} />
      </mesh>
      
      {/* Scan lines */}
      <mesh>
        <planeGeometry args={[3 * size, 4 * size]} />
        <primitive object={scanLineMaterial} />
      </mesh>
      
      {/* Border frame */}
      <mesh>
        <ringGeometry args={[1.5 * size, 1.6 * size, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
      </mesh>
      
      {/* Title */}
      <Text
        position={[0, 1.5 * size, 0.1]}
        fontSize={0.3 * size}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
      
      {/* Data items */}
      {data.map((item, index) => (
        <group key={index} position={[0, 0.5 * size - index * 0.4 * size, 0.1]}>
          <Text
            position={[-1 * size, 0, 0]}
            fontSize={0.2 * size}
            color="#ffffff"
            anchorX="left"
            anchorY="middle"
          >
            {item.label}
          </Text>
          <Text
            position={[1 * size, 0, 0]}
            fontSize={0.2 * size}
            color={item.color || "#00ffff"}
            anchorX="right"
            anchorY="middle"
          >
            {item.value}
          </Text>
        </group>
      ))}
      
      {/* Corner accents */}
      {[
        [-1.4 * size, 1.9 * size, 0],
        [1.4 * size, 1.9 * size, 0],
        [-1.4 * size, -1.9 * size, 0],
        [1.4 * size, -1.9 * size, 0]
      ].map((pos, index) => (
        <mesh key={index} position={pos as [number, number, number]}>
          <boxGeometry args={[0.1 * size, 0.1 * size, 0.1 * size]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      ))}
    </group>
  );
};

export default HolographicDisplay; 