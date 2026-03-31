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
  const eyeWhiteMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), []);
  const pupilMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000' }), []);
  const pupilHighlight = useMemo(() => new THREE.MeshBasicMaterial({ color: '#FFFFFF' }), []);
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

    // Proper cute lip sync with jitter
    if (mouthRef.current) {
      if (isSpeaking && isActive) {
        const speechValue = (Math.sin(t * 16) * 0.35 + Math.sin(t * 9) * 0.25 + 0.4);
        mouthRef.current.scale.y = 0.8 + speechValue * 1.6;
        mouthRef.current.scale.x = 1.1 - speechValue * 0.3;
        mouthRef.current.rotation.x = Math.PI; // Keep the U shape upright when talking
      } else {
        // Sweet gentle humble smile
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.8, 0.08);
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 1.2, 0.08);
        mouthRef.current.rotation.x = Math.PI; // Inverted semi-circle creates a 'U' smile
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

      {/* Left eye - massive, round, very sparkly - pushed forward for visibility */}
      <group ref={leftEyeGroupRef} position={[-0.14, 0.42, 1.0]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.085, 16, 16]} />
        </mesh>
        {/* Large pupil - looking up and left at Tree */}
        <mesh position={[-0.015, 0.025, 0.055]} material={pupilMaterial} scale={[1, 1.1, 1]}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        {/* Main large sparkle */}
        <mesh position={[0.005, 0.045, 0.09]} material={pupilHighlight}>
          <sphereGeometry args={[0.02, 12, 12]} />
        </mesh>
        {/* Inner small sparkles */}
        <mesh position={[-0.03, -0.005, 0.095]} material={pupilHighlight}>
          <sphereGeometry args={[0.01, 8, 8]} />
        </mesh>
        <mesh position={[0.02, 0.0, 0.09]} material={pupilHighlight}>
          <sphereGeometry args={[0.006, 6, 6]} />
        </mesh>
      </group>

      {/* Right eye - pushed forward */}
      <group ref={rightEyeGroupRef} position={[0.14, 0.42, 1.0]}>
        <mesh material={eyeWhiteMaterial}>
          <sphereGeometry args={[0.085, 16, 16]} />
        </mesh>
        {/* Pupil looking up and left at Tree */}
        <mesh position={[-0.015, 0.025, 0.055]} material={pupilMaterial} scale={[1, 1.1, 1]}>
          <sphereGeometry args={[0.055, 12, 12]} />
        </mesh>
        <mesh position={[0.005, 0.045, 0.09]} material={pupilHighlight}>
          <sphereGeometry args={[0.02, 12, 12]} />
        </mesh>
        <mesh position={[-0.03, -0.005, 0.095]} material={pupilHighlight}>
          <sphereGeometry args={[0.01, 8, 8]} />
        </mesh>
        <mesh position={[0.02, 0.0, 0.09]} material={pupilHighlight}>
          <sphereGeometry args={[0.006, 6, 6]} />
        </mesh>
      </group>

      {/* Gentle humble eyebrows - pushed forward */}
      <mesh ref={leftBrowRef} position={[-0.13, 0.56, 1.0]} rotation={[0, 0, -0.15]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.018, 0.02]} />
      </mesh>
      <mesh ref={rightBrowRef} position={[0.13, 0.56, 1.0]} rotation={[0, 0, 0.15]} material={browMaterial}>
        <boxGeometry args={[0.1, 0.018, 0.02]} />
      </mesh>

      {/* Mouth - sweet small cute torus smile - pushed forward */}
      <mesh ref={mouthRef} position={[0, 0.28, 1.03]} material={mouthMaterial} rotation={[Math.PI, 0, 0]}>
        <torusGeometry args={[0.035, 0.015, 16, 24, Math.PI]} />
      </mesh>

      {/* Blush circles - pushed forward */}
      <mesh ref={blushLeftRef} position={[-0.2, 0.34, 0.99]} material={blushMaterial}>
        <circleGeometry args={[0.05, 16]} />
      </mesh>
      <mesh ref={blushRightRef} position={[0.2, 0.34, 0.99]} material={blushMaterial}>
        <circleGeometry args={[0.05, 16]} />
      </mesh>
    </group>
  );
});

Bush3D.displayName = 'Bush3D';
