import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const concepts = [
  {
    id: "superposition",
    name: "Superposition",
    description:
      "A quantum state can be a blend of multiple possibilities until measurement collapses it.",
    grade8:
      "Think of a coin spinning in the air: it is kind of both heads and tails until it lands. Quantum stuff can be in more than one state like that until we measure it.",
    sliderLabel: "Phase Coherence",
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 70,
    sliderUnit: "%",
    sliderValue(v) {
      return `${v}${this.sliderUnit}`;
    },
  },
  {
    id: "duality",
    name: "Wave-Particle Duality",
    description:
      "Quantum objects show interference like waves while still producing localized particle detections.",
    grade8:
      "Electrons can act like tiny balls and also like ripples in water. Which behavior you see depends on how you test them.",
    sliderLabel: "Wave Amplitude",
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 55,
    sliderUnit: "%",
    sliderValue(v) {
      return `${v}${this.sliderUnit}`;
    },
  },
  {
    id: "uncertainty",
    name: "Uncertainty Principle",
    description:
      "Increasing position precision broadens momentum spread; both cannot be arbitrarily sharp together.",
    grade8:
      "If you try super hard to know exactly where a particle is, you become less sure about how fast and where it is moving. Nature makes you trade one for the other.",
    sliderLabel: "Position Precision",
    sliderMin: 1,
    sliderMax: 100,
    sliderDefault: 60,
    sliderUnit: "%",
    sliderValue(v) {
      return `${v}${this.sliderUnit}`;
    },
  },
  {
    id: "entanglement",
    name: "Entanglement",
    description:
      "Separated particles can share correlated states that act like one linked quantum system.",
    grade8:
      "Two particles can be connected like matching magic dice. Roll one, and the other result is linked right away, even if it is far away.",
    sliderLabel: "Correlation Strength",
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 85,
    sliderUnit: "%",
    sliderValue(v) {
      return `${v}${this.sliderUnit}`;
    },
  },
  {
    id: "tunneling",
    name: "Quantum Tunneling",
    description:
      "Particles have non-zero probability to appear beyond barriers they classically could not cross.",
    grade8:
      "A particle can sometimes sneak through a wall instead of going over it, like a ghost walking through a door that should be locked.",
    sliderLabel: "Barrier Opacity",
    sliderMin: 10,
    sliderMax: 100,
    sliderDefault: 60,
    sliderUnit: "%",
    sliderValue(v) {
      return `${v}${this.sliderUnit}`;
    },
  },
];

const canvas = document.getElementById("scene");
const conceptButtons = document.getElementById("concept-buttons");
const titleEl = document.getElementById("concept-title");
const descriptionEl = document.getElementById("concept-description");
const sliderEl = document.getElementById("concept-slider");
const sliderLabelEl = document.getElementById("slider-label");
const sliderValueEl = document.getElementById("slider-value");
const explainToggleEl = document.getElementById("explain-toggle");
const gradeExplanationEl = document.getElementById("grade-explanation");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x081225, 10, 36);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
camera.position.set(0, 2.6, 8.5);
camera.lookAt(0, 1.15, 0);

const ambient = new THREE.AmbientLight(0xd8f1ff, 0.75);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
keyLight.position.set(5, 9, 7);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x5cc8ff, 1.8, 36, 2);
fillLight.position.set(-4, 2, 3);
scene.add(fillLight);

const root = new THREE.Group();
root.position.y = 1.05;
scene.add(root);

let activeConcept = concepts[0];
let activeObject = null;
let particles = [];
let animationTime = 0;
let showGradeExplanation = false;

concepts.forEach((concept, index) => {
  const button = document.createElement("button");
  button.textContent = `${index + 1}. ${concept.name}`;
  button.addEventListener("click", () => setConcept(concept.id));
  button.dataset.id = concept.id;
  conceptButtons.appendChild(button);
});

sliderEl.addEventListener("input", () => {
  sliderValueEl.textContent = activeConcept.sliderValue(sliderEl.value);
  rebuildScene();
});

explainToggleEl.addEventListener("click", () => {
  showGradeExplanation = !showGradeExplanation;
  syncGradeExplanation();
});

window.addEventListener("resize", resize);

