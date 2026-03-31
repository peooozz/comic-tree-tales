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
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDE7', roughness: 0.3 }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.2, metalness: 0.3 }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8D1C1C', roughness: 0.4 }), []);
  const browMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E1A0E', roughness: 0.8 }), []);
  const noseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5D4037', roughness: 0.6 }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (snapped) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.7, 0.04);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -1.8, 0.04);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -1.8, 0.03);
    } else {
      const windStrength = windPower / 100;
      const sway = Math.sin(t * (1 + windStrength * 3)) * windStrength * 0.12;
      const sway2 = Math.sin(t * 1.7 + 0.5) * windStrength * 0.04;
      groupRef.current.rotation.z = sway + sway2;
      groupRef.current.position.x = -2.5 + Math.sin(t * 0.5) * windStrength * 0.08;
      groupRef.current.position.y = -1.2;
    }

    // Lip sync
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        const vowel = Math.sin(t * 10) * 0.5 + 0.5;
        const consonant = Math.sin(t * 18) * 0.3;
        mouthRef.current.scale.y = 0.5 + vowel * 1.8 + Math.abs(consonant);
        mouthRef.current.scale.x = 1.2 - vowel * 0.3;
      } else {
        // Arrogant smirk - asymmetric
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.5, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.6, 0.1);
      }
    }

    // Arrogant half-closed lids
    if (leftLidRef.current && rightLidRef.current) {
      const lidClose = isActive ? 0.35 + Math.sin(t * 1.5) * 0.05 : 0.4;
      leftLidRef.current.scale.y = lidClose;
      rightLidRef.current.scale.y = lidClose;
    }

    // Eyebrow animation
    if (leftBrowRef.current && rightBrowRef.current) {
      const browRaise = isActive ? Math.sin(t * 2) * 0.04 : 0;
      leftBrowRef.current.position.y = 1.48 + browRaise + 0.05;
      leftBrowRef.current.rotation.z = 0.35;
      rightBrowRef.current.position.y = 1.42 + browRaise;
      rightBrowRef.current.rotation.z = -0.1;
    }
  });

  return (
    <group ref={groupRef} position={[-2.5, -1.2, 0]} rotation={[0, 0.3, 0]}>
      {/* Trunk - thicker, more detailed */}
      <mesh position={[0, 0.5, 0]} material={trunkMaterial}>
        <cylinderGeometry args={[0.18, 0.3, 1.6, 12]} />
      </mesh>
      {/* Trunk bark detail lines */}
      <mesh position={[0.12, 0.6, 0.12]} material={trunkDarkMaterial}>
        <boxGeometry args={[0.02, 1.2, 0.02]} />
      </mesh>
      <mesh position={[-0.1, 0.5, 0.14]} material={trunkDarkMaterial}>
        <boxGeometry args={[0.02, 0.8, 0.02]} />
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

      {/* ---- FACE on trunk (arrogant) ---- */}
      {/* Left eye - narrow, condescending */}
      <group position={[-0.07, 1.32, 0.2]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        {/* Pupil looking down/right (looking down at bush) */}
        <mesh position={[0.02, -0.015, 0.045]} material={pupilMaterial}>
          <sphereGeometry args={[0.035, 10, 10]} />
        </mesh>
        {/* Arrogant half-closed lid */}
        <mesh ref={leftLidRef} position={[0, 0.035, 0.03]} material={trunkMaterial}>
          <boxGeometry args={[0.15, 0.05, 0.06]} />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.07, 1.32, 0.2]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.065, 16, 16]} />
        </mesh>
        <mesh position={[0.02, -0.015, 0.045]} material={pupilMaterial}>
          <sphereGeometry args={[0.035, 10, 10]} />
        </mesh>
        <mesh ref={rightLidRef} position={[0, 0.035, 0.03]} material={trunkMaterial}>
          <boxGeometry args={[0.15, 0.05, 0.06]} />
        </mesh>
      </group>

      {/* Left eyebrow - raised arrogantly */}
      <mesh ref={leftBrowRef} position={[-0.07, 1.48, 0.22]} rotation={[0, 0, 0.35]} material={browMaterial}>
        <boxGeometry args={[0.16, 0.03, 0.02]} />
      </mesh>
      {/* Right eyebrow - lower */}
      <mesh ref={rightBrowRef} position={[0.07, 1.42, 0.22]} rotation={[0, 0, -0.1]} material={browMaterial}>
        <boxGeometry args={[0.16, 0.03, 0.02]} />
      </mesh>

      {/* Nose - pointy and proud */}
      <mesh position={[0, 1.24, 0.26]} rotation={[0.3, 0, 0]} material={noseMaterial}>
        <coneGeometry args={[0.025, 0.06, 6]} />
      </mesh>

      {/* Mouth - asymmetric smirk */}
      <mesh ref={mouthRef} position={[0.02, 1.15, 0.22]} material={mouthMaterial}>
        <boxGeometry args={[0.1, 0.025, 0.02]} />
      </mesh>
      {/* Smirk corner upturn */}
      <mesh position={[0.08, 1.155, 0.21]} rotation={[0, 0, 0.4]} material={mouthMaterial}>
        <boxGeometry args={[0.03, 0.015, 0.015]} />
      </mesh>
    </group>
  );
});

Tree3D.displayName = 'Tree3D';
