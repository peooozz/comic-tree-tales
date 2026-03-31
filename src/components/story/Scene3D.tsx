import React, { useMemo, useRef, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useStory } from '../../store/StoryContext';
import { Tree3D } from './Tree3D';
import { Bush3D } from './Bush3D';
import * as THREE from 'three';

const Ground = forwardRef<THREE.Mesh, { isStormy: boolean }>(({ isStormy }, _ref) => {
  const grassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#2E7D32' : '#66BB6A', roughness: 0.95
  }), [isStormy]);
  const dirtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#5D4037', roughness: 1
  }), []);

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} material={grassMaterial}>
        <planeGeometry args={[25, 25]} />
      </mesh>
      {/* Dirt path between them */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.18, 0.5]} material={dirtMaterial}>
        <planeGeometry args={[6, 1.5]} />
      </mesh>
      {/* Small grass tufts */}
      {[-3, -1, 0.5, 2, 3.5].map((x, i) => (
        <mesh key={i} position={[x, -2.1, 1]} rotation={[-0.2, Math.random(), 0]}>
          <coneGeometry args={[0.05, 0.15, 4]} />
          <meshStandardMaterial color={isStormy ? '#33691E' : '#43A047'} />
        </mesh>
      ))}
    </group>
  );
});
Ground.displayName = 'Ground';

const Mountains = forwardRef<THREE.Group, { isStormy: boolean }>(({ isStormy }, _ref) => {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#37474F' : '#6D4C41', roughness: 0.9
  }), [isStormy]);
  const snowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#B0BEC5' : '#ECEFF1', roughness: 0.6
  }), [isStormy]);
  const farMountainMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#263238' : '#8D6E63', roughness: 0.95
  }), [isStormy]);

  return (
    <group position={[0, -1.5, -10]}>
      {/* Far mountains */}
      <mesh position={[-6, 1.5, -4]} material={farMountainMat}>
        <coneGeometry args={[5, 7, 6]} />
      </mesh>
      <mesh position={[7, 1, -5]} material={farMountainMat}>
        <coneGeometry args={[4, 6, 6]} />
      </mesh>
      {/* Near mountains */}
      <mesh position={[-3, 1.2, 0]} material={material}>
        <coneGeometry args={[3.5, 5.5, 8]} />
      </mesh>
      <mesh position={[-3, 3.5, 0]} material={snowMaterial}>
        <coneGeometry args={[1, 1.5, 8]} />
      </mesh>
      <mesh position={[3, 0.8, -1]} material={material}>
        <coneGeometry args={[3, 4.5, 8]} />
      </mesh>
      <mesh position={[3, 2.8, -1]} material={snowMaterial}>
        <coneGeometry args={[0.8, 1.2, 8]} />
      </mesh>
      <mesh position={[8, 1, -2]} material={material}>
        <coneGeometry args={[2.5, 4, 6]} />
      </mesh>
    </group>
  );
});
Mountains.displayName = 'Mountains';

const AnimatedRain: React.FC<{ intensity: number }> = ({ intensity }) => {
  const ref = useRef<THREE.Points>(null);
  const count = Math.min(Math.floor(intensity * 3), 300);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 10 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (!ref.current || intensity < 30) return;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;
    const windSpeed = (intensity / 100) * 0.3 + 0.05; // Aggressive drift to LHS

    for (let i = 0; i < count; i++) {
      posArr[i * 3 + 1] -= 0.15 + Math.random() * 0.1; // Fall down
      posArr[i * 3] -= windSpeed; // Strong wind drift to the left

      // Reset condition: hit ground or went too far left
      if (posArr[i * 3 + 1] < -2.5 || posArr[i * 3] < -8) {
        posArr[i * 3 + 1] = 6 + Math.random() * 2;
        // Spawn more to the right so they can travel across the screen to the left
        posArr[i * 3] = 2 + Math.random() * 12;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (intensity < 30) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#90CAF9" size={0.04} transparent opacity={0.7} />
    </points>
  );
};

const Clouds: React.FC<{ isStormy: boolean }> = ({ isStormy }) => {
  const cloudMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#37474F' : '#ECEFF1',
    transparent: true,
    opacity: isStormy ? 0.9 : 0.7,
    roughness: 1,
  }), [isStormy]);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      if (isStormy) {
        // Fast, stormy drift to the Left-Hand Side
        const driftX = 8 - (state.clock.elapsedTime * 2.5) % 20;
        groupRef.current.position.x = driftX;
      } else {
        // Gentle sway
        groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 4, -6]}>
      {[[-3, 0, 0], [0, 0.3, -1], [3, -0.2, 0.5], [-1.5, 0.5, -2], [4, 0.1, -1]].map(([x, y, z], i) => (
        <group key={i} position={[x!, y!, z!]}>
          <mesh material={cloudMaterial}>
            <sphereGeometry args={[0.8, 8, 8]} />
          </mesh>
          <mesh position={[0.5, -0.1, 0]} material={cloudMaterial}>
            <sphereGeometry args={[0.6, 8, 8]} />
          </mesh>
          <mesh position={[-0.4, -0.1, 0.1]} material={cloudMaterial}>
            <sphereGeometry args={[0.5, 8, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const Scene3D: React.FC = () => {
  const { phase, windPower, activeCharacter, isSpeaking, triggerSnap } = useStory();

  const isStormy = phase === 'STORM_BUILD' || phase === 'PEAK_STORM' || phase === 'SNAP';
  const isAftermath = phase === 'AFTERMATH';

  const skyColor = isStormy ? '#1a237e' : isAftermath ? '#FFE0B2' : '#81D4FA';
  const ambientIntensity = isStormy ? 0.25 : 0.55;
  const directionalIntensity = isStormy ? 0.3 : 0.9;

  return (
    <Canvas
      camera={{ position: [0, 0.5, 6], fov: 45 }}
      style={{ background: skyColor, transition: 'background 1.5s ease' }}
      shadows
    >
      <fog attach="fog" args={[isStormy ? '#1a237e' : '#81D4FA', 10, 25]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={directionalIntensity}
        castShadow
        color={isStormy ? '#90CAF9' : '#FFF9C4'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Rim light */}
      <directionalLight position={[-3, 4, -2]} intensity={0.2} color="#B3E5FC" />
      {isStormy && (
        <pointLight position={[0, 6, 0]} intensity={0.4} color="#7986CB" distance={15} />
      )}

      <Ground isStormy={isStormy} />
      <Mountains isStormy={isStormy} />
      <Clouds isStormy={isStormy} />
      <AnimatedRain intensity={windPower} />

      {/* Tree on LEFT side */}
      <Tree3D
        windPower={windPower}
        isSpeaking={isSpeaking}
        isActive={activeCharacter === 'TREE'}
        snapped={phase === 'SNAP' || phase === 'AFTERMATH'}
        isStormy={isStormy}
      />

      {/* Bush on RIGHT side */}
      <Bush3D
        windPower={windPower}
        isSpeaking={isSpeaking}
        isActive={activeCharacter === 'BRAMBLE'}
        isStormy={isStormy}
      />
    </Canvas>
  );
};
