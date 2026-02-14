'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

function GlassShape({ position, scale = 1, color = '#ffcba4', geometry = 'torus' }: {
    position: [number, number, number]; scale?: number; color?: string;
    geometry?: 'torus' | 'knot' | 'octa' | 'sphere' | 'capsule';
}) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        ref.current.rotation.x = t * 0.08;
        ref.current.rotation.y = t * 0.06;
    });

    const geo = {
        torus: <torusGeometry args={[1, 0.3, 12, 24]} />,
        knot: <torusKnotGeometry args={[1, 0.3, 48, 8]} />,
        octa: <octahedronGeometry args={[1, 0]} />,
        sphere: <icosahedronGeometry args={[1, 1]} />,
        capsule: <capsuleGeometry args={[0.5, 1.2, 6, 12]} />,
    };

    return (
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.8}>
            <mesh ref={ref} position={position} scale={scale}>
                {geo[geometry]}
                <meshStandardMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.05}
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </Float>
    );
}

export default function Scene3D() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 14], fov: 40 }}
                dpr={1}
                gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={2} />
                <directionalLight position={[5, 5, 5]} intensity={2.5} color="#ffffff" />
                <directionalLight position={[-3, 3, 2]} intensity={1} color="#fff5e6" />

                {/* Only 6 shapes — minimal GPU load */}
                <GlassShape position={[-5, 1.5, -1]} scale={0.7} color="#ffcba4" geometry="knot" />
                <GlassShape position={[5.5, -0.5, -1]} scale={0.75} color="#ffd6b0" geometry="sphere" />
                <GlassShape position={[3.5, 3, -3]} scale={0.55} color="#b2f0e8" geometry="torus" />
                <GlassShape position={[-3, -2.5, -2]} scale={0.4} color="#e6c35d" geometry="octa" />
                <GlassShape position={[5, 2.5, -4]} scale={0.35} color="#e4435b" geometry="capsule" />
                <GlassShape position={[-5, -1, -3]} scale={0.35} color="#b2f0e8" geometry="capsule" />
            </Canvas>
        </div>
    );
}
