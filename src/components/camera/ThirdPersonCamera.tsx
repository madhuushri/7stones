import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

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
    pitch: 0.28, // slight downward look angle
    distance: 6.5,
  });

  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      // Right click or middle click or left click drag
      isDragging.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Rotate camera either if dragging or in pointer lock
      if (document.pointerLockElement === canvas) {
        cameraAngles.current.yaw -= e.movementX * 0.003 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.1,
          Math.min(1.2, cameraAngles.current.pitch + e.movementY * 0.003 * sensitivity)
        );
      } else if (isDragging.current) {
        const dx = e.clientX - prevMousePos.current.x;
        const dy = e.clientY - prevMousePos.current.y;
        prevMousePos.current = { x: e.clientX, y: e.clientY };

        cameraAngles.current.yaw -= dx * 0.005 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.1,
          Math.min(1.2, cameraAngles.current.pitch + dy * 0.005 * sensitivity)
        );
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      cameraAngles.current.distance = Math.max(
        3.0,
        Math.min(12.0, cameraAngles.current.distance + e.deltaY * 0.005)
      );
    };

    // Touch controls for mobile camera rotation
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        cameraAngles.current.yaw -= dx * 0.006 * sensitivity;
        cameraAngles.current.pitch = Math.max(
          -0.1,
          Math.min(1.2, cameraAngles.current.pitch + dy * 0.006 * sensitivity)
        );
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, [gl, sensitivity]);

  useFrame((_, delta) => {
    // When aiming, camera pulls in tighter over the shoulder
    const targetDist = isAiming ? 3.8 : cameraAngles.current.distance;
    const pitch = cameraAngles.current.pitch;
    const yaw = cameraAngles.current.yaw;

    // Camera offset relative to player
    const offsetX = Math.sin(yaw) * Math.cos(pitch) * targetDist;
    const offsetY = Math.sin(pitch) * targetDist + (isAiming ? 1.6 : 1.4);
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * targetDist;

    // Desired camera position
    const desiredCamPos = new THREE.Vector3(
      targetPos[0] + offsetX,
      Math.max(0.6, targetPos[1] + offsetY),
      targetPos[2] + offsetZ
    );

    const desiredLookAt = new THREE.Vector3(
      targetPos[0],
      targetPos[1] + (isAiming ? 1.6 : 1.3),
      targetPos[2]
    );

    // Smooth lerp camera
    const lerpFactor = Math.min(1, delta * 8);
    currentCamPos.current.lerp(desiredCamPos, lerpFactor);
    currentLookAt.current.lerp(desiredLookAt, lerpFactor);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};
