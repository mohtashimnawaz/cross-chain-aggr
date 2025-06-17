import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import ChainOrb from './ChainOrb';
import FloatingParticles from './FloatingParticles';
import EnergyField from './EnergyField';
import DataStreams from './DataStreams';
import HolographicDisplay from './HolographicDisplay';
import PortalEffect from './PortalEffect';

interface CrossChainSceneProps {
  globalData: any;
  userData: any;
  crossChainData: any;
  onChainSelect?: (chain: string) => void;
}

const SceneContent: React.FC<CrossChainSceneProps> = ({ 
  globalData, 
  userData, 
  crossChainData, 
  onChainSelect 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  // Chain configurations
  const chains = [
    { name: 'Solana', position: [10, 0, 0], color: '#9945FF', icon: '◎' },
    { name: 'Ethereum', position: [-10, 0, 0], color: '#627EEA', icon: 'Ξ' },
    { name: 'Polygon', position: [0, 10, 0], color: '#8247E5', icon: '◈' },
    { name: 'Avalanche', position: [0, -10, 0], color: '#E84142', icon: '❄' },
    { name: 'Arbitrum', position: [7, 7, 0], color: '#28A0F0', icon: '⟁' },
    { name: 'Optimism', position: [-7, 7, 0], color: '#FF0420', icon: '⚡' }
  ];

  const handleChainClick = (chainName: string) => {
    setSelectedChain(chainName);
    onChainSelect?.(chainName);
  };

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation of the entire scene
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central hub with energy field */}
      <EnergyField radius={12} intensity={1.2} color="#9945FF" />
      
      {/* Floating particles around the scene */}
      <FloatingParticles 
        count={800} 
        colors={['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4']}
        spread={40}
        speed={0.3}
      />
      
      {/* Data streams connecting chains to central hub */}
      <DataStreams 
        positions={chains.map(chain => chain.position as [number, number, number])}
        colors={chains.map(chain => chain.color)}
        speed={1.5}
        thickness={0.08}
      />
      
      {/* Chain orbs */}
      {chains.map((chain, index) => (
        <ChainOrb
          key={chain.name}
          position={chain.position as [number, number, number]}
          color={chain.color}
          chainName={chain.name}
          apy={crossChainData[chain.name]?.apy || 0}
          balance={crossChainData[chain.name]?.balance || "0"}
          onClick={() => handleChainClick(chain.name)}
        />
      ))}
      
      {/* Central portal effect */}
      <PortalEffect 
        position={[0, 0, 0]} 
        size={3} 
        active={true} 
        color="#14F195"
      />
      
      {/* Holographic displays showing data */}
      <HolographicDisplay
        position={[-12, 7, 3]}
        title="Global Stats"
        data={[
          { label: "Total TVL", value: `$${(globalData?.totalTvl || 0).toLocaleString()}`, color: "#14F195" },
          { label: "Total Users", value: (globalData?.totalUsers || 0).toLocaleString(), color: "#9945FF" },
          { label: "APY", value: `${(globalData?.averageApy || 0).toFixed(2)}%`, color: "#FF6B6B" },
          { label: "Chains", value: chains.length.toString(), color: "#4ECDC4" }
        ]}
        size={2}
      />
      
      <HolographicDisplay
        position={[12, 7, 3]}
        title="Your Portfolio"
        data={[
          { label: "Total Value", value: `$${(userData?.totalValue || 0).toLocaleString()}`, color: "#14F195" },
          { label: "Deposits", value: `$${(userData?.totalDeposits || 0).toLocaleString()}`, color: "#9945FF" },
          { label: "Earnings", value: `$${(userData?.totalEarnings || 0).toLocaleString()}`, color: "#FF6B6B" },
          { label: "Active Chains", value: (userData?.activeChains || 0).toString(), color: "#4ECDC4" }
        ]}
        size={2}
      />
      
      {/* Additional portal effects for each chain */}
      {chains.map((chain, index) => (
        <PortalEffect
          key={`portal-${chain.name}`}
          position={chain.position as [number, number, number]}
          size={1.5}
          active={selectedChain === chain.name}
          color={chain.color}
        />
      ))}
    </group>
  );
};

const CrossChainScene: React.FC<CrossChainSceneProps> = (props) => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#9945FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#14F195" />
        
        {/* Stars background */}
        <Stars 
          radius={100} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1}
        />
        
        {/* Scene content */}
        <SceneContent {...props} />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={50}
          minDistance={10}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Overlay instructions */}
      <div className="absolute top-4 left-4 text-white text-sm opacity-70">
        <p>🖱️ Click chains to select</p>
        <p>🔄 Drag to rotate view</p>
        <p>🔍 Scroll to zoom</p>
      </div>
    </div>
  );
};

export default CrossChainScene; 