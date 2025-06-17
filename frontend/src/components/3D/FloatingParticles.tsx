import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  size?: number;
  speed?: number;
  spread?: number;
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 1000,
  colors = ['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4', '#45B7D1'],
  size = 0.02,
  speed = 0.5,
  spread = 50
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Create particle positions and colors
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors_array = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random position within spread
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      
      // Random color from palette
      const color = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      colors_array[i * 3] = color.r;
      colors_array[i * 3 + 1] = color.g;
      colors_array[i * 3 + 2] = color.b;
    }
    
    return { positions, colors: colors_array };
  }, [count, colors, spread]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed;
      
      for (let i = 0; i < count; i++) {
        const id = i;
        
        // Animate each particle
        dummy.position.set(
          particles.positions[i * 3] + Math.sin(time + i) * 2,
          particles.positions[i * 3 + 1] + Math.cos(time + i * 0.5) * 2,
          particles.positions[i * 3 + 2] + Math.sin(time + i * 0.3) * 2
        );
        
        // Rotate particles
        dummy.rotation.set(
          Math.sin(time + i) * 0.5,
          Math.cos(time + i) * 0.5,
          Math.sin(time + i * 0.7) * 0.5
        );
        
        // Scale based on time
        const scale = 1 + Math.sin(time + i) * 0.3;
        dummy.scale.setScalar(scale * size);
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(id, dummy.matrix);
      }
      
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        opacity={0.6}
        vertexColors
        onBeforeCompile={(shader) => {
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            attribute vec3 color;
            varying vec3 vColor;`
          );
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            vColor = color;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            'varying vec3 vViewPosition;',
            `varying vec3 vViewPosition;
            varying vec3 vColor;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
            'gl_FragColor = vec4( vColor * outgoingLight, diffuseColor.a );'
          );
        }}
      />
    </instancedMesh>
  );
};

export default FloatingParticles; 