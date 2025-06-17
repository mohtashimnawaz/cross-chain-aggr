import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PortalEffectProps {
  position: [number, number, number];
  size?: number;
  speed?: number;
  active?: boolean;
  color?: string;
}

const PortalEffect: React.FC<PortalEffectProps> = ({
  position,
  size = 2,
  speed = 1,
  active = false,
  color = '#9945FF'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);

  // Create portal material with swirling effect
  const portalMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        active: { value: active ? 1.0 : 0.0 },
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
        uniform float active;
        uniform vec3 color;
        uniform float speed;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create swirling effect
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float swirl = sin(angle * 8.0 + time * speed * 2.0) * 0.5 + 0.5;
          
          // Create radial waves
          float waves = sin(dist * 20.0 - time * speed * 3.0) * 0.5 + 0.5;
          
          // Create pulsing effect
          float pulse = sin(time * speed) * 0.3 + 0.7;
          
          // Combine effects
          float intensity = swirl * waves * pulse * active;
          
          // Create edge glow
          float edge = 1.0 - smoothstep(0.3, 0.5, dist);
          intensity *= edge;
          
          // Add some variation
          float variation = sin(vPosition.x * 10.0 + time * speed) * 
                           cos(vPosition.y * 10.0 + time * speed * 0.7) * 0.2 + 0.8;
          
          intensity *= variation;
          
          // Fade out at center when active
          if (active > 0.5) {
            float centerFade = smoothstep(0.0, 0.3, dist);
            intensity *= centerFade;
          }
          
          gl_FragColor = vec4(color, intensity * 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }, [active, color, speed]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotation animation
      groupRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
      
      // Scale animation when active
      if (active) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1;
        groupRef.current.scale.setScalar(scale);
      }
    }
    
    if (portalMaterial.uniforms) {
      portalMaterial.uniforms.time.value = state.clock.elapsedTime;
      portalMaterial.uniforms.active.value = active ? 1.0 : 0.0;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main portal ring */}
      <mesh ref={portalRef}>
        <ringGeometry args={[size * 0.8, size, 64]} />
        <primitive object={portalMaterial} />
      </mesh>
      
      {/* Inner ring */}
      <mesh>
        <ringGeometry args={[size * 0.3, size * 0.5, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={active ? 0.4 : 0.1} 
        />
      </mesh>
      
      {/* Outer glow rings */}
      {[1.2, 1.4, 1.6].map((scale, index) => (
        <mesh key={index}>
          <ringGeometry args={[size * scale, size * (scale + 0.1), 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={active ? 0.1 / (index + 1) : 0.02 / (index + 1)} 
          />
        </mesh>
      ))}
      
      {/* Energy particles when active */}
      {active && (
        <group>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = size * 0.6;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0
                ]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshBasicMaterial 
                  color={color} 
                  transparent 
                  opacity={0.8} 
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

export default PortalEffect; 