import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleData {
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  random: number;
}

export interface OrnamentData {
  id: string;
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  type: 'box' | 'sphere' | 'light';
  color: THREE.Color;
}
