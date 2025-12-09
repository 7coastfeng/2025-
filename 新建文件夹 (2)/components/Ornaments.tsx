import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AppState, OrnamentData } from '../types';
import { CONFIG, COLORS } from '../constants';
import { getRandomSpherePoint, getTreePoint } from '../utils/geometry';

interface OrnamentsProps {
  appState: AppState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState }) => {
  const meshBoxRef = useRef<THREE.InstancedMesh>(null);
  const meshSphereRef = useRef<THREE.InstancedMesh>(null);
  const meshLightRef = useRef<THREE.InstancedMesh>(null);

  // Generate data once
  const { boxes, spheres, lights } = useMemo(() => {
    const _boxes: OrnamentData[] = [];
    const _spheres: OrnamentData[] = [];
    const _lights: OrnamentData[] = [];

    const total = CONFIG.ORNAMENT_COUNT;

    for (let i = 0; i < total; i++) {
      const r = Math.random();
      let type: 'box' | 'sphere' | 'light';
      let collection = _lights;
      
      if (r < 0.15) { type = 'box'; collection = _boxes; }
      else if (r < 0.50) { type = 'sphere'; collection = _spheres; } 
      else { type = 'light'; collection = _lights; }

      const treePos = getTreePoint(CONFIG.TREE_HEIGHT, CONFIG.TREE_RADIUS_BOTTOM);
      // Push ornaments slightly outside the foliage for visibility
      treePos.x *= 1.05;
      treePos.z *= 1.05;
      
      const scatterPos = getRandomSpherePoint(CONFIG.SCATTER_RADIUS);
      
      let color = COLORS.GOLD_METALLIC;

      if (type === 'box') {
        const cR = Math.random();
        // Reduced Red probability (was < 0.75, now < 0.55 for the red range)
        if (cR < 0.45) color = COLORS.GOLD_ROSE;
        else if (cR < 0.55) color = COLORS.RED_VELVET; 
        else color = COLORS.GREEN_RICH;
      } else if (type === 'sphere') {
        const cR = Math.random();
        // Reduced Red probability (was < 0.75, now < 0.55 for the red range)
        if (cR < 0.45) color = COLORS.GOLD_METALLIC;
        else if (cR < 0.55) color = COLORS.RED_BRIGHT;
        else color = COLORS.GREEN_RICH;
      } else {
        // Lights
         color = Math.random() > 0.8 ? COLORS.GOLD_METALLIC : COLORS.WHITE_WARM;
      }

      collection.push({
        id: `ornament-${i}`,
        type,
        treePos,
        scatterPos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.5 + 0.3,
        color,
      });
    }
    return { boxes: _boxes, spheres: _spheres, lights: _lights };
  }, []);

  // Shared dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const progressRef = useRef(0);

  // Apply instance colors once on mount
  useLayoutEffect(() => {
    if (meshBoxRef.current) {
      boxes.forEach((data, i) => meshBoxRef.current!.setColorAt(i, data.color));
      meshBoxRef.current.instanceColor!.needsUpdate = true;
    }
    if (meshSphereRef.current) {
      spheres.forEach((data, i) => meshSphereRef.current!.setColorAt(i, data.color));
      meshSphereRef.current.instanceColor!.needsUpdate = true;
    }
    if (meshLightRef.current) {
      lights.forEach((data, i) => meshLightRef.current!.setColorAt(i, data.color));
      meshLightRef.current.instanceColor!.needsUpdate = true;
    }
  }, [boxes, spheres, lights]);

  useFrame((state, delta) => {
    // 1. Update Progress
    const target = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
    // Cubic approach roughly
    const step = delta * CONFIG.ANIMATION_SPEED;
    if (progressRef.current < target) {
      progressRef.current = Math.min(target, progressRef.current + step);
    } else if (progressRef.current > target) {
      progressRef.current = Math.max(target, progressRef.current - step);
    }

    const t = progressRef.current;
    // Simple ease
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // 2. Update Boxes
    if (meshBoxRef.current) {
      boxes.forEach((data, i) => {
        // Interpolate position
        dummy.position.lerpVectors(data.scatterPos, data.treePos, ease);
        
        // Floating rotation when scattered
        const floatRot = (1 - ease) * state.clock.elapsedTime * 0.5;
        dummy.rotation.set(
          data.rotation.x + floatRot, 
          data.rotation.y + floatRot, 
          data.rotation.z
        );
        
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        meshBoxRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshBoxRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Update Spheres
    if (meshSphereRef.current) {
      spheres.forEach((data, i) => {
         dummy.position.lerpVectors(data.scatterPos, data.treePos, ease);
         // Spheres rotate slower
         dummy.rotation.x = data.rotation.x + state.clock.elapsedTime * 0.2 * (1 - ease);
         dummy.rotation.y = data.rotation.y + state.clock.elapsedTime * 0.3 * (1 - ease);
         dummy.scale.setScalar(data.scale);
         dummy.updateMatrix();
         meshSphereRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshSphereRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Update Lights
    if (meshLightRef.current) {
       lights.forEach((data, i) => {
         dummy.position.lerpVectors(data.scatterPos, data.treePos, ease);
         // Lights pulse in scale
         const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.2;
         dummy.scale.setScalar(data.scale * 0.3 * pulse); // Lights are small
         dummy.updateMatrix();
         meshLightRef.current!.setMatrixAt(i, dummy.matrix);
       });
       meshLightRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Boxes - Use white color to allow instance colors to tint correctly */}
      <instancedMesh ref={meshBoxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="white"
          metalness={0.6} 
          roughness={0.3} 
        />
      </instancedMesh>

      {/* Spheres - Use white color for variety */}
      <instancedMesh ref={meshSphereRef} args={[undefined, undefined, spheres.length]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color="white"
          metalness={0.9} 
          roughness={0.1} 
          emissive="white"
          emissiveIntensity={0.1}
        />
      </instancedMesh>

      {/* Lights - Emissive White/Yellow */}
      <instancedMesh ref={meshLightRef} args={[undefined, undefined, lights.length]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="white"
          emissive="white"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;