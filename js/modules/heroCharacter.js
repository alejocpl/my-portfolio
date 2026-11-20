/* =================================================================
   MODULES / HEROCHARACTER.JS
   Núcleo Tecnológico 3D con Anillos Giroscópicos para #heroCharacter.

   Características visuales e interactivas:
     - Núcleo central geométrico facetado (acabado metálico oscuro titanio)
       con núcleo energético interior emisivo y jaula wireframe sutil (#155DF2)
       con nodos de vértice iluminados.
     - 3 anillos orbitales giroscópicos concéntricos con marcadores técnicos
       y partículas orbitales flotantes.
     - Seguimiento del cursor: el núcleo apunta hacia el mouse con suavizado
       LERP y los anillos responden con efecto paralaje diferencial.
     - Interacción al clic: lanza una onda/pulso de energía expansivo,
       intensifica el brillo del núcleo y acelera el giro giroscópico.
   ================================================================= */
window.AC = window.AC || {};

AC.heroCharacter = (function () {
  const { $, prefersReducedMotion } = AC.utils;

  /* ── Constantes de configuración ── */
  const CONFIG = {
    inactivityMs: 10000,       // 10 s sin actividad para pasar a crucero suave (standby)
    pulseDurationMs: 1050,     // duración del pulso energético y giro rápido al hacer clic
    trackLerp: 0.11,           // suavizado de seguimiento hacia el cursor
    coreMaxRotX: 0.55,         // inclinación vertical máxima del núcleo hacia el cursor (rad)
    coreMaxRotY: 0.72,         // rotación horizontal máxima del núcleo hacia el cursor (rad)
  };

  /* ── Utilidades matemáticas locales ── */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* =================================================================
     1. CREACIÓN Y CONFIGURACIÓN DEL MODELO 3D (Three.js r128)
     ================================================================= */
  function createThreeRig(container) {
    const THREE = window.THREE;
    if (!THREE) return null;

    try {
      const rect = container.getBoundingClientRect();
      const width = Math.max(rect.width || container.clientWidth || 380, 260);
      const height = Math.max(rect.height || container.clientHeight || 475, 320);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);

      function updateCameraFraming(w, h) {
        const aspect = w / h;
        camera.aspect = aspect;
        const baseZ = 6.0;
        camera.position.set(0, 0.04, aspect < 1 ? baseZ / Math.max(aspect, 0.68) : baseZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
      updateCameraFraming(width, height);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      /* ---------- Iluminación técnica (azul eléctrico + reflejos fríos) ---------- */
      const hemiLight = new THREE.HemisphereLight(0xdbe8ff, 0x0b1020, 0.85);
      hemiLight.position.set(0, 4, 2);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
      keyLight.position.set(-2.4, 3.6, 4.8);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x155df2, 1.35);
      rimLight.position.set(3.4, -1.6, 2.5);
      scene.add(rimLight);

      const corePointLight = new THREE.PointLight(0x4d88ff, 1.2, 6);
      corePointLight.position.set(0, 0, 0.5);
      scene.add(corePointLight);

      /* ---------- Resplandor / sombra tecnológica inferior ---------- */
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sctx = shadowCanvas.getContext("2d");
      const grad = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
      grad.addColorStop(0, "rgba(21, 93, 242, 0.32)");
      grad.addColorStop(0.5, "rgba(15, 23, 42, 0.16)");
      grad.addColorStop(1, "rgba(15, 23, 42, 0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.8, 2.2),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, -1.56, 0);
      scene.add(shadowMesh);

      /* ---------- Materiales ---------- */
      // Núcleo metálico oscuro facetado (grafito / titanio)
      const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x161c2a,
        roughness: 0.26,
        metalness: 0.84,
        flatShading: true,
        emissive: 0x08132c,
        emissiveIntensity: 0.35,
      });

      // Núcleo interior de energía (#155DF2 -> #4D88FF)
      const innerEnergyMat = new THREE.MeshStandardMaterial({
        color: 0x155df2,
        emissive: 0x2c74ff,
        emissiveIntensity: 0.9,
        roughness: 0.18,
        metalness: 0.1,
        flatShading: true,
      });

      // Malla wireframe sutil alrededor del núcleo (#155DF2 / #4D88FF)
      const wireframeMat = new THREE.LineBasicMaterial({
        color: 0x4d88ff,
        transparent: true,
        opacity: 0.62,
      });

      // Nodos luminosos en vértices y órbitas
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x76a9ff,
      });

      // Anillo metálico estructural
      const ringMetalMat = new THREE.MeshStandardMaterial({
        color: 0x242e44,
        roughness: 0.22,
        metalness: 0.88,
        emissive: 0x0b1d48,
        emissiveIntensity: 0.25,
      });

      // Anillos de acento azul (#155DF2)
      const ringAccentMat = new THREE.MeshStandardMaterial({
        color: 0x155df2,
        emissive: 0x1f6bff,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0.55,
      });

      // Anillo exterior fino
      const ringOuterMat = new THREE.MeshBasicMaterial({
        color: 0x4d88ff,
        transparent: true,
        opacity: 0.52,
      });

      // Onda expansiva para el pulso al hacer clic
      const pulseWaveMat = new THREE.MeshBasicMaterial({
        color: 0x6ea4ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });

      /* ---------- Grupos de escena ---------- */
      const root = new THREE.Group();
      scene.add(root);

      const coreGroup = new THREE.Group();
      root.add(coreGroup);

      const ringsGroup = new THREE.Group();
      root.add(ringsGroup);

      /* ---------- 1. NÚCLEO GEOMÉTRICO FACETADO ---------- */
      // 1a. Esfera/Icosaedro energético interno
      const innerGeo = new THREE.IcosahedronGeometry(0.42, 1);
      const innerMesh = new THREE.Mesh(innerGeo, innerEnergyMat);
      coreGroup.add(innerMesh);

      // 1b. Coraza metálica oscura facetada
      const shellGeo = new THREE.IcosahedronGeometry(0.67, 1);
      const shellMesh = new THREE.Mesh(shellGeo, darkMetalMat);
      coreGroup.add(shellMesh);

      // 1c. Jaula wireframe sutil en #155DF2 + nodos en los vértices
      const cageGeo = new THREE.IcosahedronGeometry(0.75, 1);
      const cageEdges = new THREE.EdgesGeometry(cageGeo);
      const wireframeMesh = new THREE.LineSegments(cageEdges, wireframeMat);
      coreGroup.add(wireframeMesh);

      // Pequeños nodos en los vértices únicos de la jaula wireframe
      const vertexNodesGroup = new THREE.Group();
      const posAttr = cageGeo.attributes.position;
      const seenVertices = new Set();
      const nodeGeo = new THREE.SphereGeometry(0.022, 10, 10);

      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = posAttr.getZ(i);
        const key = `${vx.toFixed(3)},${vy.toFixed(3)},${vz.toFixed(3)}`;
        if (!seenVertices.has(key)) {
          seenVertices.add(key);
          const nMesh = new THREE.Mesh(nodeGeo, nodeMat);
          nMesh.position.set(vx, vy, vz);
          vertexNodesGroup.add(nMesh);
        }
      }
      coreGroup.add(vertexNodesGroup);

      // 1d. Visor / eje focal frontal en el núcleo (acento que apunta al cursor)
      const visorGroup = new THREE.Group();
      visorGroup.position.set(0, 0, 0.68);
      const visorRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.012, 12, 36),
        ringAccentMat
      );
      const visorCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 16, 16),
        nodeMat
      );
      visorCore.position.z = 0.02;
      visorGroup.add(visorRing, visorCore);
      coreGroup.add(visorGroup);

      /* ---------- 2. ANILLOS ORBITALES GIROSCÓPICOS ---------- */
      // Anillo 1 (Interior — alta respuesta al cursor, color azul eléctrico)
      const ring1Pivot = new THREE.Group();
      const ring1Mesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.98, 0.014, 16, 100),
        ringAccentMat
      );
      ring1Pivot.add(ring1Mesh);

      // Dos nodos orbitales opuestos sobre el anillo 1
      const r1NodeGeo = new THREE.SphereGeometry(0.036, 14, 14);
      const r1NodeA = new THREE.Mesh(r1NodeGeo, nodeMat);
      r1NodeA.position.set(0.98, 0, 0);
      const r1NodeB = new THREE.Mesh(r1NodeGeo, nodeMat);
      r1NodeB.position.set(-0.98, 0, 0);
      ring1Pivot.add(r1NodeA, r1NodeB);
      ring1Pivot.rotation.set(0.45, -0.35, 0.2);
      ringsGroup.add(ring1Pivot);

      // Anillo 2 (Medio — gimbal estructural metálico oscuro + arco secundario)
      const ring2Pivot = new THREE.Group();
      const ring2Mesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.20, 0.021, 18, 120),
        ringMetalMat
      );
      const ring2SubArc = new THREE.Mesh(
        new THREE.TorusGeometry(1.245, 0.008, 12, 90, Math.PI * 1.35),
        ringAccentMat
      );
      ring2SubArc.rotation.z = 0.4;
      ring2Pivot.add(ring2Mesh, ring2SubArc);

      // Marcadores de acople técnico en el anillo 2
      const bracketGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const bracket = new THREE.Mesh(bracketGeo, ringAccentMat);
        bracket.position.set(Math.cos(angle) * 1.20, Math.sin(angle) * 1.20, 0);
        bracket.rotation.z = angle;
        ring2Pivot.add(bracket);
      }
      ring2Pivot.rotation.set(-0.62, 0.48, -0.15);
      ringsGroup.add(ring2Pivot);

      // Anillo 3 (Exterior — halo orbital fino + satélites de datos)
      const ring3Pivot = new THREE.Group();
      const ring3Mesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.011, 16, 128),
        ringOuterMat
      );
      ring3Pivot.add(ring3Mesh);

      const r3NodeGeo = new THREE.SphereGeometry(0.028, 12, 12);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const sat = new THREE.Mesh(r3NodeGeo, nodeMat);
        sat.position.set(Math.cos(angle) * 1.42, Math.sin(angle) * 1.42, 0);
        ring3Pivot.add(sat);
      }
      ring3Pivot.rotation.set(0.88, 0.22, -0.52);
      ringsGroup.add(ring3Pivot);

      /* ---------- 3. PARTÍCULAS / NODOS FLOTANTES AMBIENTALES ---------- */
      const particlesGroup = new THREE.Group();
      const pGeo = new THREE.SphereGeometry(0.018, 8, 8);
      const particleOffsets = [
        [-1.35, 0.85, -0.4],
        [1.42, 0.72, -0.3],
        [-1.28, -0.88, 0.3],
        [1.32, -0.78, 0.25],
        [0.15, 1.48, -0.2],
        [-0.22, -1.45, 0.2],
        [1.05, 1.12, 0.4],
        [-1.12, 1.05, 0.35],
      ];
      const floatingParticles = particleOffsets.map((coords, idx) => {
        const pm = new THREE.Mesh(pGeo, nodeMat);
        pm.position.set(coords[0], coords[1], coords[2]);
        particlesGroup.add(pm);
        return {
          mesh: pm,
          baseX: coords[0],
          baseY: coords[1],
          baseZ: coords[2],
          phase: idx * 0.9,
        };
      });
      root.add(particlesGroup);

      /* ---------- 4. ONDA DE PULSO DE ENERGÍA AL HACER CLIC ---------- */
      const pulseWaveMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.72, 0.78, 64),
        pulseWaveMat
      );
      root.add(pulseWaveMesh);

      return {
        type: "three",
        renderer,
        scene,
        camera,
        root,
        coreGroup,
        innerMesh,
        shellMesh,
        wireframeMesh,
        vertexNodesGroup,
        visorGroup,
        ring1Pivot,
        ring2Pivot,
        ring3Pivot,
        particlesGroup,
        floatingParticles,
        pulseWaveMesh,
        shadowMesh,
        corePointLight,
        innerEnergyMat,
        wireframeMat,
        ringAccentMat,
        pulseWaveMat,
        resize(w, h) {
          if (!w || !h) return;
          updateCameraFraming(w, h);
          renderer.setSize(w, h);
        },
        render() {
          renderer.render(scene, camera);
        },
        dispose() {
          renderer.dispose();
          renderer.domElement?.remove();
        },
      };
    } catch (err) {
      console.warn("[heroCharacter] Fallback a SVG interactivo:", err);
      return null;
    }
  }

  /* =================================================================
     FALLBACK INTERACTIVO SVG (si WebGL no está disponible)
     ================================================================= */
  function createFallbackRig(container) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 400 400");
    svg.setAttribute("class", "hero-char__svg");
    svg.setAttribute("aria-hidden", "true");

    svg.innerHTML = `
      <defs>
        <radialGradient id="coreGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4d88ff" stop-opacity="0.45"/>
          <stop offset="60%" stop-color="#155df2" stop-opacity="0.14"/>
          <stop offset="100%" stop-color="#155df2" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="coreMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#28334d"/>
          <stop offset="50%" stop-color="#181f30"/>
          <stop offset="100%" stop-color="#0f1420"/>
        </linearGradient>
      </defs>
      <g transform="translate(200, 200)">
        <circle r="155" fill="url(#coreGlowGrad)"/>
        <g id="svgRing3">
          <ellipse rx="148" ry="62" fill="none" stroke="#4d88ff" stroke-width="1.5" stroke-opacity="0.5" transform="rotate(-28)"/>
        </g>
        <g id="svgRing2">
          <ellipse rx="124" ry="84" fill="none" stroke="#2c3a57" stroke-width="3" transform="rotate(32)"/>
          <ellipse rx="124" ry="84" fill="none" stroke="#155df2" stroke-width="1.5" stroke-dasharray="110 180" transform="rotate(32)"/>
        </g>
        <g id="svgRing1">
          <ellipse rx="98" ry="44" fill="none" stroke="#155df2" stroke-width="2" transform="rotate(-12)"/>
        </g>
        <g id="svgCoreGroup">
          <polygon points="0,-64 55,-32 55,32 0,64 -55,32 -55,-32" fill="url(#coreMetalGrad)" stroke="#4d88ff" stroke-width="1.8"/>
          <polygon points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19" fill="#155df2" fill-opacity="0.35" stroke="#76a9ff" stroke-width="1.4"/>
          <circle r="10" fill="#76a9ff"/>
        </g>
      </g>
    `;
    container.appendChild(svg);

    return {
      type: "svg",
      svg,
      coreGroup: svg.querySelector("#svgCoreGroup"),
      ring1: svg.querySelector("#svgRing1"),
      ring2: svg.querySelector("#svgRing2"),
      ring3: svg.querySelector("#svgRing3"),
      resize() {},
      render() {},
      dispose() {
        svg.remove();
      },
    };
  }

  /* =================================================================
     2. SEGUIMIENTO DEL CURSOR (CursorTracker)
     Calcula la posición normalizada del cursor respecto al centro del
     núcleo 3D para orientar el núcleo y aplicar paralaje a los anillos.
     ================================================================= */
  function createCursorTracker(container) {
    const state = {
      targetX: 0, // [-1, 1]
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    function updateTargetFromPoint(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const refRadius = Math.max(rect.width, rect.height) * 0.85;
      const strength = Math.tanh(dist / refRadius);
      const angle = Math.atan2(dy, dx);

      state.targetX = Math.cos(angle) * strength;
      state.targetY = -Math.sin(angle) * strength; // +Y hacia arriba en 3D
    }

    function step(standbyWeight) {
      const factor = 1 - standbyWeight * 0.65;
      const tx = state.targetX * factor;
      const ty = state.targetY * factor;

      state.currentX = lerp(state.currentX, tx, CONFIG.trackLerp);
      state.currentY = lerp(state.currentY, ty, CONFIG.trackLerp);

      return {
        normX: state.currentX,
        normY: state.currentY,
      };
    }

    return { updateTargetFromPoint, step };
  }

  /* =================================================================
     3. CONTROL DE ESTADOS, PARALAJE GIROSCÓPICO Y PULSO DE ENERGÍA
     ================================================================= */
  function init() {
    const container = $("#heroCharacter");
    if (!container) return;

    const rig = createThreeRig(container) || createFallbackRig(container);
    const tracker = createCursorTracker(container);

    requestAnimationFrame(() => {
      rig.resize(container.clientWidth, container.clientHeight);
    });

    const state = {
      standbyWeight: 0,         // 0 = activo, 1 = crucero standby suave
      pulseStartTime: 0,
      isPulsing: false,
      spinSpinAccumulator: 0,   // rotación extra acumulada durante los pulsos al hacer clic
      lastFrameTime: performance.now(),
      lastActivityTime: performance.now(),
      isInViewport: true,
    };

    function registerActivity(clientX, clientY) {
      state.lastActivityTime = performance.now();
      if (typeof clientX === "number" && typeof clientY === "number") {
        tracker.updateTargetFromPoint(clientX, clientY);
      }
    }

    function triggerPulse(e) {
      if (e) e.stopPropagation();
      state.lastActivityTime = performance.now();
      state.isPulsing = true;
      state.pulseStartTime = performance.now();
    }

    function applyToRig(now, cursor) {
      const reduced = prefersReducedMotion();
      const dt = Math.min((now - state.lastFrameTime) * 0.001, 0.1);
      state.lastFrameTime = now;
      const t = now * 0.001;

      // 1. Modo standby suave tras 10s sin mover el cursor
      const isInactive = !state.isPulsing && now - state.lastActivityTime >= CONFIG.inactivityMs;
      state.standbyWeight = lerp(state.standbyWeight, isInactive ? 1 : 0, 0.04);

      // 2. Pulso de energía y aceleración giroscópica al hacer clic
      let pulseIntensity = 0;
      let pulseProgress = 0;

      if (state.isPulsing) {
        const elapsed = now - state.pulseStartTime;
        pulseProgress = clamp(elapsed / CONFIG.pulseDurationMs, 0, 1);
        pulseIntensity = Math.sin(pulseProgress * Math.PI);

        // Aceleración rápida de los anillos durante el pulso
        if (!reduced) {
          state.spinSpinAccumulator += dt * pulseIntensity * 8.5;
        }

        if (pulseProgress >= 1) {
          state.isPulsing = false;
          pulseIntensity = 0;
        }
      }

      const speedMult = reduced ? 0.15 : lerp(1.0, 0.45, state.standbyWeight);
      const extraSpin = state.spinSpinAccumulator;

      // Flotación vertical orgánica del sistema completo
      const floatY = reduced ? 0 : Math.sin(t * 1.7) * 0.055;

      if (rig.type === "three") {
        rig.root.position.y = floatY;

        // --- A. Núcleo central apunta hacia el cursor ---
        const targetRotY = cursor.normX * CONFIG.coreMaxRotY;
        const targetRotX = -cursor.normY * CONFIG.coreMaxRotX;

        rig.coreGroup.rotation.y = targetRotY;
        rig.coreGroup.rotation.x = targetRotX;
        rig.coreGroup.rotation.z = reduced ? 0 : Math.sin(t * 0.9) * 0.06;

        // Rotación interna lenta de las facetas y contra-rotación de la jaula wireframe
        rig.shellMesh.rotation.y = t * 0.28 * speedMult + extraSpin * 0.35;
        rig.shellMesh.rotation.x = t * 0.18 * speedMult;

        rig.wireframeMesh.rotation.y = -t * 0.36 * speedMult - extraSpin * 0.5;
        rig.wireframeMesh.rotation.z = t * 0.22 * speedMult;
        rig.vertexNodesGroup.rotation.copy(rig.wireframeMesh.rotation);

        // Escala elástica del núcleo con respiración + pulso de energía al clic
        const breathScale = 1 + Math.sin(t * 2.6) * 0.025;
        const pulseScale = 1 + pulseIntensity * 0.16;
        rig.coreGroup.scale.setScalar(breathScale * pulseScale);
        rig.innerMesh.scale.setScalar(1 + pulseIntensity * 0.25);

        // Intensidad luminosa reactiva al pulso y a la cercanía del cursor
        const cursorEnergy = Math.hypot(cursor.normX, cursor.normY) * 0.25;
        rig.innerEnergyMat.emissiveIntensity = 0.85 + cursorEnergy + pulseIntensity * 1.65;
        rig.ringAccentMat.emissiveIntensity = 0.6 + cursorEnergy * 0.8 + pulseIntensity * 1.3;
        rig.wireframeMat.opacity = clamp(0.55 + cursorEnergy * 0.25 + pulseIntensity * 0.4, 0.3, 1);
        rig.corePointLight.intensity = 1.2 + pulseIntensity * 2.2;

        // --- B. Anillos giroscópicos con paralaje en distintas velocidades ---
        // Anillo 1 (Interior - paralaje fuerte y giro ágil)
        rig.ring1Pivot.rotation.x = 0.45 + t * 0.85 * speedMult + extraSpin * 1.15 - cursor.normY * 0.48;
        rig.ring1Pivot.rotation.y = -0.35 + t * 0.62 * speedMult + extraSpin * 0.8 + cursor.normX * 0.52;
        rig.ring1Pivot.rotation.z = 0.2 + t * 0.4 * speedMult;

        // Anillo 2 (Medio - gimbal estructural con paralaje invertido)
        rig.ring2Pivot.rotation.x = -0.62 - t * 0.48 * speedMult - extraSpin * 0.85 + cursor.normY * 0.32;
        rig.ring2Pivot.rotation.y = 0.48 + t * 0.54 * speedMult + extraSpin * 0.95 + cursor.normX * 0.36;
        rig.ring2Pivot.rotation.z = -0.15 - t * 0.32 * speedMult;

        // Anillo 3 (Exterior - órbita amplia y majestuosa)
        rig.ring3Pivot.rotation.x = 0.88 + t * 0.26 * speedMult + extraSpin * 0.55 - cursor.normY * 0.20;
        rig.ring3Pivot.rotation.y = 0.22 - t * 0.34 * speedMult - extraSpin * 0.65 - cursor.normX * 0.24;
        rig.ring3Pivot.rotation.z = -0.52 + t * 0.28 * speedMult;

        // --- C. Partículas flotantes con paralaje suave ---
        rig.particlesGroup.rotation.y = cursor.normX * 0.18 + t * 0.08 * speedMult;
        rig.particlesGroup.rotation.x = -cursor.normY * 0.14;
        rig.floatingParticles.forEach((p) => {
          p.mesh.position.y = p.baseY + Math.sin(t * 1.8 + p.phase) * 0.06;
        });

        // --- D. Onda expansiva al hacer clic ---
        if (state.isPulsing) {
          const waveScale = 1 + pulseProgress * 1.35;
          rig.pulseWaveMesh.scale.setScalar(waveScale);
          rig.pulseWaveMesh.rotation.x = targetRotX * 0.5;
          rig.pulseWaveMesh.rotation.y = targetRotY * 0.5;
          rig.pulseWaveMat.opacity = (1 - pulseProgress) * 0.78;
          rig.pulseWaveMesh.visible = true;
        } else {
          rig.pulseWaveMesh.visible = false;
        }

        // --- E. Sombra / resplandor inferior ---
        const shadowScale = 1 - floatY * 0.5 + pulseIntensity * 0.22;
        rig.shadowMesh.scale.set(shadowScale, shadowScale, 1);

        rig.render();
      } else {
        // Fallback SVG interactivo
        const tx = (cursor.normX * 14).toFixed(2);
        const ty = (-cursor.normY * 14).toFixed(2);
        rig.coreGroup.setAttribute("transform", `translate(${tx}, ${ty}) scale(${(1 + pulseIntensity * 0.14).toFixed(3)})`);
        rig.ring1.setAttribute("transform", `rotate(${(t * 28 + cursor.normX * 20).toFixed(1)})`);
        rig.ring2.setAttribute("transform", `rotate(${(-t * 18 + cursor.normY * 15).toFixed(1)})`);
        rig.ring3.setAttribute("transform", `rotate(${(t * 10 - cursor.normX * 10).toFixed(1)})`);
      }
    }

    /* ---------- Ciclo de animación ---------- */
    let rafId = null;
    function tick(now) {
      if (state.isInViewport) {
        const cursor = tracker.step(state.standbyWeight);
        applyToRig(now, cursor);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    /* ---------- Eventos ---------- */
    const onPointerMove = (e) => registerActivity(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      const touch = e.touches?.[0];
      if (touch) registerActivity(touch.clientX, touch.clientY);
      else registerActivity();
    };
    const onKeyOrScroll = () => registerActivity();
    const onCharacterClick = (e) => triggerPulse(e);
    const onCharacterKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerPulse(e);
      }
    };
    const onResize = () => rig.resize(container.clientWidth, container.clientHeight);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyOrScroll, { passive: true });
    window.addEventListener("scroll", onKeyOrScroll, { passive: true });
    window.addEventListener("resize", onResize);
    container.addEventListener("click", onCharacterClick);
    container.addEventListener("keydown", onCharacterKeyDown);

    let ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(() => rig.resize(container.clientWidth, container.clientHeight));
      ro.observe(container);
    }

    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            state.isInViewport = entry.isIntersecting;
          });
        },
        { threshold: 0.02 }
      );
      io.observe(container);
    }

    function destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("keydown", onKeyOrScroll);
      window.removeEventListener("scroll", onKeyOrScroll);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("click", onCharacterClick);
      container.removeEventListener("keydown", onCharacterKeyDown);
      ro?.disconnect();
      io?.disconnect();
      rig.dispose();
    }

    return { destroy };
  }

  return { init };
})();