function resize() {
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const h = parent.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function clearRoot() {
  while (root.children.length) {
    const child = root.children.pop();
    disposeNode(child);
  }
  particles = [];
}

function disposeNode(node) {
  if (!node) {
    return;
  }
  if (node.geometry) {
    node.geometry.dispose();
  }
  if (node.material) {
    if (Array.isArray(node.material)) {
      node.material.forEach((m) => m.dispose());
    } else {
      node.material.dispose();
    }
  }
  if (node.children) {
    node.children.forEach((child) => disposeNode(child));
  }
}

function setConcept(id) {
  const concept = concepts.find((c) => c.id === id);
  if (!concept) {
    return;
  }

  activeConcept = concept;
  [...conceptButtons.children].forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.id === id);
  });

  titleEl.textContent = concept.name;
  descriptionEl.textContent = concept.description;
  sliderLabelEl.textContent = concept.sliderLabel;
  sliderEl.min = String(concept.sliderMin);
  sliderEl.max = String(concept.sliderMax);
  sliderEl.value = String(concept.sliderDefault);
  sliderValueEl.textContent = concept.sliderValue(concept.sliderDefault);
  syncGradeExplanation();

  rebuildScene();
}

function syncGradeExplanation() {
  explainToggleEl.setAttribute("aria-pressed", String(showGradeExplanation));
  explainToggleEl.textContent = showGradeExplanation
    ? "Hide 8th Grade Explanation"
    : "Show 8th Grade Explanation";

  gradeExplanationEl.hidden = !showGradeExplanation;
  gradeExplanationEl.textContent = activeConcept.grade8;
}

function rebuildScene() {
  clearRoot();
  const value = Number(sliderEl.value) / 100;

  switch (activeConcept.id) {
    case "superposition":
      activeObject = buildSuperposition(value);
      break;
    case "duality":
      activeObject = buildDuality(value);
      break;
    case "uncertainty":
      activeObject = buildUncertainty(value);
      break;
    case "entanglement":
      activeObject = buildEntanglement(value);
      break;
    case "tunneling":
      activeObject = buildTunneling(value);
      break;
    default:
      activeObject = null;
  }

  if (activeObject) {
    root.add(activeObject);
  }
}

function buildSuperposition(coherence) {
  const group = new THREE.Group();
  const states = [
    { x: -1.6, color: 0xff6b6b },
    { x: 1.6, color: 0x4dabf7 },
  ];

  states.forEach((state, idx) => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: state.color,
      transparent: true,
      opacity: 0.24 + coherence * 0.52,
      roughness: 0.25,
      metalness: 0.1,
      transmission: 0.2,
      thickness: 0.6,
    });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(1.05, 38, 38), mat);
    orb.position.set(state.x, 0.1, 0);
    orb.userData.phaseOffset = idx * Math.PI;
    group.add(orb);
    particles.push(orb);
  });

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.44, 2),
    new THREE.MeshStandardMaterial({ color: 0xfff4d5, emissive: 0xffd45e, emissiveIntensity: 1.2 })
  );
  group.add(core);

  return group;
}

function buildDuality(amplitude) {
  const group = new THREE.Group();

  const wavePoints = [];
  const width = 6.4;
  const segments = 240;
  for (let i = 0; i <= segments; i += 1) {
    const x = (i / segments) * width - width / 2;
    const y = Math.sin(x * 3.8) * (0.4 + amplitude * 1.1);
    wavePoints.push(new THREE.Vector3(x, y, -0.9));
  }

  const curve = new THREE.CatmullRomCurve3(wavePoints);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 380, 0.045, 10, false),
    new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0ea5e9, emissiveIntensity: 0.5 })
  );
  group.add(tube);

  const count = 34;
  const geometry = new THREE.SphereGeometry(0.08, 14, 14);
  const material = new THREE.MeshStandardMaterial({ color: 0xfff3bf, roughness: 0.35 });

  for (let i = 0; i < count; i += 1) {
    const p = new THREE.Mesh(geometry, material);
    p.userData.phase = (i / count) * Math.PI * 2;
    p.position.x = (i / (count - 1)) * 6 - 3;
    group.add(p);
    particles.push(p);
  }

  return group;
}

function buildUncertainty(precision) {
  const group = new THREE.Group();

  const xSpread = THREE.MathUtils.lerp(1.8, 0.28, precision);
  const pSpread = THREE.MathUtils.lerp(0.25, 1.95, precision);

  const posCloud = new THREE.Group();
  const momentumCloud = new THREE.Group();

  const cloudGeo = new THREE.SphereGeometry(0.085, 10, 10);

  for (let i = 0; i < 70; i += 1) {
    const posDot = new THREE.Mesh(
      cloudGeo,
      new THREE.MeshStandardMaterial({ color: 0x34d399, transparent: true, opacity: 0.78 })
    );
    posDot.position.set(
      THREE.MathUtils.randFloatSpread(xSpread),
      THREE.MathUtils.randFloatSpread(0.85),
      THREE.MathUtils.randFloatSpread(0.75) - 1.2
    );
    posCloud.add(posDot);

    const pDot = new THREE.Mesh(
      cloudGeo,
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.78 })
    );
    pDot.position.set(
      THREE.MathUtils.randFloatSpread(pSpread),
      THREE.MathUtils.randFloatSpread(0.85),
      THREE.MathUtils.randFloatSpread(0.75) + 1.2
    );
    momentumCloud.add(pDot);
  }

  const divider = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 2.1, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0x334155, emissiveIntensity: 0.8 })
  );

  group.add(posCloud);
  group.add(momentumCloud);
  group.add(divider);
  particles.push(posCloud, momentumCloud);

  return group;
}

