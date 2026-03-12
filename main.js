// On importe tout de Three.js dans notre code
import * as THREE from 'three';
// On importe OrbitControl de Three/addons dans notre code
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Crée la scène 3D
const scene = new THREE.Scene();

// Crée la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 25; // recule la caméra pour voir le sphere en entier

// Crée le rendu et le met dans le HTML
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Elle permet de donner le contrôle à la souris
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Création du chargeur de textures
const textureLoader = new THREE.TextureLoader();

// Chargement de l'image de la Terre
// J'ai utilisé une URL d'une texture de la terre sur GitHub (dépôt de Three.js)
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

// Crée un sphere sur la texture de la terre
const geometry = new THREE.SphereGeometry(10, 64, 64); // Plus de segments (64) pour une sphère bien ronde
const material = new THREE.MeshBasicMaterial({ map: earthTexture }); // Applique la texture de la terre au matériau
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// Crée l'animation pour que ça bouge
let isRotating = true;

function animate() {
    requestAnimationFrame(animate);

    // 2. On n'applique la rotation que si isRotating est vrai
    if (isRotating) {
        earth.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

// 3. Écouteur pour arrêter la rotation au mousedown
// On utilise 'window' ou 'renderer.domElement' selon tes besoins
window.addEventListener("mousedown", () => {
    isRotating = false; // La planète s'arrête
}, false);

// 4. (Optionnel) Écouteur pour relancer la rotation quand on relâche
window.addEventListener("mouseup", () => {
    isRotating = false; // La planète repart
}, false);

animate();


// Lance l'animation


/* Cette partie était pour mettre une music de fond mais y a pas de bouton qui permet d'arreter la musique
   Du coup, je l'ai mis en commentaire pour l'instant et je l'ai fait car j'aime la musique tu connais :D */

// // Crée un AudioListener pour l'ajouter à la caméra ()
// const listener = new THREE.AudioListener();
// camera.add( listener );
// // Crée un Audio pour ajouter du son
// const sound = new THREE.Audio( listener );
// // Charge le son et le met dans le buffer de AudioLoader
// const audioLoader = new THREE.AudioLoader();
// // Set le son pour qu'il joue, loop, volume...
// audioLoader.load( 'alors la 2.mp3', function( buffer ) {
// 	sound.setBuffer( buffer );
// 	sound.setLoop( true );
// 	sound.setVolume( 0.5 );
// 	sound.play();
// });