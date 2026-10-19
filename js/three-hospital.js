/**
 * Abhinav Hospital (Mother & Child Care) - 3D Virtual Campus Engine
 * Powered by Three.js
 */

(function () {
  'use strict';

  // Check if THREE is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js is not loaded yet.');
    return;
  }

  // Hospital Department Info Database
  const DEPARTMENT_INFO = {
    campus: {
      title: 'Abhinav Hospital Campus Overview',
      badge: 'Mother & Child Care Hospital',
      desc: 'Located on Budsu Road, Kuchaman City (Rajasthan 341508). A multi-tier specialized healthcare center offering 24/7 emergency, pediatric care, NICU, and maternity suites.',
      doctor: 'Dr. Ramlal Choudhary (Chief Pediatrician & Neonatologist)',
      highlight: '24/7 Ambulance & Emergency Active'
    },
    emergency: {
      title: 'Ground Floor: 24/7 Emergency & Triage',
      badge: 'Emergency Bay • Level 0',
      desc: 'Immediate resuscitation, round-the-clock emergency triage, oxygenation support, digital X-Ray/Diagnostics, and 24-hour in-house pharmacy.',
      doctor: 'Emergency Medical Officers & On-call Specialists',
      highlight: 'Direct Ambulance Bay & Rapid Admission'
    },
    maternity: {
      title: 'Level 1: Mother Care & Maternity Suites',
      badge: 'Obstetrics & Gynecology • Level 1',
      desc: 'Equipped for normal and painless deliveries, high-risk pregnancy monitoring, modern LDR (Labor, Delivery, Recovery) suites, and 4D fetal sonography.',
      doctor: 'Consultant Obstetricians & Gynecologists',
      highlight: 'Private Delivery Suites & Antenatal Care'
    },
    nicu: {
      title: 'Level 2: Advanced Neonatal ICU (NICU Level III)',
      badge: 'Critical Newborn Care • Level 2',
      desc: 'State-of-the-art servo-controlled incubators, LED phototherapy for jaundice, high-frequency CPAP ventilators, and Kangaroo Mother Care zone.',
      doctor: 'Dr. Ramlal Choudhary (Pediatric & NICU Specialist)',
      highlight: 'Ultra-Sterile HEPA Filtered Environment'
    },
    pediatrics: {
      title: 'Level 3: Pediatric & Child Health Center',
      badge: 'Child Health • Level 3',
      desc: 'Comprehensive outpatient and inpatient care for infants, children, and adolescents. Child vaccination clinic, asthma management, and friendly play area.',
      doctor: 'Pediatric Care Team',
      highlight: 'Complete Vaccination Schedule Center'
    },
    helipad: {
      title: 'Rooftop: Emergency Helipad & Solar Plant',
      badge: 'Medical Aviation • Roof',
      desc: 'Designed for critical medical transfers, air ambulance evacuation, sustainable solar power backup, and modern HVAC sterile air handlers.',
      doctor: 'Air Evacuation Protocols',
      highlight: 'Night-Illuminated Landing Zone'
    }
  };

  // Main 3D Hospital Class
  class Hospital3DApp {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.clock = new THREE.Clock();

      // Groups
      this.hospitalGroup = new THREE.Group();
      this.floors = []; // [ground, floor1, floor2, floor3, roof]
      this.hotspots = [];
      this.ambulance = null;
      this.ambulanceAngle = 0;
      this.lights = {};

      // State
      this.isExploded = false;
      this.currentMode = 'day'; // 'day', 'sunset', 'night'
      this.isAutoRotating = true;
      this.targetCameraPos = null;
      this.targetLookAt = null;

      this.init();
    }

    init() {
      const width = this.container.clientWidth || 800;
      const height = this.container.clientHeight || 550;

      // 1. Scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xdcefed);
      this.scene.fog = new THREE.FogExp2(0xdcefed, 0.012);

      // 2. Camera
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
      this.camera.position.set(38, 28, 44);

      // 3. Renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;
      this.container.appendChild(this.renderer.domElement);

      // 4. Orbit Controls
      if (THREE.OrbitControls) {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't go below ground
        this.controls.minDistance = 14;
        this.controls.maxDistance = 85;
        this.controls.target.set(0, 6, 0);
      }

      // 5. Lighting
      this.setupLighting();

      // 6. Build 3D World
      this.buildTerrain();
      this.buildHospital();
      this.buildAmbulance();
      this.buildHotspots();
      this.buildSurroundings();

      this.scene.add(this.hospitalGroup);

      // 7. Event Listeners
      window.addEventListener('resize', () => this.onResize());
      this.setupRaycasting();
      this.bindUI();

      // 8. Animation Loop
      this.animate();
    }

    setupLighting() {
      // Ambient Light
      this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(this.lights.ambient);

      // Sun Light (Directional)
      this.lights.sun = new THREE.DirectionalLight(0xfffaed, 1.3);
      this.lights.sun.position.set(35, 45, 25);
      this.lights.sun.castShadow = true;
      this.lights.sun.shadow.mapSize.width = 2048;
      this.lights.sun.shadow.mapSize.height = 2048;
      this.lights.sun.shadow.camera.near = 0.5;
      this.lights.sun.shadow.camera.far = 120;
      const d = 32;
      this.lights.sun.shadow.camera.left = -d;
      this.lights.sun.shadow.camera.right = d;
      this.lights.sun.shadow.camera.top = d;
      this.lights.sun.shadow.camera.bottom = -d;
      this.lights.sun.shadow.bias = -0.0005;
      this.scene.add(this.lights.sun);

      // Secondary fill light
      this.lights.fill = new THREE.DirectionalLight(0x9bd8e8, 0.4);
      this.lights.fill.position.set(-25, 20, -25);
      this.scene.add(this.lights.fill);

      // Night Spotlight & Accent Lights (initially dimmed)
      this.lights.nightAccent = new THREE.PointLight(0x38bdf8, 0, 30);
      this.lights.nightAccent.position.set(0, 16, 0);
      this.scene.add(this.lights.nightAccent);
    }

    buildTerrain() {
      const terrainGroup = new THREE.Group();

      // Lush Grass Ground
      const groundGeo = new THREE.PlaneGeometry(120, 120);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0x82b8a0,
        roughness: 0.9,
        metalness: 0.05
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      terrainGroup.add(ground);

      // Paved Plaza Apron around Hospital
      const plazaGeo = new THREE.BoxGeometry(38, 0.2, 32);
      const plazaMat = new THREE.MeshStandardMaterial({
        color: 0xe6edf0,
        roughness: 0.5,
        metalness: 0.1
      });
      const plaza = new THREE.Mesh(plazaGeo, plazaMat);
      plaza.position.set(0, 0.1, 0);
      plaza.receiveShadow = true;
      terrainGroup.add(plaza);

      // Asphalt Access Road Loop for Ambulance
      const roadGeo = new THREE.RingGeometry(24, 30, 48);
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x333b40,
        roughness: 0.8
      });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.12, 0);
      road.receiveShadow = true;
      terrainGroup.add(road);

      // White Center Dashes on Road
      const dashGeo = new THREE.RingGeometry(26.8, 27.2, 48);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dashes = new THREE.Mesh(dashGeo, dashMat);
      dashes.rotation.x = -Math.PI / 2;
      dashes.position.set(0, 0.13, 0);
      terrainGroup.add(dashes);

      // Ambulance Bay Drop-off Pad (Yellow Hash Markings)
      const bayGeo = new THREE.BoxGeometry(10, 0.22, 6);
      const bayMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.6
      });
      const bay = new THREE.Mesh(bayGeo, bayMat);
      bay.position.set(0, 0.12, 16.5);
      bay.receiveShadow = true;
      terrainGroup.add(bay);

      // Pedestrian Crosswalks (Zebra stripes)
      for (let i = -3; i <= 3; i++) {
        const stripeGeo = new THREE.BoxGeometry(0.8, 0.02, 3);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(i * 1.2, 0.25, 20);
        terrainGroup.add(stripe);
      }

      this.scene.add(terrainGroup);
    }

    createFloor(level, name, colorAccent, interiorColor) {
      const floorGroup = new THREE.Group();
      floorGroup.userData = { level, name };

      const floorHeight = 3.6;
      const width = 22;
      const depth = 16;

      // 1. Concrete Floor Slab
      const slabGeo = new THREE.BoxGeometry(width + 0.8, 0.4, depth + 0.8);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0xf0f5f7,
        roughness: 0.4,
        metalness: 0.1
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = 0.2;
      slab.castShadow = true;
      slab.receiveShadow = true;
      floorGroup.add(slab);

      // 2. Main Wall Core
      const wallGeo = new THREE.BoxGeometry(width, floorHeight - 0.4, depth);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.05
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.y = floorHeight / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      floorGroup.add(wall);

      // 3. Teal Modern Trim / Accent Band
      const trimGeo = new THREE.BoxGeometry(width + 0.9, 0.35, depth + 0.9);
      const trimMat = new THREE.MeshStandardMaterial({
        color: colorAccent,
        roughness: 0.3,
        metalness: 0.2
      });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.y = floorHeight - 0.2;
      trim.castShadow = true;
      floorGroup.add(trim);

      // 4. Large Panoramic Glass Windows (Front & Sides)
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x85d5e5,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.75,
        transparent: true,
        opacity: 0.85,
        ior: 1.45
      });

      // Front Window Ribbon
      const winFrontGeo = new THREE.BoxGeometry(width - 4, 1.8, 0.4);
      const winFront = new THREE.Mesh(winFrontGeo, glassMat);
      winFront.position.set(0, floorHeight / 2, depth / 2 + 0.02);
      floorGroup.add(winFront);

      // Interior Glow Light for Night / Atmosphere
      const roomLight = new THREE.PointLight(interiorColor, 0.8, 12);
      roomLight.position.set(0, floorHeight / 2, 0);
      floorGroup.add(roomLight);
      floorGroup.userData.roomLight = roomLight;

      // Special Features for Ground Floor
      if (level === 0) {
        // Red Emergency Canopy Overhang
        const canopyGeo = new THREE.BoxGeometry(11, 0.4, 6);
        const canopyMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.4
        });
        const canopy = new THREE.Mesh(canopyGeo, canopyMat);
        canopy.position.set(0, 3.2, depth / 2 + 3);
        canopy.castShadow = true;
        floorGroup.add(canopy);

        // Canopy Support Pillars
        [-4.8, 4.8].forEach(xPos => {
          const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 16);
          const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(xPos, 1.6, depth / 2 + 5.5);
          pillar.castShadow = true;
          floorGroup.add(pillar);
        });

        // "EMERGENCY 24/7" Text Plate
        const plateGeo = new THREE.BoxGeometry(7, 0.8, 0.2);
        const plateMat = new THREE.MeshStandardMaterial({
          color: 0xb91c1c,
          emissive: 0xef4444,
          emissiveIntensity: 0.4
        });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(0, 3.6, depth / 2 + 5.9);
        floorGroup.add(plate);

        // Glass Automatic Doors
        const doorGeo = new THREE.BoxGeometry(4.5, 2.6, 0.2);
        const doorMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.8
        });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.3, depth / 2 + 0.05);
        floorGroup.add(door);
      }

      return floorGroup;
    }

    buildHospital() {
      // Floor specs: [level, name, accentColor, interiorGlow]
      const specs = [
        [0, 'Ground: 24/7 Emergency & Triage', 0x087f8c, 0xfff2e0],
        [1, 'Level 1: Mother Care & Maternity', 0xff806b, 0xffe4e6],
        [2, 'Level 2: Advanced NICU Level III', 0x0ea5e9, 0xdbeafe],
        [3, 'Level 3: Pediatrics & Child Clinic', 0x10b981, 0xfef3c7]
      ];

      const floorHeight = 3.6;

      specs.forEach(([lvl, name, accent, interior]) => {
        const floor = this.createFloor(lvl, name, accent, interior);
        floor.position.y = lvl * floorHeight;
        this.floors.push(floor);
        this.hospitalGroup.add(floor);
      });

      // Rooftop & Helipad
      const roofGroup = new THREE.Group();
      roofGroup.userData = { level: 4, name: 'Rooftop & Emergency Helipad' };
      roofGroup.position.y = 4 * floorHeight;

      // Roof Base Slab
      const roofSlabGeo = new THREE.BoxGeometry(22.8, 0.5, 16.8);
      const roofSlabMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.7
      });
      const roofSlab = new THREE.Mesh(roofSlabGeo, roofSlabMat);
      roofSlab.castShadow = true;
      roofSlab.receiveShadow = true;
      roofGroup.add(roofSlab);

      // Circular Helipad
      const heliGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.15, 32);
      const heliMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5
      });
      const heli = new THREE.Mesh(heliGeo, heliMat);
      heli.position.set(0, 0.3, 0);
      heli.receiveShadow = true;
      roofGroup.add(heli);

      // Yellow Helipad Outer Ring
      const heliRingGeo = new THREE.RingGeometry(4.8, 5.1, 32);
      const heliRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const heliRing = new THREE.Mesh(heliRingGeo, heliRingMat);
      heliRing.rotation.x = -Math.PI / 2;
      heliRing.position.set(0, 0.38, 0);
      roofGroup.add(heliRing);

      // Helipad Bold "H" Symbol
      const hStem1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 3.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hStem1.position.set(-1.1, 0.4, 0);
      const hStem2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 3.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hStem2.position.set(1.1, 0.4, 0);
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      hBar.position.set(0, 0.4, 0);
      roofGroup.add(hStem1, hStem2, hBar);

      // Rooftop Elevator Penthouse / Utility Room
      const utilityGeo = new THREE.BoxGeometry(5, 2.2, 4);
      const utilityMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const utility = new THREE.Mesh(utilityGeo, utilityMat);
      utility.position.set(-7.5, 1.1, -4.5);
      utility.castShadow = true;
      roofGroup.add(utility);

      // HVAC Air Chiller Units
      for (let i = 0; i < 2; i++) {
        const hvacGeo = new THREE.BoxGeometry(2, 1.2, 1.8);
        const hvacMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 });
        const hvac = new THREE.Mesh(hvacGeo, hvacMat);
        hvac.position.set(7.5, 0.6, -4 + i * 2.6);
        hvac.castShadow = true;
        roofGroup.add(hvac);
      }

      // Large Glowing 3D Hospital Medical Cross Symbol
      const crossGroup = new THREE.Group();
      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 3.2, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 })
      );
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.8, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 })
      );
      crossGroup.add(crossV, crossH);
      crossGroup.position.set(0, 3.8, 7.8);
      roofGroup.add(crossGroup);
      this.crossSymbol = crossGroup;

      this.floors.push(roofGroup);
      this.hospitalGroup.add(roofGroup);
    }

    buildAmbulance() {
      const amb = new THREE.Group();

      // Main White Van Body
      const bodyGeo = new THREE.BoxGeometry(2.2, 1.8, 4.2);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.1
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.2;
      body.castShadow = true;
      amb.add(body);

      // Red Stripe along sides
      const stripeGeo = new THREE.BoxGeometry(2.25, 0.35, 3.8);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 1.1, 0);
      amb.add(stripe);

      // Windshield & Windows
      const winGeo = new THREE.BoxGeometry(2.0, 0.7, 1.2);
      const winMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(0, 1.6, 1.1);
      amb.add(win);

      // 4 Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
      const wheelPositions = [
        [-1.15, 0.4, 1.2],
        [1.15, 0.4, 1.2],
        [-1.15, 0.4, -1.2],
        [1.15, 0.4, -1.2]
      ];
      wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;
        amb.add(wheel);
      });

      // Rooftop Flashing Emergency Lights (Red & Blue)
      const lightBarGeo = new THREE.BoxGeometry(1.2, 0.2, 0.4);
      const lightBarMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const lightBar = new THREE.Mesh(lightBarGeo, lightBarMat);
      lightBar.position.set(0, 2.2, 0.3);
      amb.add(lightBar);

      // Red Beacon Light
      this.ambRedLight = new THREE.PointLight(0xef4444, 2, 8);
      this.ambRedLight.position.set(-0.4, 2.4, 0.3);
      amb.add(this.ambRedLight);

      // Blue Beacon Light
      this.ambBlueLight = new THREE.PointLight(0x3b82f6, 2, 8);
      this.ambBlueLight.position.set(0.4, 2.4, 0.3);
      amb.add(this.ambBlueLight);

      amb.position.set(0, 0, 18);
      this.scene.add(amb);
      this.ambulance = amb;
    }

    buildHotspots() {
      const hotspotData = [
        { id: 'emergency', name: '24/7 Emergency', pos: [0, 4.5, 10.5], color: 0xef4444 },
        { id: 'maternity', name: 'Maternity & Labor', pos: [-6, 6.5, 8.5], color: 0xff806b },
        { id: 'nicu', name: 'Advanced NICU', pos: [6, 10.5, 8.5], color: 0x0ea5e9 },
        { id: 'pediatrics', name: 'Pediatrics Clinic', pos: [-4, 14, 8.5], color: 0x10b981 },
        { id: 'helipad', name: 'Rooftop Helipad', pos: [0, 17.5, 0], color: 0xf59e0b }
      ];

      hotspotData.forEach(item => {
        const pinGroup = new THREE.Group();
        pinGroup.position.set(...item.pos);
        pinGroup.userData = { id: item.id, name: item.name };

        // Outer pulsing ring
        const ringGeo = new THREE.RingGeometry(0.7, 0.9, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: item.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        pinGroup.add(ring);

        // Core Glowing Sphere
        const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: item.color,
          emissive: item.color,
          emissiveIntensity: 0.8
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        pinGroup.add(sphere);

        this.scene.add(pinGroup);
        this.hotspots.push(pinGroup);
      });
    }

    buildSurroundings() {
      // Landscaping: Trees & Hedges around campus
      const treePositions = [
        [-18, 0, 16],
        [-18, 0, 8],
        [-18, 0, -8],
        [-18, 0, -16],
        [18, 0, 16],
        [18, 0, 8],
        [18, 0, -8],
        [18, 0, -16],
        [-12, 0, -20],
        [0, 0, -20],
        [12, 0, -20]
      ];

      const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 1.6, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const foliageGeo = new THREE.DodecahedronGeometry(1.4, 1);
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });

      treePositions.forEach(([x, y, z]) => {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.8;
        trunk.castShadow = true;
        tree.add(trunk);

        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 2.2;
        foliage.castShadow = true;
        tree.add(foliage);

        tree.position.set(x, y, z);
        this.scene.add(tree);
      });

      // Streetlights with light poles
      const lampPositions = [
        [-14, 0, 20],
        [14, 0, 20],
        [-20, 0, 0],
        [20, 0, 0]
      ];

      lampPositions.forEach(([x, y, z]) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 4.5, 12),
          new THREE.MeshStandardMaterial({ color: 0x64748b })
        );
        pole.position.set(x, 2.25, z);
        pole.castShadow = true;

        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xfef08a })
        );
        bulb.position.set(x, 4.6, z);

        this.scene.add(pole, bulb);
      });
    }

    setExplodedView(explode) {
      this.isExploded = explode;
      const baseFloorHeight = 3.6;
      const separation = explode ? 2.8 : 0;

      this.floors.forEach((floor, index) => {
        const targetY = index * (baseFloorHeight + separation);
        this.tweenProperty(floor.position, 'y', targetY, 700);
      });

      // Update inspector card
      this.updateInspector('campus');
    }

    focusDepartment(depKey) {
      if (!DEPARTMENT_INFO[depKey]) return;

      const cameraPositions = {
        campus: { pos: [38, 28, 44], look: [0, 6, 0] },
        emergency: { pos: [4, 7, 24], look: [0, 2.5, 10] },
        maternity: { pos: [-12, 10, 22], look: [-4, 6, 4] },
        nicu: { pos: [14, 14, 20], look: [4, 9, 3] },
        pediatrics: { pos: [-12, 18, 18], look: [0, 13, 0] },
        helipad: { pos: [0, 26, 16], look: [0, 16, 0] }
      };

      const target = cameraPositions[depKey] || cameraPositions.campus;
      this.tweenProperty(this.camera.position, 'x', target.pos[0], 900);
      this.tweenProperty(this.camera.position, 'y', target.pos[1], 900);
      this.tweenProperty(this.camera.position, 'z', target.pos[2], 900);

      if (this.controls) {
        this.tweenProperty(this.controls.target, 'x', target.look[0], 900);
        this.tweenProperty(this.controls.target, 'y', target.look[1], 900);
        this.tweenProperty(this.controls.target, 'z', target.look[2], 900);
      }

      this.updateInspector(depKey);
    }

    setAtmosphereMode(mode) {
      this.currentMode = mode;
      if (mode === 'day') {
        this.scene.background.setHex(0xdcefed);
        this.scene.fog.color.setHex(0xdcefed);
        this.lights.sun.color.setHex(0xfffaed);
        this.lights.sun.intensity = 1.3;
        this.lights.ambient.intensity = 0.7;
        this.lights.nightAccent.intensity = 0;
      } else if (mode === 'sunset') {
        this.scene.background.setHex(0xfcd3a7);
        this.scene.fog.color.setHex(0xfcd3a7);
        this.lights.sun.color.setHex(0xf97316);
        this.lights.sun.intensity = 1.6;
        this.lights.ambient.intensity = 0.55;
        this.lights.nightAccent.intensity = 0.2;
      } else if (mode === 'night') {
        this.scene.background.setHex(0x041318);
        this.scene.fog.color.setHex(0x041318);
        this.lights.sun.color.setHex(0x38bdf8);
        this.lights.sun.intensity = 0.2;
        this.lights.ambient.intensity = 0.25;
        this.lights.nightAccent.intensity = 1.8;
      }
    }

    updateInspector(key) {
      const info = DEPARTMENT_INFO[key] || DEPARTMENT_INFO.campus;
      const titleEl = document.getElementById('inspector-title');
      const badgeEl = document.getElementById('inspector-badge');
      const descEl = document.getElementById('inspector-desc');
      const docEl = document.getElementById('inspector-doctor');

      if (titleEl) titleEl.textContent = info.title;
      if (badgeEl) badgeEl.textContent = info.badge;
      if (descEl) descEl.textContent = info.desc;
      if (docEl) docEl.textContent = info.doctor;
    }

    tweenProperty(obj, prop, targetVal, duration) {
      const startVal = obj[prop];
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease in-out
        obj[prop] = startVal + (targetVal - startVal) * ease;
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }

    setupRaycasting() {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      this.renderer.domElement.addEventListener('click', (event) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObjects(this.hotspots, true);

        if (intersects.length > 0) {
          let rootPin = intersects[0].object;
          while (rootPin.parent && !rootPin.userData.id) {
            rootPin = rootPin.parent;
          }
          if (rootPin.userData && rootPin.userData.id) {
            this.focusDepartment(rootPin.userData.id);
          }
        }
      });
    }

    bindUI() {
      // Explode View Toggle
      const explodeBtn = document.getElementById('btn-explode-view');
      if (explodeBtn) {
        explodeBtn.addEventListener('click', () => {
          this.setExplodedView(!this.isExploded);
          explodeBtn.classList.toggle('active', this.isExploded);
          explodeBtn.innerHTML = this.isExploded
            ? '<span>🗂️</span> Collapse Floors'
            : '<span>📂</span> Exploded Floors';
        });
      }

      // Auto Rotate Toggle
      const rotateBtn = document.getElementById('btn-auto-rotate');
      if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
          this.isAutoRotating = !this.isAutoRotating;
          rotateBtn.classList.toggle('active', this.isAutoRotating);
        });
      }

      // Atmosphere Buttons
      const atmoBtns = document.querySelectorAll('[data-atmo]');
      atmoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          atmoBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setAtmosphereMode(btn.dataset.atmo);
        });
      });

      // Floor Quick Selector Buttons
      const floorBtns = document.querySelectorAll('[data-floor-focus]');
      floorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          floorBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.focusDepartment(btn.dataset.floorFocus);
        });
      });
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 1. Controls update
      if (this.controls) {
        if (this.isAutoRotating && !this.controls.state) {
          this.hospitalGroup.rotation.y += 0.003;
        }
        this.controls.update();
      }

      // 2. Pulse Hospital Cross
      if (this.crossSymbol) {
        const pulse = 0.5 + Math.sin(time * 3) * 0.4;
        this.crossSymbol.children.forEach(mesh => {
          if (mesh.material && mesh.material.emissiveIntensity !== undefined) {
            mesh.material.emissiveIntensity = pulse;
          }
        });
      }

      // 3. Hotspots Hover & Pulsing rings
      this.hotspots.forEach(pin => {
        pin.lookAt(this.camera.position);
        const ring = pin.children[0];
        if (ring) {
          const s = 1 + Math.sin(time * 4) * 0.15;
          ring.scale.set(s, s, s);
        }
      });

      // 4. Animate Ambulance along road loop
      if (this.ambulance) {
        this.ambulanceAngle += 0.012;
        const radius = 27;
        const ambX = Math.cos(this.ambulanceAngle) * radius;
        const ambZ = Math.sin(this.ambulanceAngle) * radius;
        this.ambulance.position.set(ambX, 0, ambZ);
        this.ambulance.rotation.y = -this.ambulanceAngle + Math.PI / 2;

        // Flashing Emergency Lights
        const flash = Math.sin(time * 12) > 0;
        this.ambRedLight.intensity = flash ? 3 : 0.2;
        this.ambBlueLight.intensity = !flash ? 3 : 0.2;
      }

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Mini Hero 3D Preview Canvas Class (Rendered on Hero card)
  class HeroPreview3D {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      const width = this.canvas.clientWidth || 380;
      const height = this.canvas.clientHeight || 300;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      this.camera.position.set(16, 12, 16);
      this.camera.lookAt(0, 2.5, 0);

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Light
      const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(10, 15, 10);
      this.scene.add(ambLight, dirLight);

      // Model: Stylized mini hospital cross with pedestal
      this.meshGroup = new THREE.Group();

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 5, 0.6, 32),
        new THREE.MeshStandardMaterial({ color: 0x07535e, roughness: 0.3 })
      );
      this.meshGroup.add(pedestal);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.6, 0.22, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x087f8c, emissiveIntensity: 0.5 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.5;
      this.meshGroup.add(ring);

      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 4.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xff806b, roughness: 0.2 })
      );
      crossV.position.y = 2.8;

      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 1.2, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xff806b, roughness: 0.2 })
      );
      crossH.position.y = 2.8;

      this.meshGroup.add(crossV, crossH);
      this.scene.add(this.meshGroup);

      this.animate();
    }

    animate() {
      requestAnimationFrame(() => this.animate());
      if (this.meshGroup) {
        this.meshGroup.rotation.y += 0.015;
      }
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Initialize when DOM is ready
  function start3D() {
    // Main 3D Campus Viewer
    if (document.getElementById('hospital-canvas-wrap') && !window.hospitalApp) {
      window.hospitalApp = new Hospital3DApp('hospital-canvas-wrap');
    }

    // Mini Hero Card Preview
    if (document.getElementById('hero-3d-canvas') && !window.heroPreviewApp) {
      window.heroPreviewApp = new HeroPreview3D('hero-3d-canvas');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start3D);
  } else {
    start3D();
  }

})();
