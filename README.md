# 3D Interactive Solar System Portfolio

A highly interactive, 3D web-based portfolio built using **Three.js** and **Cannon.js**. Instead of scrolling through a traditional webpage, visitors pilot a spacecraft through a procedurally generated solar system where each planet serves as a unique node for different portfolio sections (Projects, Experience, About Me, etc.).

## 🚀 Features

- **Flyable Spaceship:** Pilot a fully modeled 3D spacecraft with realistic physics, thruster mechanics, and drift.
- **Procedural Solar System:** Features a vast, to-scale solar system with an incredibly dense, moving asteroid belt of jagged, irregular rocks orbiting the sun.
- **Interactive Planets:** Fly to different planets to open up modular content panels showcasing portfolio data.
- **Dynamic Sun Corona:** A procedural, multi-layered sun with pulsing solar flares and counter-rotating rays.
- **Custom UI:** Features an immersive Sci-Fi HUD complete with a minimap radar, telemetry data, and dynamic speed tracking.

## 🛠 Tech Stack

- **Three.js:** For rendering the 3D world, meshes, shaders, and procedural geometry.
- **Cannon.js:** For physics, collisions, and spacecraft hovercraft-style movement.
- **Vite:** For lighting-fast bundling and development.

## 🎮 How to Play

- **W** - Accelerate Forward
- **S** - Reverse / Brake
- **A / D** - Turn Left / Right
- **Mouse Wheel** - Zoom Camera In / Out
- **E** - Interact / Explore a planet when in orbit (displays portfolio info)

## 💻 Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/rishiiicreates/3d-portfolio.git
   ```
2. Install dependencies:
   ```bash
   cd 3d-portfolio
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the localhost URL provided by Vite.

## 🎨 Asset Credits
Textures and models are loaded from the `/public` directory. Make sure to swap out the default `spaceship.fbx` and planet textures with your own custom assets if modifying for personal use.
