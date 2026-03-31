import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Tree3DProps {
  windPower: number;
  isSpeaking: boolean;
  isActive: boolean;
  snapped: boolean;
  isStormy: boolean;
}

export const Tree3D: React.FC<Tree3DProps> = ({ windPower, isSpeaking, isActive, snapped, isStormy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);
  const smirkRef = useRef<THREE.Mesh>(null);

  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#5D4037', roughness: 0.9 
  }), []);
  const foliageMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: isStormy ? '#1B5E20' : '#2E7D32', roughness: 0.8 
  }), [isStormy]);
  const faceMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#3E2723', roughness: 0.5 
  }), []);
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FAFAFA' }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1A1A1A' }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#B71C1C' }), []);
  const browMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3E2723' }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (snapped) {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.6, 0.05);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0.5, 0.05);
    } else {
      const windStrength = windPower / 100;
      const sway = Math.sin(t * (1 + windStrength * 3)) * windStrength * 0.15;
      groupRef.current.rotation.z = sway;
      groupRef.current.position.x = Math.sin(t * 0.5) * windStrength * 0.1;
    }

    // Lip sync - mouth opens and closes
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        const mouthOpen = Math.abs(Math.sin(t * 12)) * 0.12 + 0.02;
        mouthRef.current.scale.y = 1 + mouthOpen * 8;
        mouthRef.current.scale.x = 1 - mouthOpen * 2;
      } else {
        // Arrogant smirk
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.6, 0.1);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.3, 0.1);
      }
    }

    // Arrogant eyebrow raise
    if (leftBrowRef.current && rightBrowRef.current) {
      const browRaise = isActive ? Math.sin(t * 2) * 0.03 : 0;
      leftBrowRef.current.position.y = 1.95 + browRaise;
      leftBrowRef.current.rotation.z = 0.3; // Arrogant raised brow
      rightBrowRef.current.position.y = 1.85 + browRaise;
      rightBrowRef.current.rotation.z = -0.15;
    }
  });

  return (
    <group ref={groupRef} position={[-1.5, -1.2, 0]}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]} material={trunkMaterial}>
        <cylinderGeometry args={[0.15, 0.25, 1.8, 8]} />
      </mesh>

      {/* Foliage layers - conical fir tree shape */}
      <mesh position={[0, 1.8, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.9, 1.0, 8]} />
      </mesh>
      <mesh position={[0, 2.3, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.7, 0.9, 8]} />
      </mesh>
      <mesh position={[0, 2.7, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.5, 0.7, 8]} />
      </mesh>
      <mesh position={[0, 3.05, 0]} material={foliageMaterial}>
        <coneGeometry args={[0.3, 0.5, 8]} />
      </mesh>

      {/* Face on trunk - arrogant expression */}
      {/* Left eye */}
      <group position={[-0.06, 1.3, 0.18]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.06, 12, 12]} />
        </mesh>
        <mesh position={[0.01, 0.01, 0.04]} material={pupilMaterial}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>
        {/* Arrogant half-lid */}
        <mesh position={[0, 0.03, 0.02]} material={browMaterial}>
          <boxGeometry args={[0.13, 0.03, 0.04]} />
        </mesh>
      </group>

      {/* Right eye */}
      <group position={[0.06, 1.3, 0.18]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.06, 12, 12]} />
        </mesh>
        <mesh position={[-0.01, 0.01, 0.04]} material={pupilMaterial}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>
        <mesh position={[0, 0.03, 0.02]} material={browMaterial}>
          <boxGeometry args={[0.13, 0.03, 0.04]} />
        </mesh>
      </group>

      {/* Left eyebrow - raised arrogantly */}
      <mesh ref={leftBrowRef} position={[-0.06, 1.95, 0.2]} rotation={[0, 0, 0.3]} material={browMaterial}>
        <boxGeometry args={[0.14, 0.025, 0.02]} />
      </mesh>
      {/* Right eyebrow */}
      <mesh ref={rightBrowRef} position={[0.06, 1.85, 0.2]} rotation={[0, 0, -0.15]} material={browMaterial}>
        <boxGeometry args={[0.14, 0.025, 0.02]} />
      </mesh>

      {/* Mouth - smirk */}
      <mesh ref={mouthRef} position={[0.02, 1.15, 0.2]} material={mouthMaterial}>
        <boxGeometry args={[0.08, 0.03, 0.02]} />
      </mesh>

      {/* Nose - little bump */}
      <mesh position={[0, 1.22, 0.22]} material={faceMaterial}>
        <sphereGeometry args={[0.025, 8, 8]} />
      </mesh>
    </group>
  );
};
