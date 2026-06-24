// ═══════════════════════════════════════════════════════════
// MATH UTILITIES
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

export function lerp(a, b, t) {
  return a + (a - b) * -t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomPointOnSphere(radius) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );
}

export function randomPointInTorus(innerRadius, outerRadius, height) {
  const angle = Math.random() * Math.PI * 2;
  const r = innerRadius + Math.random() * (outerRadius - innerRadius);
  const y = (Math.random() - 0.5) * height;
  return new THREE.Vector3(
    Math.cos(angle) * r,
    y,
    Math.sin(angle) * r
  );
}

export function smoothDamp(current, target, velocityRef, smoothTime, deltaTime) {
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocityRef.value + omega * change) * deltaTime;
  velocityRef.value = (velocityRef.value - omega * temp) * exp;
  return target + (change + temp) * exp;
}

/**
 * Generate a 3-step toon gradient texture
 */
export function generateToonGradient(steps = 4) {
  const canvas = document.createElement('canvas');
  canvas.width = steps;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  for (let i = 0; i < steps; i++) {
    const v = Math.floor((i / (steps - 1)) * 255);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(i, 0, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
