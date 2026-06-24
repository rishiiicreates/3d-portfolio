import * as THREE from 'three';

export class IsometricCamera {
  constructor(renderer) {
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500000);
    
    // Isometric-ish offset
    this.baseOffset = new THREE.Vector3(30, 40, 30);
    this.offset = this.baseOffset.clone();
    this.zoomLevel = 1;

    this.target = new THREE.Vector3();
    
    this.camera.position.copy(this.offset);
    this.camera.lookAt(this.target);

    // Mouse Zoom
    window.addEventListener('wheel', (e) => {
      this.zoomLevel += e.deltaY * 0.002;
      this.zoomLevel = Math.max(0.3, Math.min(this.zoomLevel, 20)); // Zoom out massively if needed
      this.offset.copy(this.baseOffset).multiplyScalar(this.zoomLevel);
    }, { passive: true });

    // Mouse Panning State
    this.dragOffset = new THREE.Vector3();
    this.isDragging = false;
    this.previousMouse = { x: 0, y: 0 };
    this.lastTargetPos = new THREE.Vector3();

    // Event Listeners for dragging the space
    window.addEventListener('mousedown', (e) => {
      if (e.target.tagName !== 'CANVAS') return; // Don't block UI clicks
      this.isDragging = true;
      this.previousMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMouse.x;
        const deltaY = e.clientY - this.previousMouse.y;
        
        const panSpeed = 0.15;
        // Map screen X/Y to isometric X/Z floor plane
        this.dragOffset.x -= (deltaX + deltaY) * panSpeed;
        this.dragOffset.z += (deltaX - deltaY) * panSpeed;
        
        this.previousMouse = { x: e.clientX, y: e.clientY };
      }
    });

    // Resize handling
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  update(delta, targetPosition) {
    // If the ship drives, smoothly pull the camera back to it!
    const shipMoved = targetPosition.distanceToSquared(this.lastTargetPos) > 0.05;
    if (shipMoved && !this.isDragging) {
      this.dragOffset.lerp(new THREE.Vector3(), delta * 3);
    }
    this.lastTargetPos.copy(targetPosition);

    // Combine ship position + drag offset
    const finalTarget = new THREE.Vector3().copy(targetPosition).add(this.dragOffset);

    // Smoothly follow the target
    this.target.lerp(finalTarget, delta * 5);
    
    const desiredPos = this.target.clone().add(this.offset);
    this.camera.position.lerp(desiredPos, delta * 5);
    this.camera.lookAt(this.target);
  }
}
