import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState } from '../types';
import { CONFIG, COLORS } from '../constants';
import { getRandomSpherePoint } from '../utils/geometry';

interface TopStarProps {
  appState: AppState;
}

const TopStar: React.FC<TopStarProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.ExtrudeGeometry>(null);

  const { scatterPos, treePos, shape } = useMemo(() => {
    // Define a 5-pointed star shape
    const starShape = new THREE.Shape();
    const outerRadius = 0.9; 
    const innerRadius = 0.4;
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
      // Offset angle by -PI/2 to point the star upwards
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const sPos = getRandomSpherePoint(CONFIG.SCATTER_RADIUS);
    // Position at the very peak of the tree (Height/2) plus a small offset
    const tPos = new THREE.Vector3(0, (CONFIG.TREE_HEIGHT / 2) + 0.2, 0);

    return { scatterPos: sPos, treePos: tPos, shape: starShape };
  }, []);

  // Center the geometry so it rotates around its center
  useLayoutEffect(() => {
    if (geomRef.current) {
      geomRef.current.center();
    }
  }, []);

  const progressRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. Animation Progress for Position
    const target = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
    const step = delta * CONFIG.ANIMATION_SPEED;
    
    if (progressRef.current < target) {
      progressRef.current = Math.min(target, progressRef.current + step);
    } else if (progressRef.current > target) {
      progressRef.current = Math.max(target, progressRef.current - step);
    }

    const t = progressRef.current;
    // Cubic easeInOut
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    meshRef.current.position.lerpVectors(scatterPos, treePos, ease);
    
    // 2. Continuous Rotation
    meshRef.current.rotation.y -= delta * 0.8;
    
    // 3. Subtle Floating/Pulsing effect when formed
    if (t > 0.8) {
      const pulse = Math.sin(state.clock.elapsedTime * 2);
      meshRef.current.scale.setScalar(1.0 + pulse * 0.05);
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05; // Slight tilt wobble
    } else {
        meshRef.current.scale.setScalar(1.0);
        meshRef.current.rotation.z = 0;
    }
  });

  const extrudeSettings = useMemo(() => ({
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.05,
    bevelSegments: 3
  }), []);

  return (
    <mesh ref={meshRef}>
      <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />
      <meshStandardMaterial
        color={COLORS.GOLD_METALLIC}
        emissive={COLORS.GOLD_METALLIC}
        emissiveIntensity={0.8}
        metalness={1.0}
        roughness={0.15}
      />
    </mesh>
  );
};

export default TopStar;