import * as THREE from 'three';

// import { MapControls } from 'three/addons/controls/MapControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


let camera, controls, scene, renderer;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x081333 );
	scene.fog = new THREE.FogExp2( 0x081333, 0.002 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 300, 300, 300 );

	// controls

	// controls = new MapControls( camera, renderer.domElement );
	controls = new OrbitControls( camera, renderer.domElement );

	// controls.enableDamping = true;
	// controls.dampingFactor = 0.05;
	controls.keyPanSpeed = 20

	// controls.screenSpacePanning = false;

	controls.minDistance = 100;
	controls.maxDistance = 1000;

	controls.maxPolarAngle = Math.PI / 2;
	controls.update();

	// world

	const geometry = new THREE.SphereGeometry(1, 32, 16);
	// geometry.translate( 0, 0.5, 0 );
	const material = new THREE.MeshPhongMaterial( { color: 0x000000, flatShading: true } );
	material.transparent = true;

	for ( let i = 0; i < 100; i ++ ) {
		if (i % 5 == 0) {
			const light = new THREE.PointLight( 0xFF0000, 10000, 10000);
			light.position.x = Math.random() * 600 - 80;
			light.position.y = Math.random() * 600 - 80;
			light.position.z = Math.random() * 600 - 80;
			light.updateMatrix();
			light.matrixAutoUpdate = false;
			scene.add ( light );
		} else { 
			const mesh = new THREE.Mesh( geometry, material );
			mesh.position.x = Math.random() * 600 - 80;
			mesh.position.y = Math.random() * 600 - 80;
			mesh.position.z = Math.random() * 600 - 80;
			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 5;
			mesh.updateMatrix();
			mesh.matrixAutoUpdate = false;
			scene.add( mesh );
		}
	}

	window.addEventListener( 'resize', onWindowResize );

}

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
