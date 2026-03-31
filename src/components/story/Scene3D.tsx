import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStory } from '../../store/StoryContext';
import { Tree3D } from './Tree3D';
import { Bush3D } from './Bush3D';
import * as THREE from 'three';

const Ground: React.FC<{ isStormy: boolean }> = ({ isStormy }) => {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#2E7D32' : '#4CAF50', roughness: 1
  }), [isStormy]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} material={material}>
      <planeGeometry args={[20, 20]} />
    </mesh>
  );
};

const Mountains: React.FC<{ isStormy: boolean }> = ({ isStormy }) => {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: isStormy ? '#37474F' : '#5D4037', roughness: 0.9
  }), [isStormy]);
  const snowMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#E0E0E0', roughness: 0.7
  }), []);

  return (
    <group position={[0, -1, -8]}>
      <mesh position={[-3, 1, 0]} material={material}>
        <coneGeometry args={[3, 5, 6]} />
      </mesh>
      <mesh position={[-3, 3.2, 0]} material={snowMaterial}>
        <coneGeometry args={[0.8, 1.2, 6]} />
      </mesh>
      <mesh position={[2, 0.5, -1]} material={material}>
        <coneGeometry args={[2.5, 4, 6]} />
      </mesh>
      <mesh position={[2, 2.3, -1]} material={snowMaterial}>
        <coneGeometry args={[0.6, 1, 6]} />
      </mesh>
      <mesh position={[6, 0.8, -2]} material={material}>
        <coneGeometry args={[2, 3.5, 6]} />
      </mesh>
    </group>
  );
};

const RainParticles: React.FC<{ intensity: number }> = ({ intensity }) => {
  const count = Math.floor(intensity * 2);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 8 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  if (intensity < 30) return null;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#90CAF9" size={0.03} transparent opacity={0.6} />
    </points>
  );
};

export const Scene3D: React.FC = () => {
  const { phase, windPower, activeCharacter, isSpeaking, triggerSnap } = useStory();

  const isStormy = phase === 'STORM_BUILD' || phase === 'PEAK_STORM' || phase === 'SNAP';
  const isAftermath = phase === 'AFTERMATH';

  const skyColor = isStormy ? '#263238' : isAftermath ? '#FFE0B2' : '#87CEEB';
  const ambientIntensity = isStormy ? 0.3 : 0.6;
  const directionalIntensity = isStormy ? 0.4 : 1;

  return (
    <Canvas
      camera={{ position: [0, 0.5, 5], fov: 50 }}
      style={{ background: skyColor, transition: 'background 1.5s ease' }}
    >
      <ambientLight intensity={ambientIntensity} />
      <directionalLight
        position={[3, 5, 2]}
        intensity={directionalIntensity}
        castShadow
        color={isStormy ? '#B0BEC5' : '#FFF9C4'}
      />
      {isStormy && (
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#90CAF9" />
      )}

      <Ground isStormy={isStormy} />
      <Mountains isStormy={isStormy} />
      <RainParticles intensity={windPower} />

      <Tree3D
        windPower={windPower}
        isSpeaking={isSpeaking}
        isActive={activeCharacter === 'TREE'}
        snapped={triggerSnap}
        isStormy={isStormy}
      />
      <Bush3D
        windPower={windPower}
        isSpeaking={isSpeaking}
        isActive={activeCharacter === 'BRAMBLE'}
        isStormy={isStormy}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  );
};
