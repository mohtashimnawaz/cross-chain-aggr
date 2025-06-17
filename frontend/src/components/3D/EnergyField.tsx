import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnergyFieldProps {
  radius?: number;
  segments?: number;
  speed?: number;
  intensity?: number;
  color?: string;
}

const EnergyField: React.FC<EnergyFieldProps> = ({
  radius = 15,
  segments = 64,
  speed = 1,
  intensity = 1,
  color = '#9945FF'
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create custom shader material for energy field effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        radius: { value: radius },
        intensity: { value: intensity },
        color: { value: new THREE.Color(color) },
        speed: { value: speed }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float radius;
        uniform float intensity;
        uniform vec3 color;
        uniform float speed;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create flowing energy effect
          float flow = sin(dist * 20.0 - time * speed * 2.0) * 0.5 + 0.5;
          float pulse = sin(time * speed) * 0.3 + 0.7;
          
          // Create radial gradient
          float radial = 1.0 - smoothstep(0.0, 0.8, dist);
          
          // Combine effects
          float alpha = radial * flow * pulse * intensity;
          
          // Add some variation based on position
          float variation = sin(vPosition.x * 10.0 + time * speed) * 
                           cos(vPosition.y * 10.0 + time * speed * 0.7) * 0.2 + 0.8;
          
          alpha *= variation;
          
          // Fade out at edges
          alpha *= smoothstep(1.0, 0.8, dist);
          
          gl_FragColor = vec4(color, alpha * 0.3);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }, [radius, intensity, color, speed]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 2, radius + 2, segments]} />
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
};

export default EnergyField; 