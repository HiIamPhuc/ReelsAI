import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Create a responsive React component using <Canvas> from @react-three/fiber.
// Inside the canvas, render an abstract 3D object like a slowly rotating, translucent sphere
// (Focusing Orb). The sphere should slightly repel (move away from) the user's mouse cursor
// to add a subtle interactive 3D effect, representing concentration and awareness.
// Use soft lighting, a deep teal color for the ambient light, and a faint white spotlight.
// This component will be the main background for the left 'brand-area'.

function FocusingOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Track mouse position
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate rotation and mouse repel effect
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Slow rotation
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.002;

    // Mouse repel - sphere moves away from cursor
    const targetX = -mousePos.current.x * 0.5;
    const targetY = -mousePos.current.y * 0.5;
    
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]} scale={1.2}>
      <MeshDistortMaterial
        color="#14b8a6"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
}

export default function ThreeDBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    >
      {/* Soft lighting with deep teal ambient */}
      <ambientLight intensity={0.5} color="#0d9488" />
      <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={0.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#2dd4bf" />
      
      <FocusingOrb />
    </Canvas>
  );
}
