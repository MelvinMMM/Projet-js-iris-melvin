import * as THREE from 'three';
import Globe from 'globe.gl';
import { loadCountries, loadData } from './components/app.js';
import LocationInfoBoxComponent from './components/locationInfoBox.js';

const earthDiv = document.getElementById('globe');
const locationInfoBoxElement = document.getElementById('location-info-box');
const loadingElement = document.getElementById('loading');

// Création du globe
const earth = Globe()(earthDiv, { animateIn: false })
    .globeImageUrl('assets/earth-blue-marble.jpg')
    .bumpImageUrl('assets/earth-topology.png')
    .backgroundImageUrl('assets/night-sky.png')
    .width(earthDiv.offsetWidth);

window.addEventListener('resize', () => {
    earth.width(earthDiv.offsetWidth);
    earth.height(earthDiv.offsetHeight);
});

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

// Les nuages
new THREE.TextureLoader().load('./assets/clouds.png', cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + 0.001), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += -0.005 * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});



// Global click handler to close location info box when clicking outside
window.addEventListener('click', (e) => {
    if (!locationInfoBoxElement.classList.contains('open')) return;
    if (!locationInfoBoxElement.contains(e.target)) {
        locationInfoBoxElement.classList.remove('open');
    }
});

// Quand on click sur le globe, on se déplace vers le point cliqué
earth.onGlobeClick(({ lat, lng }) => {
    earth.pointOfView({ lat, lng, altitude: 0.5 }, 1000);
});

// Quand on clique et maintient le clic, on arrête la rotation automatique du globe, et quand on relâche, on la redémarre
window.addEventListener("mousedown", () => {
    earth.controls.autoRotate = false;
}, false);

window.addEventListener("mouseup", () => {
    earth.controls.autoRotate = true;
}, false);


// quand on click sur le boutton, on arrête ou on démarre la rotation automatique du globe et on change le texte du bouton
const movement = document.getElementById('movement');
let textButton = "STOP";
movement.textContent = textButton;
movement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
    const Rotating = earth.controls().autoRotate;
    textButton = Rotating ? "STOP" : "START";
    movement.textContent = textButton;
});

// Quand on click sur le boutton, on dézoome sur le globe
const zoomOut = document.getElementById('zoomOut');
zoomOut.addEventListener('click', () => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
});

earth.onPointClick((point) => {
    locationInfoBoxElement.innerHTML = LocationInfoBoxComponent({
        id: point.id,
        name: point.label,
        title: point.label,
        type: point.category,
        lat: point.lat,
        lng: point.lng,
    });
    locationInfoBoxElement.classList.add('open');
    console.log("Point cliqué :", point);
});

Promise.all([loadCountries(earth), loadData(earth)])
    .then(() => {
        loadingElement.classList.add('opacity-0');
        setTimeout(() => {
            loadingElement.classList.add('hidden');
        }, 1000);
    })
    .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
        loadingElement.innerHTML = "<h1>Failed to load data. Please try again later.</h1>";
    });

