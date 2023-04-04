import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';
import map1 from './images/map.jpg';

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      100,
      10000
    );
    this.camera.position.set(0, 0, 600);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.getData();
    this.addMesh();
    this.update();
    // this.setupResize();
    // this.resize();
    this.render();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    if (this.width / this.height > 1) {
      this.plane.scale.x = this.camera.aspect;
    } else {
      this.plane.scale.y = 1 / this.camera.aspect;
    }

    this.camera.updateProjectionMatrix();
  }

  getData() {
    this.svg = [...document.querySelectorAll('.cls-1')];

    this.lines = [];

    this.svg.forEach((path, j) => {
      let length = path.getTotalLength();
      let numberOfPoints = Math.floor(length / 5);

      let points = [];

      for (let i = 0; i < numberOfPoints; i++) {
        // Gets points position
        let pointAt = (length * i) / numberOfPoints;

        // Set points to a position in the path
        let p = path.getPointAtLength(pointAt);

        // Random
        let randomX = (Math.random() - 0.5) * 5;
        let randomY = (Math.random() - 0.5) * 5;

        points.push(
          new THREE.Vector3(p.x - 1024 + randomX, p.y - 512 + randomY, 0)
        ); // Substract half of the width and height to center
      }

      this.lines.push({
        id: j,
        path,
        length,
        number: numberOfPoints,
        points,
        currentPos: 0,
        speed: 1,
      });
    });
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        bg: { value: new THREE.TextureLoader().load() },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      blending: THREE.AdditiveBlending,
    });
    this.geometry = new THREE.BufferGeometry();

    this.max = this.lines.length * 100;
    this.positions = new Float32Array(this.max * 3);
    this.opacity = new Float32Array(this.max);

    // this.lines.forEach((line) => {
    //   line.points.forEach((point) => {
    //     this.positions.push(point.x, point.y, point.z);
    //     this.opacity.push(Math.random() / 10);
    //   });
    // });

    for (let i = 0; i < this.max; i++) {
      this.positions.set([Math.random() * 100, Math.random() * 1000, 0], i * 3);
      this.opacity.set([Math.random() / 10], i);
    }

    // Attributes
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      'opacity',
      new THREE.BufferAttribute(this.opacity, 1)
    );

    this.object = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.object);

    let texture = new THREE.TextureLoader().load(map1);
    texture.flipY = false;

    // Map
    let map = new THREE.Mesh(
      new THREE.PlaneGeometry(2048, 1024),
      new THREE.MeshBasicMaterial({
        color: 0x000011,
        map: texture,
      })
    );

    this.scene.add(map);
  }

  update() {
    let j = 0;
    this.lines.forEach((line) => {
      line.currentPos += line.speed;

      line.currentPos = line.currentPos % line.number;

      for (let i = 0; i < 100; i++) {
        let index = (line.currentPos + i) % line.number;
        let p = line.points[index]; // vec3
        this.positions.set([p.x, p.y, p.z], j * 3);
        this.opacity.set([i / 1000], j);
        j++;
      }
    });

    this.geometry.attributes.position.array = this.positions;
    this.geometry.attributes.position.needsUpdate = true;
  }

  render() {
    this.time += 0.05;

    this.update();
    this.material.uniforms.time.value = this.time;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
