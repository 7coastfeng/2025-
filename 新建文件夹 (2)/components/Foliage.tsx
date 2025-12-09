import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CONFIG, COLORS } from '../constants';
import { getRandomSpherePoint, getTreePoint } from '../utils/geometry';
import { AppState } from '../types';

const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0.0 (Scattered) -> 1.0 (Tree)
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  attribute float aSize;
  
  varying vec3 vColor;
  varying float vAlpha;

  // Cubic Bezier easing for smoother transition
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = easeInOutCubic(uProgress);
    
    // Mix positions
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add "breathing" / floating effect
    // It breathes more when scattered
    float breatheIntensity = mix(0.5, 0.1, t);
    pos.y += sin(uTime * 2.0 + aRandom * 10.0) * breatheIntensity;
    pos.x += cos(uTime * 1.5 + aRandom * 10.0) * (breatheIntensity * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    
    // Varying setup
    vAlpha = 0.8 + 0.2 * sin(uTime * 3.0 + aRandom * 20.0);
  }
`;

const fragmentShader = `
  varying float vAlpha;
  uniform vec3 uColorCore;
  uniform vec3 uColorTip;

  void main() {
    // Circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float r = length(xy);
    if (r > 0.5) discard;

    // Soft glow gradient
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5);

    // Color gradient from center to edge (Gold tip to Green core)
    vec3 finalColor = mix(uColorTip, uColorCore, r * 2.0);

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  appState: AppState;
}

const Foliage: React.FC<FoliageProps> = ({ appState }) => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Data generation
  const { positions, treePositions, scatterPositions, randoms, sizes } = useMemo(() => {
    const count = CONFIG.FOLIAGE_COUNT;
    const pos = new Float32Array(count * 3);
    const tree = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const sPos = getRandomSpherePoint(CONFIG.SCATTER_RADIUS);
      const tPos = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS_BOTTOM);
      
      // Start at scatter
      pos[i * 3] = sPos.x;
      pos[i * 3 + 1] = sPos.y;
      pos[i * 3 + 2] = sPos.z;

      scatter[i * 3] = sPos.x;
      scatter[i * 3 + 1] = sPos.y;
      scatter[i * 3 + 2] = sPos.z;

      tree[i * 3] = tPos.x;
      tree[i * 3 + 1] = tPos.y;
      tree[i * 3 + 2] = tPos.z;

      rnd[i] = Math.random();
      // Increased size for fuller tree
      sz[i] = Math.random() * 0.8 + 0.3; 
    }

    return { 
      positions: pos, 
      treePositions: tree, 
      scatterPositions: scatter, 
      randoms: rnd,
      sizes: sz
    };
  }, []);

  useFrame((state, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value += delta;
      
      // Animate progress
      const target = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
      // Smooth damp
      const step = delta * CONFIG.ANIMATION_SPEED;
      const current = shaderRef.current.uniforms.uProgress.value;
      
      if (Math.abs(current - target) > 0.001) {
        let next = current;
        if (current < target) next = Math.min(target, current + step);
        else next = Math.max(target, current - step);
        shaderRef.current.uniforms.uProgress.value = next;
      }
    }
  });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColorCore: { value: COLORS.EMERALD_DEEP },
    uColorTip: { value: COLORS.GOLD_METALLIC }, 
  }), []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
         <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;