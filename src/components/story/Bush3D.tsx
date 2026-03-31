import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Bush3DProps {
  windPower: number;
  isSpeaking: boolean;
  isActive: boolean;
  isStormy: boolean;
}

export const Bush3D: React.FC<Bush3DProps> = ({ windPower, isSpeaking, isActive, isStormy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const blushLeftRef = useRef<THREE.Mesh>(null);
  const blushRightRef = useRef<THREE.Mesh>(null);

  const bushMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#33691E' : '#4CAF50', roughness: 0.85
  }), [isStormy]);
  const bushDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#1B5E20' : '#388E3C', roughness: 0.9
  }), [isStormy]);
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FAFAFA' }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1A1A1A' }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E91E63' }), []);
  const blushMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F48FB1', transparent: true, opacity: 0.5
  }), []);
  const browMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E7D32' }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Bush bends with wind - flexible!
    const windStrength = windPower / 100;
    const bendAmount = windStrength * 0.25;
    const sway = Math.sin(t * (1.5 + windStrength * 4)) * bendAmount;
    groupRef.current.rotation.z = sway;
    // Squash and stretch with wind
    groupRef.current.scale.x = 1 - Math.abs(sway) * 0.3;
    groupRef.current.scale.y = 1 + Math.abs(sway) * 0.1;
    groupRef.current.position.x = Math.sin(t * 0.8) * windStrength * 0.15;

    // Cute lip sync
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        const mouthOpen = Math.abs(Math.sin(t * 14)) * 0.08 + 0.02;
        mouthRef.current.scale.y = 1 + mouthOpen * 10;
        mouthRef.current.scale.x = 1 + mouthOpen * 3;
      } else {
        // Cute smile
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.8, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.5, 0.1);
      }
    }

    // Cute blinking
    const blinkCycle = t % 4;
    const isBlinking = blinkCycle > 3.8;
    if (leftEyeRef.current && rightEyeRef.current) {
      const scaleY = isBlinking ? 0.1 : 1;
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, scaleY, 0.3);
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, scaleY, 0.3);
    }

    // Blush when speaking
    if (blushLeftRef.current && blushRightRef.current) {
      const blushOpacity = isActive ? 0.6 : 0.3;
      (blushLeftRef.current.material as THREE.MeshStandardMaterial).opacity =
        THREE.MathUtils.lerp((blushLeftRef.current.material as THREE.MeshStandardMaterial).opacity, blushOpacity, 0.05);
      (blushRightRef.current.material as THREE.MeshStandardMaterial).opacity =
        THREE.MathUtils.lerp((blushRightRef.current.material as THREE.MeshStandardMaterial).opacity, blushOpacity, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[1.8, -1.8, 0]}>
      {/* Bush body - cluster of spheres */}
      <mesh position={[0, 0.35, 0]} material={bushMaterial}>
        <sphereGeometry args={[0.55, 12, 12]} />
      </mesh>
      <mesh position={[-0.3, 0.25, 0.1]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.35, 10, 10]} />
      </mesh>
      <mesh position={[0.3, 0.25, 0.1]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.35, 10, 10]} />
      </mesh>
      <mesh position={[0, 0.6, 0.1]} material={bushMaterial}>
        <sphereGeometry args={[0.3, 10, 10]} />
      </mesh>
      <mesh position={[-0.2, 0.55, 0.15]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>
      <mesh position={[0.2, 0.55, 0.15]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.2, 8, 8]} />
      </mesh>

      {/* Face - cute and humble */}
      {/* Left eye - big and round (cute) */}
      <group position={[-0.12, 0.42, 0.5]}>
        <mesh ref={leftEyeRef} material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.07, 12, 12]} />
        </mesh>
        <mesh position={[0.01, -0.01, 0.05]} material={pupilMaterial}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        {/* Cute highlight */}
        <mesh position={[0.02, 0.02, 0.06]} material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.015, 6, 6]} />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.12, 0.42, 0.5]}>
        <mesh ref={rightEyeRef} material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.07, 12, 12]} />
        </mesh>
        <mesh position={[-0.01, -0.01, 0.05]} material={pupilMaterial}>
          <sphereGeometry args={[0.04, 8, 8]} />
        </mesh>
        <mesh position={[-0.02, 0.02, 0.06]} material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.015, 6, 6]} />
        </mesh>
      </group>

      {/* Cute gentle eyebrows */}
      <mesh position={[-0.12, 0.52, 0.5]} rotation={[0, 0, -0.2]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.015, 0.02]} />
      </mesh>
      <mesh position={[0.12, 0.52, 0.5]} rotation={[0, 0, 0.2]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.015, 0.02]} />
      </mesh>

      {/* Mouth - cute small smile */}
      <mesh ref={mouthRef} position={[0, 0.3, 0.52]} material={mouthMaterial}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>

      {/* Blush circles */}
      <mesh ref={blushLeftRef} position={[-0.18, 0.33, 0.48]} material={blushMaterial}>
        <circleGeometry args={[0.04, 12]} />
      </mesh>
      <mesh ref={blushRightRef} position={[0.18, 0.33, 0.48]} material={blushMaterial}>
        <circleGeometry args={[0.04, 12]} />
      </mesh>
    </group>
  );
};
