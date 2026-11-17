/* =================================================================
   MODULES / HEROCHARACTER.JS
   Cabeza 3D interactiva de pequeño oso caricaturesco (peluche digital)
   para el contenedor #heroCharacter.

   Características visuales (fiel a las referencias frontal y lateral):
     - Cabeza ovalada ensanchada horizontalmente, mejillas llenas, base
       suavemente aplanada, color naranja intenso y cálido con sombreado satinado.
     - Dos orejas grandes en forma de triángulos redondeados con borde
       exterior grueso naranja y cavidad interior crema ligeramente hundida.
     - Hocico ovalado ancho de color crema claro, voluminoso y sobresaliente
       en la zona central-inferior del rostro.
     - Dos ojos ovalados verticales de color negro muy oscuro y acabado
       satinado/brillante (sin iris ni pestañas), que siguen al cursor.
     - Nariz ovalada/triangular redondeada marrón chocolate brillante en
       la parte superior del hocico.
     - Boca minimalista en forma de Y invertida (línea vertical + dos
       diagonales cortas) que cambia a sonrisa al hacer clic.
   ================================================================= */
window.AC = window.AC || {};

AC.heroCharacter = (function () {
  const { $, prefersReducedMotion } = AC.utils;

  /* ── Constantes de configuración del personaje ── */
  const CONFIG = {
    inactivityMs: 10000,       // 10 s sin actividad para empezar a dormirse
    happyDurationMs: 840,      // duración de la animación de felicidad al clic (600-1000ms)
    eyeLerp: 0.16,             // suavizado de seguimiento (LERP)
    eyeMaxOffsetX: 0.095,      // desplazamiento máximo horizontal de los ojos (unidades 3D)
    eyeMaxOffsetY: 0.075,      // desplazamiento máximo vertical de los ojos (unidades 3D)
    blinkIntervalMin: 2800,    // intervalo mínimo entre parpadeos naturales (ms)
    blinkIntervalMax: 5800,    // intervalo máximo entre parpadeos naturales (ms)
    blinkDuration: 165,        // duración de un parpadeo (ms)
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

      // Ajusta la distancia de la cámara según la proporción del contenedor
      // para garantizar que ni las mejillas ni las orejas se recorten nunca
      function updateCameraFraming(w, h) {
        const aspect = w / h;
        camera.aspect = aspect;
        const baseZ = 5.45;
        camera.position.set(0, 0.06, aspect < 1 ? baseZ / Math.max(aspect, 0.65) : baseZ);
        camera.lookAt(0, 0.04, 0);
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

      /* ---------- Iluminación cálida para variaciones tonales naranjas ---------- */
      // Luz hemisférica: cálida clara arriba -> tono tostado más oscuro abajo
      const hemiLight = new THREE.HemisphereLight(0xfff6eb, 0x8a3b12, 0.92);
      hemiLight.position.set(0, 4, 2);
      scene.add(hemiLight);

      // Luz principal frontal-superior para resaltar frente, hocico y brillo de nariz/ojos
      const keyLight = new THREE.DirectionalLight(0xfffbf4, 0.72);
      keyLight.position.set(-1.6, 3.2, 4.6);
      scene.add(keyLight);

      // Luz de relleno suave derecha
      const fillLight = new THREE.DirectionalLight(0xffdfc2, 0.32);
      fillLight.position.set(2.8, -0.8, 2.8);
      scene.add(fillLight);

      /* ---------- Sombra suave debajo de la cabeza ---------- */
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = 128;
      shadowCanvas.height = 128;
      const sctx = shadowCanvas.getContext("2d");
      const grad = sctx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, "rgba(15, 10, 25, 0.42)");
      grad.addColorStop(0.55, "rgba(15, 10, 25, 0.15)");
      grad.addColorStop(1, "rgba(15, 10, 25, 0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 128, 128);

      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 2.0),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(0, -1.02, 0);
      scene.add(shadowMesh);

      /* ---------- Materiales satinados de juguete/peluche digital ---------- */
      const orangeMat = new THREE.MeshStandardMaterial({
        color: 0xf4812a, // naranja intenso y cálido
        roughness: 0.52,
        metalness: 0.02,
      });

      const creamMat = new THREE.MeshStandardMaterial({
        color: 0xf7dec1, // crema claro / beige cálido
        roughness: 0.56,
        metalness: 0.01,
      });

      const earInnerMat = new THREE.MeshStandardMaterial({
        color: 0xf3d4b0, // crema interior de la oreja con sombreado suave
        roughness: 0.62,
        metalness: 0.01,
      });

      const eyeMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c21, // negro carbón muy oscuro con acabado satinado brillante
        roughness: 0.22,
        metalness: 0.06,
      });

      const noseMat = new THREE.MeshStandardMaterial({
        color: 0x4b2818, // marrón chocolate oscuro brillante
        roughness: 0.24,
        metalness: 0.05,
      });

      const mouthMat = new THREE.MeshBasicMaterial({
        color: 0x3b2219, // marrón muy oscuro para la línea en Y invertida
      });

      /* ---------- Grupo raíz ---------- */
      const root = new THREE.Group();
      scene.add(root);

      const bodyGroup = new THREE.Group();
      root.add(bodyGroup);

      /* ---------- 1. CABEZA NARANJA ----------
         Forma circular ligeramente ovalada y ensanchada horizontalmente,
         mejillas redondeadas y parte inferior suavemente aplanada. */
      const headGeo = new THREE.SphereGeometry(1.0, 64, 64);
      const hPos = headGeo.attributes.position;
      const v = new THREE.Vector3();

      for (let i = 0; i < hPos.count; i++) {
        v.fromBufferAttribute(hPos, i);
        const y = v.y;

        // Ensanchamiento horizontal general
        v.x *= 1.18;
        // Volumen anteroposterior compacto pero redondeado (como en la vista lateral)
        v.z *= 0.96;

        if (y < 0) {
          // Mejillas anchas y redondeadas en la mitad inferior
          const cheekBulge = Math.sin(clamp(-y, 0, 1) * Math.PI * 0.88);
          v.x *= 1 + 0.11 * cheekBulge;
          v.z *= 1 + 0.04 * cheekBulge;

          // Base inferior suavemente aplanada
          if (y < -0.52) {
            v.y = -0.52 + (y + 0.52) * 0.36;
          }
        } else {
          // Domo superior redondeado y compacto
          v.y *= 0.88;
          v.x *= 1 - 0.04 * y * y;
        }

        hPos.setXYZ(i, v.x, v.y, v.z);
      }
      headGeo.computeVertexNormals();

      const headMesh = new THREE.Mesh(headGeo, orangeMat);
      bodyGroup.add(headMesh);

      /* ---------- 2. OREJAS GRANDES (Triángulos redondeados con cavidad crema) ---------- */
      function buildEar(side) {
        // side: -1 (izquierda), +1 (derecha)
        const earGroup = new THREE.Group();

        // Geometría exterior naranja: esfera deformada en triángulo redondeado grueso
        const outerGeo = new THREE.SphereGeometry(0.52, 48, 48);
        const oPos = outerGeo.attributes.position;
        const p = new THREE.Vector3();

        for (let i = 0; i < oPos.count; i++) {
          p.fromBufferAttribute(oPos, i);
          // ny va de 0 (base) a 1 (punta redondeada)
          const ny = (p.y + 0.52) / 1.04;
          // Se estrecha suavemente hacia arriba manteniendo la punta ancha y redonda
          const widthFactor = 1.12 - 0.52 * Math.pow(clamp(ny, 0, 1), 1.25);
          p.x *= widthFactor;
          p.y *= 1.06;

          // Espesor lateral redondeado (como en la referencia lateral) y leve concavidad frontal
          p.z *= 0.36 * (1 - 0.18 * ny);
          if (p.z > 0) {
            const r2 = p.x * p.x + (p.y + 0.05) * (p.y + 0.05);
            const indent = Math.max(0, 1 - r2 / 0.16);
            p.z -= indent * 0.045;
          }
          oPos.setXYZ(i, p.x, p.y, p.z);
        }
        outerGeo.computeVertexNormals();
        const outerMesh = new THREE.Mesh(outerGeo, orangeMat);
        earGroup.add(outerMesh);

        // Cavidad interior de color crema claro, ligeramente hundida dentro del borde naranja
        const innerGeo = new THREE.SphereGeometry(0.39, 40, 40);
        const iPos = innerGeo.attributes.position;
        for (let i = 0; i < iPos.count; i++) {
          p.fromBufferAttribute(iPos, i);
          const ny = (p.y + 0.39) / 0.78;
          const widthFactor = 1.08 - 0.54 * Math.pow(clamp(ny, 0, 1), 1.25);
          p.x *= widthFactor;
          p.y *= 1.04;
          p.z *= 0.22;
          // Hundimiento suave en el centro para dar volumen cóncavo
          if (p.z > 0) {
            const r2 = p.x * p.x + p.y * p.y;
            const cup = Math.max(0, 1 - r2 / 0.11);
            p.z -= cup * 0.032;
          }
          iPos.setXYZ(i, p.x, p.y, p.z);
        }
        innerGeo.computeVertexNormals();
        const innerMesh = new THREE.Mesh(innerGeo, earInnerMat);
        innerMesh.position.set(0, -0.03, 0.095);
        earGroup.add(innerMesh);

        // Posición y orientación simétrica en la parte superior de la cabeza
        earGroup.position.set(side * 0.68, 0.68, -0.04);
        earGroup.rotation.z = -side * 0.36;
        earGroup.rotation.y = side * 0.12;
        earGroup.rotation.x = 0.04;

        bodyGroup.add(earGroup);
        return earGroup;
      }

      const leftEar = buildEar(-1);
      const rightEar = buildEar(1);

      /* ---------- 3. HOCICO OVALADO CREMA CLARO ----------
         Pieza ovalada ancha en la región central-inferior, sobresaliente
         (tal como se aprecia en la vista lateral). */
      const muzzleGroup = new THREE.Group();
      muzzleGroup.position.set(0, -0.26, 0.80);
      bodyGroup.add(muzzleGroup);

      const muzzleGeo = new THREE.SphereGeometry(0.49, 48, 48);
      const mPos = muzzleGeo.attributes.position;
      for (let i = 0; i < mPos.count; i++) {
        v.fromBufferAttribute(mPos, i);
        v.x *= 1.16;
        v.y *= 0.86;
        v.z *= 0.76;
        // Parte inferior suavemente redondeada siguiendo la barbilla
        if (v.y < -0.22) {
          v.y = -0.22 + (v.y + 0.22) * 0.68;
        }
        mPos.setXYZ(i, v.x, v.y, v.z);
      }
      muzzleGeo.computeVertexNormals();
      const muzzleMesh = new THREE.Mesh(muzzleGeo, creamMat);
      muzzleGroup.add(muzzleMesh);

      /* ---------- 4. NARIZ MARRÓN CHOCOLATE BRILLANTE ----------
         Ubicada en la parte superior central del hocico, forma ovalada
         horizontal / triángulo muy redondeado (ancha arriba, más estrecha abajo). */
      const noseGeo = new THREE.SphereGeometry(0.185, 40, 40);
      const nPos = noseGeo.attributes.position;
      for (let i = 0; i < nPos.count; i++) {
        v.fromBufferAttribute(nPos, i);
        const ny = v.y / 0.185; // -1 abajo, +1 arriba
        // Más ancha en la mitad superior y suavemente más estrecha abajo
        const topWiden = 1.24 + 0.22 * Math.sin((ny + 0.35) * 1.2);
        v.x *= topWiden;
        v.y *= 0.82;
        v.z *= 0.68;
        nPos.setXYZ(i, v.x, v.y, v.z);
      }
      noseGeo.computeVertexNormals();
      const noseMesh = new THREE.Mesh(noseGeo, noseMat);
      noseMesh.position.set(0, 0.145, 0.34);
      noseMesh.rotation.x = -0.14;
      muzzleGroup.add(noseMesh);

      /* ---------- 5. BOCA MINIMALISTA (Y invertida) ----------
         Línea vertical fina desde la nariz que se divide en dos pequeñas
         líneas diagonales. Incluye variante sonriente al hacer clic. */
      const mouthGroup = new THREE.Group();
      mouthGroup.position.set(0, -0.02, 0.365);
      muzzleGroup.add(mouthGroup);

      function makeSegment(length, radius, x, y, z, rotZ) {
        const geo = new THREE.CylinderGeometry(radius, radius, length, 12);
        const mesh = new THREE.Mesh(geo, mouthMat);
        mesh.position.set(x, y, z);
        mesh.rotation.z = rotZ;
        return mesh;
      }

      // Boca neutral (Y invertida fiel a la imagen)
      const neutralMouth = new THREE.Group();
      const stem = makeSegment(0.16, 0.0085, 0, -0.04, 0, 0);
      const leftFork = makeSegment(0.085, 0.009, -0.036, -0.135, -0.004, -1.12);
      const rightFork = makeSegment(0.085, 0.009, 0.036, -0.135, -0.004, 1.12);
      neutralMouth.add(stem, leftFork, rightFork);
      mouthGroup.add(neutralMouth);

      // Boca feliz (pequeña sonrisa curva debajo de la línea vertical)
      const happyMouth = new THREE.Group();
      const happyStem = makeSegment(0.11, 0.009, 0, -0.015, 0, 0);
      const smileArcGeo = new THREE.TorusGeometry(0.095, 0.012, 12, 28, Math.PI);
      const smileArc = new THREE.Mesh(smileArcGeo, mouthMat);
      smileArc.rotation.z = Math.PI;
      smileArc.position.set(0, -0.07, 0);
      happyMouth.add(happyStem, smileArc);
      happyMouth.visible = false;
      mouthGroup.add(happyMouth);

      /* ---------- 6. OJOS NEGROS OVALADOS VERTICALES ----------
         Dos pequeñas piezas ovaladas de color negro muy oscuro y acabado
         satinado brillante, sin iris ni pestañas, que se desplazan
         coordinadamente siguiendo la dirección del cursor. */
      function buildEye(side) {
        const anchor = new THREE.Group();
        const baseX = side * 0.255;
        const baseY = 0.075;
        const baseZ = 0.945;
        anchor.position.set(baseX, baseY, baseZ);

        // Grupo móvil del ojo que se desplaza sobre la superficie frontal del rostro
        const eyeMover = new THREE.Group();
        anchor.add(eyeMover);

        const eyeGeo = new THREE.SphereGeometry(0.105, 32, 32);
        eyeGeo.scale(0.84, 1.15, 0.48); // orientación vertical redondeada
        const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
        eyeMover.add(eyeMesh);

        // Línea curva para cuando cierra los ojos (sueño / clic feliz)
        const closedArcGeo = new THREE.TorusGeometry(0.082, 0.016, 12, 24, Math.PI);
        const closedArcMesh = new THREE.Mesh(closedArcGeo, eyeMat);
        closedArcMesh.position.set(0, 0, 0.03);
        closedArcMesh.visible = false;
        eyeMover.add(closedArcMesh);

        bodyGroup.add(anchor);
        return { anchor, eyeMover, eyeMesh, closedArcMesh, baseX, baseY, baseZ };
      }

      const leftEye = buildEye(-1);
      const rightEye = buildEye(1);

      return {
        type: "three",
        renderer,
        scene,
        camera,
        root,
        bodyGroup,
        shadowMesh,
        leftEar,
        rightEar,
        muzzleGroup,
        noseMesh,
        leftEye,
        rightEye,
        neutralMouth,
        happyMouth,
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
     FALLBACK INTERACTIVO (si WebGL o Three.js no estuvieran disponibles)
     ================================================================= */
  function createFallbackRig(container) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 400 440");
    svg.setAttribute("class", "hero-char__svg");
    svg.setAttribute("aria-hidden", "true");

    svg.innerHTML = `
      <defs>
        <radialGradient id="bearHeadGrad" cx="45%" cy="28%" r="65%">
          <stop offset="0%" stop-color="#ff9b42"/>
          <stop offset="65%" stop-color="#f27d24"/>
          <stop offset="100%" stop-color="#c95b12"/>
        </radialGradient>
        <radialGradient id="bearCreamGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff3e2"/>
          <stop offset="70%" stop-color="#f5dbb9"/>
          <stop offset="100%" stop-color="#d9b58c"/>
        </radialGradient>
        <radialGradient id="bearNoseGrad" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#754632"/>
          <stop offset="55%" stop-color="#4b2818"/>
          <stop offset="100%" stop-color="#2b140a"/>
        </radialGradient>
      </defs>
      <g id="hcBodyGroup" transform="translate(200, 235)">
        <!-- Orejas -->
        <g transform="translate(-95, -95) rotate(-22)">
          <path d="M -52 40 C -58 -25, -24 -68, 0 -68 C 24 -68, 58 -25, 52 40 Z" fill="url(#bearHeadGrad)"/>
          <path d="M -36 32 C -40 -14, -17 -46, 0 -46 C 17 -46, 40 -14, 36 32 Z" fill="#f3d4b0"/>
        </g>
        <g transform="translate(95, -95) rotate(22)">
          <path d="M -52 40 C -58 -25, -24 -68, 0 -68 C 24 -68, 58 -25, 52 40 Z" fill="url(#bearHeadGrad)"/>
          <path d="M -36 32 C -40 -14, -17 -46, 0 -46 C 17 -46, 40 -14, 36 32 Z" fill="#f3d4b0"/>
        </g>
        <!-- Cabeza -->
        <path d="M 0 -115 C 95 -115, 148 -55, 148 22 C 148 82, 108 112, 0 112 C -108 112, -148 82, -148 22 C -148 -55, -95 -115, 0 -115 Z" fill="url(#bearHeadGrad)"/>
        <!-- Hocico -->
        <ellipse cx="0" cy="42" rx="68" ry="52" fill="#f7dec1"/>
        <!-- Ojos -->
        <g id="hcEyeGroup">
          <ellipse id="hcEyeL" cx="-36" cy="-12" rx="13" ry="17" fill="#1c1c21"/>
          <ellipse id="hcEyeR" cx="36" cy="-12" rx="13" ry="17" fill="#1c1c21"/>
        </g>
        <!-- Nariz -->
        <path d="M -32 16 C -32 2, 32 2, 32 16 C 32 32, 12 42, 0 42 C -12 42, -32 32, -32 16 Z" fill="url(#bearNoseGrad)"/>
        <!-- Boca Y invertida -->
        <path id="hcMouth" d="M 0 42 L 0 66 M 0 66 L -12 73 M 0 66 L 12 73" stroke="#3b2219" stroke-width="3" stroke-linecap="round" fill="none"/>
      </g>
    `;
    container.appendChild(svg);

    return {
      type: "svg",
      svg,
      bodyGroup: svg.querySelector("#hcBodyGroup"),
      eyeGroup: svg.querySelector("#hcEyeGroup"),
      resize() {},
      render() {},
      dispose() {
        svg.remove();
      },
    };
  }

  /* =================================================================
     2. SEGUIMIENTO DE LOS OJOS (EyeTracker)
     Calcula la dirección hacia el cursor respecto al centro del oso,
     desplazando coordinadamente ambos ojos con interpolación suave.
     ================================================================= */
  function createEyeTracker(container) {
    const state = {
      targetX: 0, // rango normalizado [-1, 1]
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    function updateTargetFromPoint(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.47;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      const refRadius = Math.max(rect.width, rect.height) * 0.75;
      const strength = Math.tanh(dist / refRadius);
      const angle = Math.atan2(dy, dx);

      state.targetX = Math.cos(angle) * strength;
      state.targetY = -Math.sin(angle) * strength; // +Y es arriba en 3D
    }

    function step(sleepingWeight) {
      const tx = sleepingWeight > 0.5 ? 0 : state.targetX * (1 - sleepingWeight);
      const ty = sleepingWeight > 0.5 ? 0 : state.targetY * (1 - sleepingWeight);

      state.currentX = lerp(state.currentX, tx, CONFIG.eyeLerp);
      state.currentY = lerp(state.currentY, ty, CONFIG.eyeLerp);

      const mag = Math.hypot(state.currentX, state.currentY);
      if (mag > 1) {
        state.currentX /= mag;
        state.currentY /= mag;
      }

      return {
        x: state.currentX * CONFIG.eyeMaxOffsetX,
        y: state.currentY * CONFIG.eyeMaxOffsetY,
        normX: state.currentX,
        normY: state.currentY,
      };
    }

    return { updateTargetFromPoint, step };
  }

  /* =================================================================
     3. SISTEMA DE INACTIVIDAD Y ESTADOS (despierto / dormido / feliz)
     ================================================================= */
  function init() {
    const container = $("#heroCharacter");
    if (!container) return;

    const rig = createThreeRig(container) || createFallbackRig(container);
    const eyeTracker = createEyeTracker(container);

    requestAnimationFrame(() => {
      rig.resize(container.clientWidth, container.clientHeight);
    });

    const state = {
      mode: "awake",          // "awake" | "sleeping" | "happy"
      sleepWeight: 0,         // 0 = despierto, 1 = completamente dormido
      happyWeight: 0,         // 0 = normal, 1 = pico de felicidad
      happyStartTime: 0,
      isAnimatingHappy: false,
      blinkWeight: 0,
      nextBlinkTime: performance.now() + 2400,
      blinkStartTime: 0,
      isBlinking: false,
      lastActivityTime: performance.now(),
      isInViewport: true,
    };

    function setSleeping(sleeping) {
      if (sleeping && state.mode !== "sleeping" && !state.isAnimatingHappy) {
        state.mode = "sleeping";
        container.classList.add("is-sleeping");
      } else if (!sleeping && state.mode === "sleeping") {
        state.mode = "awake";
        container.classList.remove("is-sleeping");
      }
    }

    function registerActivity(clientX, clientY) {
      state.lastActivityTime = performance.now();
      if (typeof clientX === "number" && typeof clientY === "number") {
        eyeTracker.updateTargetFromPoint(clientX, clientY);
      }
      if (state.mode === "sleeping") {
        setSleeping(false);
      }
    }

    function triggerHappy(e) {
      if (e) e.stopPropagation();
      state.lastActivityTime = performance.now();
      setSleeping(false);

      if (state.isAnimatingHappy) return;
      state.isAnimatingHappy = true;
      state.mode = "happy";
      state.happyStartTime = performance.now();
    }

    function applyToRig(now, eyeOffset) {
      const reduced = prefersReducedMotion();
      const t = now * 0.001;

      // 1. Transición progresiva de sueño (10s de inactividad)
      if (!state.isAnimatingHappy && now - state.lastActivityTime >= CONFIG.inactivityMs) {
        setSleeping(true);
      }
      const targetSleep = state.mode === "sleeping" ? 1 : 0;
      state.sleepWeight = lerp(state.sleepWeight, targetSleep, state.mode === "sleeping" ? 0.035 : 0.09);

      // 2. Progreso de la animación de felicidad al hacer clic
      let happyBounceY = 0;
      let happySquashX = 1;
      let happySquashY = 1;
      let earWiggle = 0;

      if (state.isAnimatingHappy) {
        const elapsed = now - state.happyStartTime;
        const p = clamp(elapsed / CONFIG.happyDurationMs, 0, 1);

        state.happyWeight = Math.sin(p * Math.PI);

        if (!reduced) {
          happyBounceY = Math.sin(p * Math.PI) * 0.15 * (1 - p * 0.35);
          const squashWave = Math.sin(p * Math.PI * 2.2) * (1 - p);
          happySquashX = 1 - squashWave * 0.055;
          happySquashY = 1 + squashWave * 0.065;
          earWiggle = Math.sin(p * Math.PI * 4) * 0.09 * (1 - p);
        }

        if (p >= 1) {
          state.isAnimatingHappy = false;
          state.happyWeight = 0;
          state.mode = "awake";
        }
      } else {
        state.happyWeight = lerp(state.happyWeight, 0, 0.15);
      }

      // 3. Parpadeo natural y aleatorio cuando está despierto
      if (state.sleepWeight < 0.15 && !state.isAnimatingHappy) {
        if (!state.isBlinking && now >= state.nextBlinkTime) {
          state.isBlinking = true;
          state.blinkStartTime = now;
        }
        if (state.isBlinking) {
          const bp = (now - state.blinkStartTime) / CONFIG.blinkDuration;
          if (bp >= 1) {
            state.isBlinking = false;
            state.blinkWeight = 0;
            state.nextBlinkTime =
              now +
              CONFIG.blinkIntervalMin +
              Math.random() * (CONFIG.blinkIntervalMax - CONFIG.blinkIntervalMin);
          } else {
            state.blinkWeight = Math.sin(bp * Math.PI);
          }
        }
      } else {
        state.isBlinking = false;
        state.blinkWeight = 0;
      }

      // 4. Respiración orgánica y postura
      const breathSpeed = lerp(2.0, 1.15, state.sleepWeight);
      const breathAmp = reduced ? 0 : lerp(0.015, 0.024, state.sleepWeight);
      const breath = Math.sin(t * breathSpeed) * breathAmp;

      const sleepDropY = -0.05 * state.sleepWeight;
      const sleepTiltX = 0.11 * state.sleepWeight;
      const sleepTiltZ = -0.04 * state.sleepWeight;

      // Micro-orientación sutil acompañando la mirada
      const subtleTurnY = eyeOffset.normX * 0.08 * (1 - state.sleepWeight);
      const subtleTurnX = -eyeOffset.normY * 0.055 * (1 - state.sleepWeight);

      const eyeClose = clamp(
        Math.max(state.blinkWeight, state.sleepWeight, state.happyWeight * 0.95),
        0,
        1
      );

      if (rig.type === "three") {
        // --- Cabeza ---
        rig.bodyGroup.position.y = breath * 0.6 + sleepDropY + happyBounceY;
        rig.bodyGroup.scale.set(
          (1 - breath * 0.4) * happySquashX,
          (1 + breath) * happySquashY,
          (1 - breath * 0.4) * happySquashX
        );
        rig.bodyGroup.rotation.set(
          sleepTiltX + subtleTurnX,
          subtleTurnY,
          sleepTiltZ + (reduced ? 0 : Math.sin(t * 0.85) * 0.01)
        );

        // Orejas con micro-movimiento al alegrarse o dormir
        rig.leftEar.rotation.z = 0.36 + earWiggle - state.sleepWeight * 0.05;
        rig.rightEar.rotation.z = -0.36 - earWiggle + state.sleepWeight * 0.05;

        // Sombra
        const shadowScale = 1 - happyBounceY * 0.4 + breath * 0.4;
        rig.shadowMesh.scale.set(shadowScale, shadowScale, 1);

        // --- Seguimiento de los ojos ---
        [rig.leftEye, rig.rightEye].forEach((eye) => {
          eye.eyeMover.position.x = eyeOffset.x;
          eye.eyeMover.position.y = eyeOffset.y;
          // Ajuste leve en Z para acompañar la curvatura frontal al moverse a los lados
          eye.eyeMover.position.z = -Math.abs(eyeOffset.x) * 0.14;

          const openFactor = clamp(1 - eyeClose, 0.08, 1);
          eye.eyeMesh.scale.set(0.84, 1.15 * openFactor, 0.48);
          eye.eyeMesh.visible = eyeClose < 0.76;

          eye.closedArcMesh.visible = eyeClose >= 0.72;
          if (eye.closedArcMesh.visible) {
            eye.closedArcMesh.rotation.z = state.happyWeight > 0.45 ? 0 : Math.PI;
          }
        });

        // El hocico y la nariz acompañan sutilmente el ángulo de mirada para dar vida
        rig.muzzleGroup.position.x = eyeOffset.x * 0.22;
        rig.muzzleGroup.position.y = -0.26 + eyeOffset.y * 0.15;

        // --- Boca: Y invertida neutral vs sonrisa al hacer clic ---
        const isHappyMouth = state.happyWeight > 0.35;
        rig.neutralMouth.visible = !isHappyMouth;
        rig.happyMouth.visible = isHappyMouth;

        rig.render();
      } else {
        const px = (eyeOffset.normX * 8).toFixed(2);
        const py = (-eyeOffset.normY * 6.5).toFixed(2);
        rig.eyeGroup.setAttribute("transform", `translate(${px}, ${py})`);
      }
    }

    /* ---------- 5. Ciclo único de animación (requestAnimationFrame) ---------- */
    let rafId = null;
    function tick(now) {
      if (state.isInViewport) {
        const eyeOffset = eyeTracker.step(state.sleepWeight);
        applyToRig(now, eyeOffset);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    /* ---------- Eventos de interacción y limpieza ---------- */
    const onPointerMove = (e) => registerActivity(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      const touch = e.touches?.[0];
      if (touch) registerActivity(touch.clientX, touch.clientY);
      else registerActivity();
    };
    const onKeyOrScroll = () => registerActivity();
    const onCharacterClick = (e) => triggerHappy(e);
    const onCharacterKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerHappy(e);
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

    return { destroy, triggerHappy };
  }

  return { init };
})();
