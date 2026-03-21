import * as THREE from 'three';
import Globe from 'globe.gl';
import { fetchData } from './components/app.js';

const earthDiv = document.getElementById('globe');

// Création du globe
const earth = Globe()(earthDiv, {animateIn: false})
    .globeImageUrl('assets/earth-blue-marble.jpg')
    .bumpImageUrl('assets/earth-topology.png')
    .backgroundImageUrl('assets/night-sky.png')
    .width(earthDiv.offsetWidth);

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

// Les nuages
new THREE.TextureLoader().load('./assets/clouds.png', cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + 0.005), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += -0.005 * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
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


// Récupérér les données de l'API et les afficher sur le globe
async function loadData() {
    const data = await fetchData();
    console.log("Données récupérées :", data);

    const fireData = data.events
        .filter(event => event.categories[0].id === 'wildfires')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ff4500', // Orange pour les feux
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const seaData = data.events
        .filter(event => event.categories[0].id === 'seaLakeIce')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#1e90ff', // Bleu pour les tempêtes en mer
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const volcaData = data.events
        .filter(event => event.categories[0].id === 'volcanoes')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ff00ff', // Magenta pour les volcans
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const stormData = data.events
        .filter(event => event.categories[0].id === 'severeStorms')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#f0f0f0', // blanc pour les tempêtes
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const earthquakeData = data.events
        .filter(event => event.categories[0].id === 'earthquakes')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ffd700', // jaune foncé pour les tremblements de terre
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const markersData = [...fireData, ...seaData, ...volcaData, ...stormData, ...earthquakeData];

    earth.pointsData(markersData)
        .pointAltitude(0.01) // Rayon visuel 1.01, évite le z-fighting
        .pointRadius(0.2)
        .pointColor('color');

    earth.ringsData(markersData)
        .ringColor('color')
        .ringMaxRadius(1.2)
        .ringPropagationSpeed(0.7)
        .ringRepeatPeriod('pulsePeriod');
    



    console.log("Données formatées pour les tempêtes en mer :", seaData);
    console.log("Données formatées pour les feux :", fireData);
    console.log("Données formatées pour les volcans :", volcaData);
    console.log("Données formatées pour les tempêtes :", stormData);
    console.log("Données formatées pour les tremblements de terre :", earthquakeData);
    
}


loadData();