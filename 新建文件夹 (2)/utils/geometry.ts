import * as THREE from 'three';
import { CONFIG } from '../constants';

// Helper to get a random point in a sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Helper to get a point on a cone surface (The Christmas Tree)
export const getTreePoint = (height: number, radiusBottom: number): THREE.Vector3 => {
  const y = Math.random() * height; // 0 to height
  const percentUp = y / height;
  
  // Exponential taper looks more natural/voluminous than linear
  const taper = Math.pow(1 - percentUp, 0.9);
  const rAtHeight = radiusBottom * taper;
  
  const theta = Math.random() * Math.PI * 2;
  
  // Bias distribution towards the outer surface (branches) 
  // using power < 0.5 pushes values towards 1.0
  const r = rAtHeight * Math.pow(Math.random(), 0.4);
  
  // Shift y down so tree is centered vertically roughly
  return new THREE.Vector3(
    r * Math.cos(theta),
    y - height / 2,
    r * Math.sin(theta)
  );
};