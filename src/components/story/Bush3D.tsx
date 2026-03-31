import React, { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Bush3DProps {
  windPower: number;
  isSpeaking: boolean;
  isActive: boolean;
  isStormy: boolean;
}

export const Bush3D = forwardRef<THREE.Group, Bush3DProps>(({ windPower, isSpeaking, isActive, isStormy }, _ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeGroupRef = useRef<THREE.Group>(null);
  const rightEyeGroupRef = useRef<THREE.Group>(null);
  const blushLeftRef = useRef<THREE.Mesh>(null);
  const blushRightRef = useRef<THREE.Mesh>(null);
  const leftBrowRef = useRef<THREE.Mesh>(null);
  const rightBrowRef = useRef<THREE.Mesh>(null);

  const bushMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#33691E' : '#66BB6A', roughness: 0.8, metalness: 0.05
  }), [isStormy]);
  const bushMidMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#2E7D32' : '#4CAF50', roughness: 0.85
  }), [isStormy]);
  const bushDarkMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#1B5E20' : '#388E3C', roughness: 0.9
  }), [isStormy]);
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFDE7', roughness: 0.2 }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.1, metalness: 0.4 }), []);
  const pupilHighlight = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0.5 }), []);
  const mouthMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#D81B60', roughness: 0.3 }), []);
  const blushMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#F48FB1', transparent: true, opacity: 0.4, side: THREE.DoubleSide
  }), []);
  const browMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.8 }), []);
  // Small flowers/berries on bush
  const flowerMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FFD54F', roughness: 0.4 }), []);
  const flower2Material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#EF9A9A', roughness: 0.4 }), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Bush bends gracefully with wind
    const windStrength = windPower / 100;
    const bendAmount = windStrength * 0.3;
    const sway = Math.sin(t * (1.5 + windStrength * 4)) * bendAmount;
    const sway2 = Math.sin(t * 2.3 + 1) * windStrength * 0.08;
    groupRef.current.rotation.z = sway + sway2;
    // Squash and stretch
    groupRef.current.scale.x = 1 - Math.abs(sway) * 0.4;
    groupRef.current.scale.y = 1 + Math.abs(sway) * 0.15;
    groupRef.current.position.x = 2.2 + Math.sin(t * 0.8) * windStrength * 0.12;
    groupRef.current.position.y = -1.6;

    // Cute lip sync
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        const o = Math.abs(Math.sin(t * 13)) * 0.6 + 0.2;
        const e = Math.abs(Math.cos(t * 9)) * 0.3;
        mouthRef.current.scale.y = 0.6 + o * 1.5;
        mouthRef.current.scale.x = 1.0 + e;
      } else {
        // Sweet gentle smile
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.7, 0.08);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.4, 0.08);
      }
    }

    // Cute blinking
    const blinkCycle = t % 3.5;
    const isBlinking = blinkCycle > 3.3;
    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      const scaleY = isBlinking ? 0.05 : 1;
      leftEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(leftEyeGroupRef.current.scale.y, scaleY, 0.35);
      rightEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(rightEyeGroupRef.current.scale.y, scaleY, 0.35);
    }

    // Humble worried brows during storm
    if (leftBrowRef.current && rightBrowRef.current) {
      const worried = windPower > 50 ? 0.3 : 0;
      const gentle = isActive ? Math.sin(t * 2) * 0.05 : 0;
      leftBrowRef.current.rotation.z = -0.15 - worried + gentle;
      rightBrowRef.current.rotation.z = 0.15 + worried - gentle;
      leftBrowRef.current.position.y = 0.56 - worried * 0.02;
      rightBrowRef.current.position.y = 0.56 - worried * 0.02;
    }

    // Blush intensity
    if (blushLeftRef.current && blushRightRef.current) {
      const blushOpacity = isActive ? 0.7 : 0.35;
      (blushLeftRef.current.material as THREE.MeshStandardMaterial).opacity =
        THREE.MathUtils.lerp((blushLeftRef.current.material as THREE.MeshStandardMaterial).opacity, blushOpacity, 0.04);
      (blushRightRef.current.material as THREE.MeshStandardMaterial).opacity =
        THREE.MathUtils.lerp((blushRightRef.current.material as THREE.MeshStandardMaterial).opacity, blushOpacity, 0.04);
    }
  });

  return (
    <group ref={groupRef} position={[2.2, -1.6, 0]} rotation={[0, -0.3, 0]}>
      {/* Bush body - lush cluster */}
      <mesh position={[0, 0.3, 0]} material={bushMidMaterial}>
        <sphereGeometry args={[0.6, 16, 16]} />
      </mesh>
      <mesh position={[-0.35, 0.2, 0.1]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.4, 12, 12]} />
      </mesh>
      <mesh position={[0.35, 0.2, 0.1]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.4, 12, 12]} />
      </mesh>
      <mesh position={[0, 0.65, 0.08]} material={bushMaterial}>
        <sphereGeometry args={[0.35, 12, 12]} />
      </mesh>
      <mesh position={[-0.25, 0.55, 0.15]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.22, 10, 10]} />
      </mesh>
      <mesh position={[0.25, 0.55, 0.15]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.22, 10, 10]} />
      </mesh>
      {/* Extra volume */}
      <mesh position={[-0.4, 0.4, -0.1]} material={bushMidMaterial}>
        <sphereGeometry args={[0.25, 10, 10]} />
      </mesh>
      <mesh position={[0.4, 0.4, -0.1]} material={bushMidMaterial}>
        <sphereGeometry args={[0.25, 10, 10]} />
      </mesh>
      <mesh position={[0, 0.1, 0.2]} material={bushDarkMaterial}>
        <sphereGeometry args={[0.3, 10, 10]} />
      </mesh>

      {/* Small flowers/berries */}
      <mesh position={[-0.3, 0.65, 0.3]} material={flowerMaterial}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      <mesh position={[0.35, 0.5, 0.35]} material={flower2Material}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>
      <mesh position={[-0.15, 0.75, 0.25]} material={flower2Material}>
        <sphereGeometry args={[0.025, 8, 8]} />
      </mesh>
      <mesh position={[0.2, 0.7, 0.2]} material={flowerMaterial}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>

      {/* ---- FACE (cute & humble) ---- */}
      {/* Left eye - big, round, sparkly */}
      <group ref={leftEyeGroupRef} position={[-0.13, 0.42, 0.53]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        {/* Large pupil looking up at tree */}
        <mesh position={[-0.01, 0.01, 0.055]} material={pupilMaterial}>
          <sphereGeometry args={[0.045, 12, 12]} />
        </mesh>
        {/* Sparkle highlights */}
        <mesh position={[0.02, 0.025, 0.07]} material={pupilHighlight}>
          <sphereGeometry args={[0.015, 6, 6]} />
        </mesh>
        <mesh position={[-0.015, -0.01, 0.075]} material={pupilHighlight}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </mesh>
      </group>

      {/* Right eye */}
      <group ref={rightEyeGroupRef} position={[0.13, 0.42, 0.53]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <mesh position={[-0.01, 0.01, 0.055]} material={pupilMaterial}>
          <sphereGeometry args={[0.045, 12, 12]} />
        </mesh>
        <mesh position={[0.02, 0.025, 0.07]} material={pupilHighlight}>
          <sphereGeometry args={[0.015, 6, 6]} />
        </mesh>
        <mesh position={[-0.015, -0.01, 0.075]} material={pupilHighlight}>
          <sphereGeometry args={[0.008, 6, 6]} />
        </mesh>
      </group>

      {/* Gentle humble eyebrows */}
      <mesh ref={leftBrowRef} position={[-0.13, 0.56, 0.53]} rotation={[0, 0, -0.15]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.018, 0.02]} />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.13, 0.56, 0.53]} rotation={[0, 0, 0.15]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.018, 0.02]} />
      </mesh>

      {/* Mouth - sweet small circle */}
      <mesh ref={mouthRef} position={[0, 0.3, 0.56]} material={mouthMaterial}>
        <sphereGeometry args={[0.04, 12, 12]} />
      </mesh>

      {/* Blush circles - bigger and softer */}
      <mesh ref={blushLeftRef} position={[-0.2, 0.34, 0.52]} material={blushMaterial}>
        <circleGeometry args={[0.05, 16]} />
      </mesh>
      <mesh ref={blushRightRef} position={[0.2, 0.34, 0.52]} material={blushMaterial}>
        <circleGeometry args={[0.05, 16]} />
      </mesh>
    </group>
  );
});

Bush3D.displayName = 'Bush3D';
