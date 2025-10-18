import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Bed {
  id: string;
  bed_number: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'icu';
  position: { x: number; y: number; z: number };
  patient?: string;
}

interface BedMap3DProps {
  beds: Bed[];
  selectedFloor: number;
  onSelectBed: (bed: Bed) => void;
}

const BedMesh = ({ bed, onClick }: { bed: Bed; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);

  const getColor = () => {
    switch (bed.status) {
      case 'available':
        return hovered ? '#4ade80' : '#22c55e';
      case 'occupied':
        return hovered ? '#f87171' : '#ef4444';
      case 'cleaning':
        return hovered ? '#fbbf24' : '#f59e0b';
      case 'icu':
        return hovered ? '#60a5fa' : '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <mesh
      position={[bed.position.x, bed.position.y, bed.position.z]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <boxGeometry args={[1, 0.3, 2]} />
      <meshStandardMaterial color={getColor()} />
    </mesh>
  );
};

const BedMap3D = ({ beds, selectedFloor, onSelectBed }: BedMap3DProps) => {
  const filteredBeds = beds.filter((bed) => bed.floor === selectedFloor);

  return (
    <div className="h-full w-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls enableZoom={true} enablePan={true} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e5e7eb" />
        </mesh>

        {/* Grid lines */}
        <gridHelper args={[20, 20, '#9ca3af', '#d1d5db']} position={[0, -0.19, 0]} />

        {/* Beds */}
        {filteredBeds.map((bed) => (
          <BedMesh key={bed.id} bed={bed} onClick={() => onSelectBed(bed)} />
        ))}
      </Canvas>
    </div>
  );
};

export default BedMap3D;
