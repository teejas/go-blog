import * as THREE from 'three';

// import { MapControls } from 'three/addons/controls/MapControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SETTINGS = {
  amount: 500000,
  radius: 250,
  speed: 5,
  fogEnabled: true,
  elapsedTime: 0,
  // trails: true,
};

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const spaceColor = new THREE.Color(0x040B2C);
const globalFog = new THREE.Fog(0x000000, 0.2, SETTINGS.radius);
const scene = new THREE.Scene();
scene.background = spaceColor;
scene.fog = globalFog;



// ----------------------- create stars

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({
  size: 0.1,
  // blending: THREE.AdditiveBlending,
  depthTest: false,
});


// tweak the shader
material.onBeforeCompile = (shader, renderer) => {
  shader.uniforms.elapsedTime = {
    get value() {
      return SETTINGS.elapsedTime;
    },
  };
  shader.uniforms.spawnRadius = {
    get value() {
      return SETTINGS.radius;
    },
  };
  shader.uniforms.speed = {
    get value() {
      return SETTINGS.speed;
    },
  };

  shader.vertexShader = 'uniform float elapsedTime;' + shader.vertexShader;
  shader.vertexShader = 'uniform float spawnRadius;' + shader.vertexShader;
  shader.vertexShader = 'uniform float speed;' + shader.vertexShader;

  shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
    // move stars in one direction
    transformed.z += speed * elapsedTime;

    // constrain stars inside cube
    // (ex: if a star goes to far on one side, it'll be put back to the other side)
    transformed.xyz = mod(transformed.xyz, spawnRadius * 2.0) - spawnRadius;

    #include <project_vertex>
  `);

  shader.vertexShader = shader.vertexShader.replace('gl_PointSize = size;', `
    // hide points that are outside sphere shape
    gl_PointSize = size * step(distance(vec3(0.0, 0.0, 0.0), transformed), spawnRadius);
  `);
};
material.color.set(0xFF0000);

// generate stars vertices
function updateStarsVertices(radius, amount) {
  radius = radius || SETTINGS.radius;
  amount = amount || SETTINGS.amount;

  const diameter = radius * 2;
  const vertices = [];
  for ( let i = 0; i < amount; i ++ ) {
    const x = (Math.random() * diameter) - radius;
    const y = (Math.random() * diameter) - radius;
    const z = (Math.random() * diameter) - radius;
    vertices.push( x, y, z );
  }

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
}

updateStarsVertices();

const stars = new THREE.Points( geometry, material );
scene.add( stars );

// -----------------------

const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.z = 20;

const controls = new OrbitControls( camera, renderer.domElement );

// add planets and stars

const p_geometry = new THREE.SphereGeometry(1, 32, 16);
// geometry.translate( 0, 0.5, 0 );
const p_material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, flatShading: true } );
p_material.transparent = true;

for ( let i = 0; i < 50; i ++ ) {
  const radius = SETTINGS.radius;
  const diameter = radius * 2;
  if (i % 5 == 0) {
    const light = new THREE.PointLight( 0xFF0000, 100000, 100000);
    light.position.x = (Math.random() * diameter) - radius;
    light.position.y = (Math.random() * diameter) - radius;
    light.position.z = (Math.random() * diameter) - radius;
    light.updateMatrix();
    light.matrixAutoUpdate = false;
    scene.add ( light );
  } else { 
    const mesh = new THREE.Mesh( p_geometry, p_material );
    mesh.position.x = (Math.random() * diameter) - radius;
    mesh.position.y = (Math.random() * diameter) - radius;
    mesh.position.z = (Math.random() * diameter) - radius;
    mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 20;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add( mesh );
  }
}

let lastAmount = SETTINGS.amount;
let lastRadius = SETTINGS.radius;
const gui = new GUI();
gui.add(SETTINGS, 'amount', 1000, 100000).step(1000).name('Stars').onChange(function(value){
  if(value !== lastAmount){
    updateStarsVertices();
    lastAmount = value;
  }
});
gui.add(SETTINGS, 'radius', 10, 500).step(10).name('Radius').onChange(function(value){
  if(value !== lastRadius){
    updateStarsVertices();
    lastRadius = value;
    globalFog.far = SETTINGS.radius;
  }
});
gui.add(SETTINGS, 'speed', 0, 50).name('Speed');
gui.add(SETTINGS, 'fogEnabled').name('Fog enabled').onChange(function(value){
  scene.fog = value ? globalFog : null;
});

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();

}

function render() {

	renderer.render( scene, camera );

}

window.addEventListener( 'resize', onWindowResize );
animate();