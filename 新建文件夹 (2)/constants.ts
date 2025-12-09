import * as THREE from 'three';

export const COLORS = {
  EMERALD_DEEP: new THREE.Color('#00241B'),
  EMERALD_LIGHT: new THREE.Color('#004D3A'),
  // Increased saturation ~5% for golds
  GOLD_METALLIC: new THREE.Color('#DBB42C'), 
  GOLD_ROSE: new THREE.Color('#EAC076'),
  WHITE_WARM: new THREE.Color('#FFFDD0'),
  RED_VELVET: new THREE.Color('#5e0e0e'),
  RED_BRIGHT: new THREE.Color('#C41E3A'), // Christmas Red
  GREEN_RICH: new THREE.Color('#1A5236'), // Forest Green
};

export const CONFIG = {
  FOLIAGE_COUNT: 15000, // Kept high density from previous turn
  ORNAMENT_COUNT: 900,  // Kept high density from previous turn
  TREE_HEIGHT: 15,
  TREE_RADIUS_BOTTOM: 6.5,
  SCATTER_RADIUS: 25,
  ANIMATION_SPEED: 2.0,
};