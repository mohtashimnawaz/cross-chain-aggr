import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataStreamsProps {
  positions: [number, number, number][];
  colors: string[];
  speed?: number;
  thickness?: number;
}

const DataStreams: React.FC<DataStreamsProps> = ({
  positions,
  colors,
  speed = 2,
  thickness = 0.1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const streams = useMemo(() => {
    return positions.map((pos, index) => {
      const color = colors[index % colors.length];
      const distance = Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2);
      const segments = Math.max(10, Math.floor(distance / 2));
      
      return {
        color,
        segments,
        distance,
        originalPosition: pos
      };
    });
  }, [positions, colors]);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime * speed;
      
      // Clear existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Create new data streams
      streams.forEach((stream, index) => {
        const points: THREE.Vector3[] = [];
        const direction = new THREE.Vector3(...stream.originalPosition).normalize();
        
        // Create curved path
        for (let i = 0; i <= stream.segments; i++) {
          const t = i / stream.segments;
          const progress = t + (Math.sin(time + index) * 0.1);
          
          // Create wave effect
          const wave = Math.sin(progress * Math.PI * 4 + time + index) * 0.5;
          const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
          
          const point = direction.clone()
            .multiplyScalar(stream.distance * progress)
            .add(perpendicular.multiplyScalar(wave));
          
          points.push(point);
        }
        
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: stream.color,
          transparent: true,
          opacity: 0.6,
          linewidth: thickness
        });
        
        const line = new THREE.Line(geometry, material);
        groupRef.current?.add(line);
        
        // Add moving particles along the stream
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
          const particleTime = (time + i / particleCount) % 1;
          const particleIndex = Math.floor(particleTime * stream.segments);
          
          if (particleIndex < points.length - 1) {
            const t = (particleTime * stream.segments) % 1;
            const point1 = points[particleIndex];
            const point2 = points[particleIndex + 1];
            const particlePos = point1.clone().lerp(point2, t);
            
            const particleGeometry = new THREE.SphereGeometry(thickness * 2, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
              color: stream.color,
              transparent: true,
              opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.copy(particlePos);
            groupRef.current?.add(particle);
          }
        }
      });
    }
  });

  return <group ref={groupRef} />;
};

export default DataStreams; 