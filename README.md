# Seven Stones 3D (Lagori / Pitthu)

A complete, playable 3D traditional Indian playground sports game built with **React**, **Three.js**, **React Three Fiber**, and procedural physics.

## Quick Start

The development server is already running!
Open your browser and navigate to:
```
http://localhost:5173/
```

To run manually in terminal:
```bash
npm run dev
```

## How to Play

1. **Aim & Throw**: At the start of the round, hold **Left Mouse Button** (or the touch throw button) to charge throwing power along the parabolic trajectory arc and knock over the 7 central stones.
2. **If You Are a Runner**:
   - Run to scattered stones and press **E** (or touch Interact) to pick them up.
   - Carry stones back into the white center circle and press **E** to stack them one by one.
   - Rebuilding all 7 stones awards a **"LAGORI!"** round victory!
   - Avoid getting hit by the ball thrown by seekers!
3. **If You Are a Seeker**:
   - Sprint to the loose ball and press **E** to grab it.
   - Aim at active runners and throw the ball with Left Click.
   - Tagging runners removes their lives; eliminating all runners awards victory to the Seekers!

## Controls

- **WASD / Arrow Keys**: Move
- **Left Shift**: Sprint
- **Space**: Jump
- **Mouse Drag**: Rotate camera and aim
- **Left Mouse Click (Hold & Release)**: Charge and throw ball
- **E Key**: Pick up stone / Place stone / Grab ball
- **Escape**: Pause menu

Mobile touch controls (Virtual Joystick, Throw, and Interact buttons) are automatically supported when playing on touch devices.
