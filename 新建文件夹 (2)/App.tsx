import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { AppState } from './types';
import Scene from './components/Scene';
import Foliage from './components/Foliage';
import Ornaments from './components/Ornaments';
import TopStar from './components/TopStar';
import Overlay from './components/Overlay';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  return (
    <div className="relative w-full h-screen bg-[#000504]">
      <Overlay appState={appState} setAppState={setAppState} />
      
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, toneMappingExposure: 1.2 }}
        camera={{ position: [0, 0, 25], fov: 45 }}
      >
        <Suspense fallback={null}>
          <Scene />
          <group position={[0, -2, 0]}>
            <TopStar appState={appState} />
            <Foliage appState={appState} />
            <Ornaments appState={appState} />
          </group>
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ backgroundColor: '#000504' }}
        innerStyles={{ width: '200px', height: '2px', backgroundColor: '#333' }}
        barStyles={{ height: '2px', backgroundColor: '#D4AF37' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'Cinzel' }}
      />
    </div>
  );
};

export default App;