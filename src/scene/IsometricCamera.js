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

  update(delta, spacecraft) {
    if (!spacecraft || !spacecraft.mesh) return;

    const targetPosition = spacecraft.getPosition();

    // Reset panning drag slowly if ship moves
    const shipMoved = targetPosition.distanceToSquared(this.lastTargetPos) > 0.05;
    if (shipMoved && !this.isDragging) {
      this.dragOffset.lerp(new THREE.Vector3(), delta * 3);
    }
    this.lastTargetPos.copy(targetPosition);

    // Get the backward vector from the spacecraft's rotation
    // We want the camera to sit behind and above the ship.
    const backVector = new THREE.Vector3(0, 0, 1); // Local backward
    backVector.applyQuaternion(spacecraft.mesh.quaternion); 
    
    // Scale it to our desired follow distance
    const followDistance = 40 * this.zoomLevel;
    backVector.multiplyScalar(followDistance);
    
    // Also add some height relative to the ship's local 'up'
    const upVector = new THREE.Vector3(0, 1, 0);
    upVector.applyQuaternion(spacecraft.mesh.quaternion);
    const followHeight = 15 * this.zoomLevel;
    upVector.multiplyScalar(followHeight);

    // The desired camera position is behind and above the ship
    const idealOffset = new THREE.Vector3().addVectors(backVector, upVector);
    const desiredPos = new THREE.Vector3().copy(targetPosition).add(idealOffset).add(this.dragOffset);

    // Snap the look-at target directly to the ship so it never flies off-screen
    this.target.copy(targetPosition).add(this.dragOffset);
    
    // Look slightly ahead of the ship
    const forwardVector = new THREE.Vector3(0, 0, -1);
    forwardVector.applyQuaternion(spacecraft.mesh.quaternion).multiplyScalar(20);
    const lookAtPos = new THREE.Vector3().copy(this.target).add(forwardVector);

    // Lerp the camera position quickly for a tight chase feel
    this.camera.position.lerp(desiredPos, delta * 15);
    
    // Always look at the ship (or slightly ahead)
    this.camera.lookAt(lookAtPos);
  }
}
