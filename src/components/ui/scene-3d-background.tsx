'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating sphere with distortion
function FloatingSphere({
    position,
    scale = 1,
    color = '#1a1a1a',
    speed = 1,
    distort = 0.3
}: {
    position: [number, number, number];
    scale?: number;
    color?: string;
    speed?: number;
    distort?: number;
}) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.1;
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2 * speed) * 0.1;
        }
    });

    return (
        <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh ref={meshRef} position={position} scale={scale}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshDistortMaterial
                    color={color}
                    roughness={0.1}
                    metalness={0.8}
                    distort={distort}
                    speed={2}
                />
            </mesh>
        </Float>
    );
}

// Animated wave plane
function WavePlane() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color('#0a0a0a') },
            uColor2: { value: new THREE.Color('#1a1a1a') },
        }),
        []
    );

    const vertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      float elevation = sin(modelPosition.x * 2.0 + uTime * 0.5) * 0.15;
      elevation += sin(modelPosition.y * 1.5 + uTime * 0.3) * 0.1;
      elevation += sin(modelPosition.x * 3.0 + modelPosition.y * 2.0 + uTime * 0.4) * 0.05;
      
      modelPosition.z += elevation;
      vElevation = elevation;
      
      gl_Position = projectionMatrix * viewMatrix * modelPosition;
    }
  `;

    const fragmentShader = `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying float vElevation;
    varying vec2 vUv;
    
    void main() {
      float mixStrength = (vElevation + 0.25) * 2.0;
      vec3 color = mix(uColor1, uColor2, mixStrength);
      gl_FragColor = vec4(color, 0.9);
    }
  `;

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -3, -5]}>
            <planeGeometry args={[30, 30, 128, 128]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// Floating grid lines
function GridLines() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    const lines = useMemo(() => {
        const linesArray = [];
        for (let i = -5; i <= 5; i++) {
            linesArray.push(
                <line key={`h-${i}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[new Float32Array([-10, i * 0.8, 0, 10, i * 0.8, 0]), 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#1a1a1a" transparent opacity={0.3} />
                </line>
            );
            linesArray.push(
                <line key={`v-${i}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[new Float32Array([i * 0.8, -10, 0, i * 0.8, 10, 0]), 3]}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#1a1a1a" transparent opacity={0.3} />
                </line>
            );
        }
        return linesArray;
    }, []);

    return (
        <group ref={groupRef} position={[0, 0, -8]}>
            {lines}
        </group>
    );
}

// Camera that responds to mouse
function ResponsiveCamera() {
    const { camera } = useThree();
    const mouseRef = useRef({ x: 0, y: 0 });

    useFrame((state) => {
        const targetX = mouseRef.current.x * 0.5;
        const targetY = mouseRef.current.y * 0.3;

        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// Main 3D Scene
function Scene() {
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
            <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4a4a4a" />
            <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />

            {/* 3D Elements */}
            <WavePlane />
            <GridLines />

            {/* Large background sphere */}
            <FloatingSphere
                position={[4, 2, -6]}
                scale={2.5}
                color="#0f0f0f"
                speed={0.5}
                distort={0.2}
            />

            {/* Medium sphere */}
            <FloatingSphere
                position={[-4, -1, -4]}
                scale={1.5}
                color="#1a1a1a"
                speed={0.7}
                distort={0.3}
            />

            {/* Small accent sphere */}
            <FloatingSphere
                position={[-2, 3, -5]}
                scale={0.8}
                color="#2a2a2a"
                speed={1}
                distort={0.4}
            />

            {/* Additional depth sphere */}
            <FloatingSphere
                position={[2, -2, -8]}
                scale={1.2}
                color="#151515"
                speed={0.6}
                distort={0.25}
            />

            <ResponsiveCamera />
        </>
    );
}

// Loading fallback
function Loader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}

// Main component
export function Scene3DBackground() {
    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    if (prefersReducedMotion) {
        return (
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        );
    }

    return (
        <div className="absolute inset-0">
            <Suspense fallback={<Loader />}>
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 45 }}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    dpr={[1, 2]}
                    style={{ background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #050505 100%)' }}
                >
                    <Scene />
                </Canvas>
            </Suspense>

            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />
        </div>
    );
}

export default Scene3DBackground;
