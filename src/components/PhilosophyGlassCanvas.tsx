import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

interface PhilosophyGlassCanvasProps {
  theme: 'dark' | 'light';
  progressRef: MutableRefObject<number>;
}

export function PhilosophyGlassCanvas({ theme, progressRef }: PhilosophyGlassCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const materialRefs = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    key: THREE.DirectionalLight;
    rim: THREE.PointLight;
  } | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 7);

    const rim = new THREE.PointLight(0x155df2, 16, 22);
    rim.position.set(-3.5, -1.5, 5);

    const backAccent = new THREE.PointLight(0x155df2, 12, 20);
    backAccent.position.set(3.2, 2.5, -4);

    scene.add(ambient, key, rim, backAccent);
    lightsRef.current = { ambient, key, rim };

    // 5 Liminal-style translucent glass prism panels
    const group = new THREE.Group();
    scene.add(group);

    const geometry = new RoundedBoxGeometry(2.15, 4.35, 0.22, 5, 0.09);
    const meshes: THREE.Mesh[] = [];
    const materials: THREE.MeshPhysicalMaterial[] = [];

    const panelConfigs = [
      { x: -2.55, y: -0.25, z: -1.1, rz: 0.24, ry: 0.42 },
      { x: -1.28, y: -0.1, z: -0.45, rz: 0.12, ry: 0.24 },
      { x: 0.0, y: 0.05, z: 0.15, rz: 0.0, ry: 0.06 },
      { x: 1.28, y: 0.2, z: -0.45, rz: -0.12, ry: -0.24 },
      { x: 2.55, y: 0.35, z: -1.1, rz: -0.24, ry: -0.42 },
    ];

    panelConfigs.forEach((cfg, i) => {
      const mat = new THREE.MeshPhysicalMaterial({
        color: i === 2 ? new THREE.Color('#3b7bff') : new THREE.Color('#dce8ff'),
        transmission: 0.9,
        opacity: 1,
        transparent: true,
        roughness: 0.11,
        metalness: 0.04,
        ior: 1.48,
        thickness: 1.35,
        specularIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        attenuationColor: new THREE.Color('#155df2'),
        attenuationDistance: 2.6,
      });
      materials.push(mat);

      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.set(0.08, cfg.ry, cfg.rz);
      group.add(mesh);
      meshes.push(mesh);
    });

    materialRefs.current = materials;

    const handleResize = () => {
      if (!wrapper) return;
      const w = Math.max(1, wrapper.clientWidth);
      const h = Math.max(1, wrapper.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: '250px' }
    );
    io.observe(wrapper);

    let rafId = 0;
    let smoothedProgress = progressRef.current;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      smoothedProgress += (progressRef.current - smoothedProgress) * 0.08;

      group.rotation.y = (smoothedProgress - 0.5) * 0.95 + Math.sin(elapsed * 0.45) * 0.06;
      group.rotation.x = Math.cos(elapsed * 0.35) * 0.05 + (smoothedProgress - 0.5) * 0.22;

      meshes.forEach((mesh, idx) => {
        const base = panelConfigs[idx];
        const spread = 1 + smoothedProgress * 0.26;
        mesh.position.x = base.x * spread;
        mesh.position.y =
          base.y + Math.sin(elapsed * 0.9 + idx * 0.8) * 0.12 + (idx - 2) * (smoothedProgress - 0.5) * 0.18;
        mesh.rotation.y = base.ry + (smoothedProgress - 0.5) * 0.55;
        mesh.rotation.z = base.rz + (smoothedProgress - 0.5) * 0.18 * (idx - 2);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      io.disconnect();
      geometry.dispose();
      materials.forEach((m) => m.dispose());
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, [progressRef]);

  // React to Dark / Light theme switch without recreating the WebGL context
  useEffect(() => {
    const isDark = theme === 'dark';
    materialRefs.current.forEach((mat, i) => {
      mat.color.set(
        isDark
          ? i === 2
            ? '#4a86ff'
            : '#cfe0ff'
          : i === 2
            ? '#155df2'
            : '#8bb2ff'
      );
      mat.attenuationDistance = isDark ? 2.8 : 1.7;
      mat.roughness = isDark ? 0.11 : 0.15;
    });

    if (lightsRef.current) {
      lightsRef.current.ambient.intensity = isDark ? 0.72 : 1.15;
      lightsRef.current.rim.intensity = isDark ? 17 : 22;
    }
  }, [theme]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        data-engine="three.js"
        className="h-full w-full opacity-90"
      />
    </div>
  );
}
