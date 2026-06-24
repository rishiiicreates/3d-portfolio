export class Input {
  constructor() {
    this.state = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      interact: false
    };

    window.addEventListener('keydown', (e) => this.updateState(e, true));
    window.addEventListener('keyup', (e) => this.updateState(e, false));
  }

  updateState(e, isDown) {
    switch(e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.state.forward = isDown;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.state.backward = isDown;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.state.left = isDown;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.state.right = isDown;
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
