'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Glass torus knot
function GlassTorusKnot({ position, scale = 1, color = '#ffcba4' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.x = state.clock.elapsedTime * 0.12;
        ref.current.rotation.y = state.clock.elapsedTime * 0.08;
    });
    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
            <mesh ref={ref} position={position} scale={scale}>
                <torusKnotGeometry args={[1, 0.3, 80, 16]} />
                <meshStandardMaterial color={color} metalness={0.15} roughness={0.05} transparent opacity={0.6} />
            </mesh>
        </Float>
    );
}

// Glass sphere
function GlassSphere({ position, scale = 1, color = '#ffd6b0' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.x = state.clock.elapsedTime * 0.06;
        ref.current.rotation.z = state.clock.elapsedTime * 0.1;
        ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    });
    return (
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.5}>
            <mesh ref={ref} position={position} scale={scale}>
                <icosahedronGeometry args={[1, 2]} />
                <meshStandardMaterial color={color} metalness={0.1} roughness={0.05} transparent opacity={0.55} />
            </mesh>
        </Float>
    );
}

// Glass ring
function GlassRing({ position, scale = 1, color = '#b2f0e8' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.6 + 0.5;
        ref.current.rotation.y = state.clock.elapsedTime * 0.15;
    });
    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1}>
            <mesh ref={ref} position={position} scale={scale}>
                <torusGeometry args={[1, 0.3, 16, 32]} />
                <meshStandardMaterial color={color} metalness={0.1} roughness={0.05} transparent opacity={0.5} />
            </mesh>
        </Float>
    );
}

// Glass gem
function GlassGem({ position, scale = 1, color = '#fff0c8' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.y = state.clock.elapsedTime * 0.2;
        ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.3;
    });
    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={1.5}>
            <mesh ref={ref} position={position} scale={scale}>
                <octahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={color} metalness={0.15} roughness={0.02} transparent opacity={0.55} />
            </mesh>
        </Float>
    );
}

// Glass capsule
function GlassCapsule({ position, scale = 1, color = '#e4435b' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.z = state.clock.elapsedTime * 0.12;
        ref.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.08) * 0.35;
    });
    return (
        <Float speed={1} rotationIntensity={0.3} floatIntensity={1.2}>
            <mesh ref={ref} position={position} scale={scale}>
                <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
                <meshStandardMaterial color={color} metalness={0.1} roughness={0.05} transparent opacity={0.5} />
            </mesh>
        </Float>
    );
}

// Glass cone
function GlassCone({ position, scale = 1, color = '#e6c35d' }: { position: [number, number, number]; scale?: number; color?: string }) {
    const ref = useRef<THREE.Mesh>(null!);
    useFrame((state) => {
        ref.current.rotation.y = state.clock.elapsedTime * 0.18;
        ref.current.rotation.x = 0.3;
    });
    return (
        <Float speed={1.8} rotationIntensity={0.2} floatIntensity={1.3}>
            <mesh ref={ref} position={position} scale={scale}>
                <coneGeometry args={[0.8, 1.6, 5]} />
                <meshStandardMaterial color={color} metalness={0.1} roughness={0.05} transparent opacity={0.55} />
            </mesh>
        </Float>
    );
}

export default function Scene3D() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            <Canvas
                camera={{ position: [0, 0, 14], fov: 40 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
                style={{ background: 'transparent' }}
                frameloop="always"
            >
                {/* Simple bright lighting — no Environment HDR */}
                <ambientLight intensity={2} />
                <directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
                <directionalLight position={[-4, 3, 2]} intensity={1.5} color="#fff5e6" />
                <pointLight position={[-5, -3, 3]} intensity={1.5} color="#ffb380" />

                {/* Fewer objects — 10 total */}
                <GlassTorusKnot position={[-5.5, 1, 0]} scale={0.7} color="#ffcba4" />
                <GlassSphere position={[5.5, -0.5, 0]} scale={0.8} color="#ffd6b0" />
                <GlassRing position={[4, 3, -2]} scale={0.6} color="#b2f0e8" />
                <GlassRing position={[-4.5, -2.5, -1]} scale={0.5} color="#ffe8a0" />
                <GlassGem position={[-2.5, -2.5, 0]} scale={0.4} color="#fff0c8" />
                <GlassGem position={[3, 4, -3]} scale={0.35} color="#e4435b" />
                <GlassCapsule position={[6, 2, -3]} scale={0.4} color="#e4435b" />
                <GlassCapsule position={[-6, -1, -2]} scale={0.35} color="#b2f0e8" />
                <GlassCone position={[-2, 3.5, -2]} scale={0.4} color="#e6c35d" />
                <GlassCone position={[2, -3.5, -1]} scale={0.35} color="#e4435b" />
            </Canvas>
        </div>
    );
}
