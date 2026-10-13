import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';

interface ThirdPersonCameraProps {
  targetPos: [number, number, number];
  targetRotation: number;
  isAiming?: boolean;
  sensitivity?: number;
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  targetPos,
  targetRotation,
  isAiming = false,
  sensitivity = 1.0,
}) => {
  const { camera, gl } = useThree();
  const currentCamPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 4, targetPos[2] + 7));
  const currentLookAt = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 1.4, targetPos[2]));

  const cameraAngles = useRef({
    yaw: 0,
    pitch: 0.24, // slight downward look angle
    distance: 6.8,
  });

  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      // Allow drag rotation with left or right mouse button
      isDragging.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        cameraAngles.current.yaw -= e.movementX * 0.0028 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.15,
          Math.min(1.0, cameraAngles.current.pitch + e.movementY * 0.0028 * sensitivity)
        );
      } else if (isDragging.current) {
        const dx = e.clientX - prevMousePos.current.x;
        const dy = e.clientY - prevMousePos.current.y;
        prevMousePos.current = { x: e.clientX, y: e.clientY };

        cameraAngles.current.yaw -= dx * 0.004 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.15,
          Math.min(1.0, cameraAngles.current.pitch + dy * 0.004 * sensitivity)
        );
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onWheel = (e: WheelEvent) => {
      cameraAngles.current.distance = Math.max(
        3.2,
        Math.min(11.0, cameraAngles.current.distance + e.deltaY * 0.005)
      );
    };

    // Mobile touch controls for camera swipe
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth * 0.35) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0].clientX > window.innerWidth * 0.35) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        cameraAngles.current.yaw -= dx * 0.005 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.15,
          Math.min(1.0, cameraAngles.current.pitch + dy * 0.005 * sensitivity)
        );
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [gl, sensitivity]);

  useFrame((_, delta) => {
    // When aiming, camera pulls in closer for over-the-shoulder perspective
    const targetDist = isAiming ? 4.0 : cameraAngles.current.distance;
    const pitch = cameraAngles.current.pitch;
    const yaw = cameraAngles.current.yaw;

    // Synchronize camera angles with game store without triggering React re-renders
    const state = useGameStore.getState();
    if (Math.abs(state.cameraAngles.yaw - yaw) > 0.01 || Math.abs(state.cameraAngles.pitch - pitch) > 0.01) {
      state.setCameraAngles(yaw, pitch);
    }

    // Camera offset relative to player
    const offsetX = Math.sin(yaw) * Math.cos(pitch) * targetDist;
    const offsetY = Math.sin(pitch) * targetDist + (isAiming ? 1.5 : 1.35);
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * targetDist;

    // Desired camera position
    const desiredCamPos = new THREE.Vector3(
      targetPos[0] + offsetX,
      Math.max(0.5, targetPos[1] + offsetY),
      targetPos[2] + offsetZ
    );

    const desiredLookAt = new THREE.Vector3(
      targetPos[0],
      targetPos[1] + (isAiming ? 1.5 : 1.25),
      targetPos[2]
    );

    // Smooth lerp camera avoiding jitter
    const lerpFactor = Math.min(1, delta * 9);
    currentCamPos.current.lerp(desiredCamPos, lerpFactor);
    currentLookAt.current.lerp(desiredLookAt, lerpFactor);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
