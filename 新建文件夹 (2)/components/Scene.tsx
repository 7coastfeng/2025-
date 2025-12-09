import React from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const Scene: React.FC = () => {
  return (
    <>
      <OrbitControls 
        minDistance={10} 
        maxDistance={40} 
        enablePan={false}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting Setup for Cinematic Look */}
      <ambientLight intensity={0.2} color="#00140e" />
      
      {/* Main warm light - Intensity reduced to lower highlights */}
      <spotLight 
        position={[20, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1.6} 
        color="#fff0d6" 
        castShadow 
      />

      {/* Rim light for gold sparkles */}
      <pointLight position={[-10, 5, -10]} intensity={2} color="#D4AF37" />

      {/* Bottom up fill */}
      <pointLight position={[0, -10, 5]} intensity={1} color="#004D3A" />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;