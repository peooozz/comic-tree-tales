import React, { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Tree3DProps {
  windPower: number;
  isSpeaking: boolean;
  isActive: boolean;
  snapped: boolean;
  isStormy: boolean;
}

export const Tree3D = forwardRef<THREE.Group, Tree3DProps>(({ windPower, isSpeaking, isActive, snapped, isStormy }, _ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const leftLidRef = useRef<THREE.Mesh>(null);
  const rightLidRef = useRef<THREE.Mesh>(null);

  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4E342E', roughness: 0.95, metalness: 0.05
  }), []);
  const trunkDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3E2723', roughness: 1
  }), []);
  const foliageMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#1B5E20' : '#2E7D32', roughness: 0.75, metalness: 0.05
  }), [isStormy]);
  const foliageLightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#2E7D32' : '#43A047', roughness: 0.7
  }), [isStormy]);
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000' }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8D1C1C', roughness: 0.4 }), []);
  const browMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#1A0E00' }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    const isSnapped = snapped || windPower >= 100;
    const targetRotZ = isSnapped ? 1.4 : (Math.sin(t * (1 + (windPower / 100) * 3)) * (windPower / 100) * 0.12);
    const targetPosX = isSnapped ? -1.2 : (-2.5 + Math.sin(t * 0.5) * (windPower / 100) * 0.08);
    const targetPosY = isSnapped ? -2.0 : -1.2;

    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, isSnapped ? 0.2 : 0.1);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, isSnapped ? 0.2 : 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, isSnapped ? 0.2 : 0.1);

    // Lip sync
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        // Proper lip sync with multiple frequencies for natural jitter
        const speechValue = (Math.sin(t * 15) * 0.4 + Math.sin(t * 7) * 0.3 + 0.5);
        mouthRef.current.scale.y = 0.5 + speechValue * 1.5;
        mouthRef.current.scale.x = 1.3 - speechValue * 0.2;
        mouthRef.current.rotation.z = Math.sin(t * 5) * 0.1; // Slight natural wobble
      } else {
        // Stern, flat thin mouth when idle - as requested
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.12, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.8, 0.1);
        mouthRef.current.rotation.z = THREE.MathUtils.lerp(mouthRef.current.rotation.z, 0, 0.1);
      }
    }

    // Arrogant heavy-lidded glare
    if (leftLidRef.current && rightLidRef.current) {
      const lidClose = isActive ? 0.45 + Math.sin(t * 1.5) * 0.05 : 0.5;
      leftLidRef.current.scale.y = lidClose;
      rightLidRef.current.scale.y = lidClose;
      leftLidRef.current.rotation.z = -0.35; // Severe inward scowl
      rightLidRef.current.rotation.z = 0.35; // Severe inward scowl
    }

    // Stern furrowed eyebrows (V-shape) as in reference image
    if (leftBrowRef.current && rightBrowRef.current) {
      const activeIntensity = isActive ? Math.sin(t * 3) * 0.05 : 0;
      // Angled down towards the center
      leftBrowRef.current.position.y = 0.76 + activeIntensity;
      leftBrowRef.current.rotation.z = -0.25; 
      
      rightBrowRef.current.position.y = 0.76 + activeIntensity;
      rightBrowRef.current.rotation.z = 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[-2.5, -1.2, 0]} rotation={[0, 0.3, 0]}>
      {/* Trunk - thicker, more detailed */}
      <mesh position={[0, 0.5, 0]} material={trunkMaterial}>
        <cylinderGeometry args={[0.18, 0.3, 1.6, 12]} />
      </mesh>
      {/* Roots */}
      <mesh position={[-0.2, -0.15, 0.1]} rotation={[0, 0, -0.4]} material={trunkMaterial}>
        <cylinderGeometry args={[0.06, 0.03, 0.5, 6]} />
      </mesh>
      <mesh position={[0.2, -0.15, -0.05]} rotation={[0, 0, 0.3]} material={trunkMaterial}>
        <cylinderGeometry args={[0.06, 0.03, 0.4, 6]} />
      </mesh>

      {/* Foliage layers - fuller fir tree */}
      <mesh position={[0, 1.5, 0]} material={foliageMaterial}>
        <coneGeometry args={[1.0, 1.0, 12]} />
      </mesh>
      <mesh position={[0, 1.55, 0.05]} material={foliageLightMaterial}>
        <coneGeometry args={[0.85, 0.7, 10]} />
      </mesh>
      <mesh position={[0, 2.0, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.8, 0.9, 12]} />
      </mesh>
      <mesh position={[0, 2.05, 0.03]} material={foliageLightMaterial}>
        <coneGeometry args={[0.65, 0.6, 10]} />
      </mesh>
      <mesh position={[0, 2.45, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.6, 0.8, 12]} />
      </mesh>
      <mesh position={[0, 2.8, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.4, 0.6, 10]} />
      </mesh>
      <mesh position={[0, 3.1, 0]} material={foliageLightMaterial}>
        <coneGeometry args={[0.2, 0.4, 8]} />
      </mesh>

      {/* ---- FACE on Foliage (arrogant) - Pushed out for visibility ---- */}
      <group position={[0, 1.7, 1.1]}>
        {/* Left eye - narrow, condescending, gazing down at bush */}
        <group position={[-0.15, 0, 0]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {!snapped ? (
          <mesh position={[0.045, -0.015, 0.045]} material={pupilMaterial}>
            <sphereGeometry args={[0.035, 10, 10]} />
          </mesh>
        ) : (
          <group position={[0.02, 0, 0.05]}>
            <mesh rotation={[0, 0, Math.PI / 4]} material={pupilMaterial}>
              <boxGeometry args={[0.05, 0.012, 0.01]} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]} material={pupilMaterial}>
              <boxGeometry args={[0.05, 0.012, 0.01]} />
            </mesh>
          </group>
        )}
        {/* Arrogant half-closed lid */}
        <mesh ref={leftLidRef} position={[0, 0.035, 0.03]} material={trunkMaterial}>
          <boxGeometry args={[0.16, 0.06, 0.06]} />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.15, 0, 0]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {!snapped ? (
          <mesh position={[0.045, -0.015, 0.045]} material={pupilMaterial}>
            <sphereGeometry args={[0.035, 10, 10]} />
          </mesh>
        ) : (
          <group position={[-0.02, 0, 0.05]}>
            <mesh rotation={[0, 0, Math.PI / 4]} material={pupilMaterial}>
              <boxGeometry args={[0.05, 0.012, 0.01]} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]} material={pupilMaterial}>
              <boxGeometry args={[0.05, 0.012, 0.01]} />
            </mesh>
          </group>
        )}
        <mesh ref={rightLidRef} position={[0, 0.035, 0.03]} material={trunkMaterial}>
          <boxGeometry args={[0.16, 0.06, 0.06]} />
        </mesh>
      </group>

      {/* Left eyebrow - peaked arrogantly */}
      <mesh ref={leftBrowRef} position={[-0.15, 0.16, 0.02]} rotation={[0, 0, 0.35]} material={browMaterial}>
        <boxGeometry args={[0.2, 0.04, 0.03]} />
      </mesh>
      {/* Right eyebrow - frowned intensely */}
      <mesh ref={rightBrowRef} position={[0.15, 0.1, 0.02]} rotation={[0, 0, -0.1]} material={browMaterial}>
        <boxGeometry args={[0.2, 0.04, 0.03]} />
      </mesh>

      {/* Mouth - stern thin line as primary base */}
      <mesh ref={mouthRef} position={[0.05, -0.15, 0.03]} material={mouthMaterial}>
        <boxGeometry args={[0.16, 0.02, 0.02]} />
      </mesh>
      </group>
    </group>
  );
});

Tree3D.displayName = 'Tree3D';
