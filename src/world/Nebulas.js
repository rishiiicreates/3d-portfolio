import * as THREE from 'three';

export class Nebulas {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    
    this.uniforms = {
      time: { value: 0 }
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      varying vec2 vUv;

      // Simplex 2D noise
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 p = vUv * 3.0;
        float noise = snoise(p + time * 0.02) * 0.5 + 0.5;
        float noise2 = snoise(p * 2.0 - time * 0.03) * 0.5 + 0.5;
        float combined = noise * noise2;
        
        // Soft edge gradient
        float dist = distance(vUv, vec2(0.5));
        float alpha = smoothstep(0.5, 0.2, dist) * combined * 0.8;
        
        vec3 color1 = vec3(0.5, 0.1, 0.8); // Purple
        vec3 color2 = vec3(0.1, 0.5, 0.9); // Blue
        vec3 color3 = vec3(0.8, 0.2, 0.5); // Pink
        
        vec3 finalColor = mix(color1, color2, noise);
        finalColor = mix(finalColor, color3, noise2);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(80000, 80000);
    
    // Create a few nebula planes far away
    for (let i = 0; i < 4; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      
      const radius = 50000 + Math.random() * 20000;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
      mesh.position.z = radius * Math.cos(phi);
      
      mesh.lookAt(0, 0, 0);
      
      this.group.add(mesh);
    }
  }

  update(delta) {
    this.uniforms.time.value += delta;
  }
}