function buildEntanglement(correlation) {
  const group = new THREE.Group();

  const left = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xfb7185, emissive: 0xf43f5e, emissiveIntensity: 0.9 })
  );
  const right = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.9 })
  );
  left.position.x = -2.35;
  right.position.x = 2.35;

  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-2.2, 0, 0),
    new THREE.Vector3(-0.7, 1.8, 0),
    new THREE.Vector3(0.7, -1.8, 0),
    new THREE.Vector3(2.2, 0, 0)
  );

  const link = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 160, 0.08 + correlation * 0.16, 16, false),
    new THREE.MeshPhysicalMaterial({
      color: 0xa5b4fc,
      emissive: 0x818cf8,
      emissiveIntensity: 0.7 + correlation,
      transparent: true,
      opacity: 0.45 + correlation * 0.4,
      roughness: 0.18,
    })
  );

  group.add(left, right, link);
  particles.push(left, right, link);
  return group;
}

function buildTunneling(opacityControl) {
  const group = new THREE.Group();

  const barrierOpacity = THREE.MathUtils.clamp(opacityControl + 0.08, 0.2, 0.98);
  const barrier = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 3.1, 2),
    new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: barrierOpacity,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    })
  );

  const incoming = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 26, 26),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.1 })
  );
  incoming.position.set(-3.1, 0, 0);

  const tunneled = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 20, 20),
    new THREE.MeshStandardMaterial({
      color: 0x86efac,
      emissive: 0x22c55e,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: THREE.MathUtils.lerp(0.2, 0.9, 1 - opacityControl),
    })
  );
  tunneled.position.set(2.6, 0.4, 0);

  group.add(barrier, incoming, tunneled);
  particles.push(incoming, tunneled);

  return group;
}

function animate() {
  requestAnimationFrame(animate);
  animationTime += 0.012;

  if (activeConcept.id === "superposition") {
    particles.forEach((p, idx) => {
      p.position.y = Math.sin(animationTime * 1.8 + p.userData.phaseOffset) * 0.22;
      p.scale.setScalar(1 + 0.06 * Math.sin(animationTime * 3 + idx));
      p.rotation.y += 0.009;
    });
    if (activeObject?.children[2]) {
      activeObject.children[2].rotation.y += 0.018;
    }
  }

  if (activeConcept.id === "duality") {
    particles.forEach((p, idx) => {
      const x = p.position.x;
      p.position.y = Math.sin(x * 3.8 + animationTime * 4.5) * 0.8;
      p.position.z = Math.cos(x * 1.7 + animationTime * 2.4) * 0.24;
      p.scale.setScalar(0.8 + 0.3 * Math.sin(animationTime * 3 + idx));
    });
  }

  if (activeConcept.id === "uncertainty") {
    particles.forEach((cluster, idx) => {
      cluster.rotation.y += idx === 0 ? 0.004 : -0.004;
      cluster.rotation.x = Math.sin(animationTime * 0.8) * 0.12;
    });
  }

  if (activeConcept.id === "entanglement") {
    if (particles[0] && particles[1]) {
      const osc = Math.sin(animationTime * 1.9) * 0.45;
      particles[0].position.y = osc;
      particles[1].position.y = -osc;
      particles[0].rotation.y += 0.015;
      particles[1].rotation.y -= 0.015;
    }
    if (particles[2]) {
      particles[2].rotation.z += 0.01;
    }
  }

  if (activeConcept.id === "tunneling") {
    const incoming = particles[0];
    const tunneled = particles[1];

    if (incoming && tunneled) {
      const t = (Math.sin(animationTime * 1.8) + 1) / 2;
      incoming.position.x = THREE.MathUtils.lerp(-3.1, -0.8, t);
      tunneled.position.x = THREE.MathUtils.lerp(0.95, 2.85, t);
      tunneled.material.opacity = THREE.MathUtils.lerp(0.2, 0.92, t);
    }
  }

  root.rotation.y += 0.003;
  renderer.render(scene, camera);
}

setConcept("superposition");
resize();
animate();
