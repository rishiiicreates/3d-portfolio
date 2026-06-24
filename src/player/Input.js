export class Input {
  constructor() {
    this.state = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      pitchUp: false,
      pitchDown: false,
      rollLeft: false,
      rollRight: false,
      jump: false,
      interact: false
    };

    window.addEventListener('keydown', (e) => this.updateState(e, true));
    window.addEventListener('keyup', (e) => this.updateState(e, false));
  }

  updateState(e, isDown) {
    switch(e.code) {
      case 'KeyW':
        this.state.forward = isDown;
        break;
      case 'KeyS':
        this.state.backward = isDown;
        break;
      case 'KeyA':
        this.state.left = isDown;
        break;
      case 'KeyD':
        this.state.right = isDown;
        break;
      case 'ArrowUp':
        this.state.pitchDown = isDown; // Nose down
        break;
      case 'ArrowDown':
        this.state.pitchUp = isDown; // Nose up
        break;
      case 'ArrowLeft':
      case 'KeyQ':
        this.state.rollLeft = isDown;
        break;
      case 'ArrowRight':
        this.state.rollRight = isDown;
        break;
      case 'Space':
        this.state.jump = isDown;
        break;
      case 'KeyE':
        this.state.interact = isDown;
        break;
    }
  }
}
