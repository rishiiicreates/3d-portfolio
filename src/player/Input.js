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
    this.setupMobileControls();
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
        this.state.pitchUp = isDown; // Nose up
        break;
      case 'ArrowDown':
        this.state.pitchDown = isDown; // Nose down
        break;
      case 'ArrowLeft':
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

  setupMobileControls() {
    // Only show if touch is supported
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

    const mobileUI = document.createElement('div');
    mobileUI.id = 'mobile-ui';
    mobileUI.style.cssText = `
      position: fixed; bottom: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none; z-index: 999;
      display: flex; justify-content: space-between; align-items: flex-end;
      padding: 30px; box-sizing: border-box;
    `;
    
    // ─── LEFT JOYSTICK (YAW & PITCH) ───
    const leftJoy = document.createElement('div');
    leftJoy.style.cssText = `
      width: 140px; height: 140px; background: rgba(255,255,255,0.05);
      border-radius: 50%; pointer-events: auto; position: relative;
      border: 2px solid rgba(255,255,255,0.15); touch-action: none;
      backdrop-filter: blur(4px);
    `;
    const leftKnob = document.createElement('div');
    leftKnob.style.cssText = `
      width: 60px; height: 60px; background: rgba(255,255,255,0.3);
      border-radius: 50%; position: absolute; top: 40px; left: 40px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    `;
    leftJoy.appendChild(leftKnob);

    // ─── RIGHT BUTTONS ───
    const rightControls = document.createElement('div');
    rightControls.style.cssText = `
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      pointer-events: auto; touch-action: none;
    `;

    const createBtn = (text, keyBind) => {
      const btn = document.createElement('div');
      btn.innerText = text;
      btn.style.cssText = `
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 12px; color: white; width: 65px; height: 65px;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: bold;
        user-select: none; backdrop-filter: blur(4px); text-align: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      `;
      btn.addEventListener('touchstart', (e) => { 
        e.preventDefault(); 
        this.state[keyBind] = true; 
        btn.style.background = 'rgba(255,255,255,0.4)'; 
      });
      btn.addEventListener('touchend', (e) => { 
        e.preventDefault(); 
        this.state[keyBind] = false; 
        btn.style.background = 'rgba(255,255,255,0.1)'; 
      });
      return btn;
    };

    // Layout: 
    // [ROLL L] [THRUST]
    // [ROLL R] [BRAKE ]
    // [  INTERACT   ]
    rightControls.appendChild(createBtn('ROLL ↺', 'rollLeft'));
    rightControls.appendChild(createBtn('THRUST', 'forward'));
    rightControls.appendChild(createBtn('ROLL ↻', 'rollRight'));
    rightControls.appendChild(createBtn('BRAKE', 'jump'));
    
    const interactBtn = createBtn('INTERACT', 'interact');
    interactBtn.style.gridColumn = '1 / -1';
    interactBtn.style.height = '45px';
    rightControls.appendChild(interactBtn);

    mobileUI.appendChild(leftJoy);
    mobileUI.appendChild(rightControls);
    document.body.appendChild(mobileUI);

    // ─── JOYSTICK LOGIC ───
    let joyCenter = { x: 0, y: 0 };
    let joyActive = false;

    const updateJoystick = (touch) => {
      const dx = touch.clientX - joyCenter.x;
      const dy = touch.clientY - joyCenter.y;
      const distance = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
      const angle = Math.atan2(dy, dx);
      
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      leftKnob.style.transform = `translate(${x}px, ${y}px)`;

      // Threshold to trigger state
      this.state.left = x < -15;
      this.state.right = x > 15;
      
      // Y-axis inverted for flight controls (push up = pitch down)
      this.state.pitchDown = y < -15;
      this.state.pitchUp = y > 15;
    };

    leftJoy.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const rect = leftJoy.getBoundingClientRect();
      joyCenter = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
      joyActive = true;
      updateJoystick(e.touches[0]);
    });

    leftJoy.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!joyActive) return;
      updateJoystick(e.touches[0]);
    });

    leftJoy.addEventListener('touchend', (e) => {
      e.preventDefault();
      joyActive = false;
      leftKnob.style.transform = `translate(0px, 0px)`;
      this.state.left = false;
      this.state.right = false;
      this.state.pitchUp = false;
      this.state.pitchDown = false;
    });
  }
}
