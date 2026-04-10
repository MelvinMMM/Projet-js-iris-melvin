import * as THREE from 'three';
import Globe from 'globe.gl';
import i18next from './components/i18n.js';
import { loadCountries, loadData, initSearch, updateDOMTranslation } from './components/app.js';
import LocationInfoBoxComponent from './components/locationInfoBox.js';

const earthDiv = document.getElementById('globe');
const locationInfoBoxElement = document.getElementById('location-info-box');
const loadingElement = document.getElementById('loading');

function getGlobeSize() {
    return {
        width: earthDiv.clientWidth || window.innerWidth,
        height: earthDiv.clientHeight || window.innerHeight
    };
}  

function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
} 

const earth = Globe()(earthDiv, { animateIn: false })
    .globeImageUrl(`${import.meta.env.BASE_URL}assets/earth-blue-marble.jpg`)
    .bumpImageUrl(`${import.meta.env.BASE_URL}assets/earth-topology.png`)
    .backgroundImageUrl(`${import.meta.env.BASE_URL}assets/night-sky.png`)
    .width(getGlobeSize().width) 
    .height(getGlobeSize().height);

window.addEventListener('resize', () => {
    const { width, height } = getGlobeSize();
    earth.width(width);
    earth.height(height);
});

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

requestAnimationFrame(() => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: isMobileViewport() ? 3.9 : 2.8 }, 0);
});

new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/clouds.png`, cloudsTexture => {    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + 0.001), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += -0.005 * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});

window.addEventListener('click', (e) => {
    if (!locationInfoBoxElement.classList.contains('open')) return;
    if (!locationInfoBoxElement.contains(e.target)) {
        locationInfoBoxElement.classList.remove('open');
    }
});

earth.onGlobeClick(({ lat, lng }) => {
    earth.pointOfView({ lat, lng, altitude: 0.5 }, 1000);
});

window.addEventListener("mousedown", () => {
    earth.controls.autoRotate = false;
}, false);

window.addEventListener("mouseup", () => {
    earth.controls.autoRotate = true;
}, false);

const movement = document.getElementById('movement');
movement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>
`;
movement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
    const Rotating = earth.controls().autoRotate;
    movement.innerHTML = Rotating ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>
` : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />

</svg>
`;
});

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
});

Promise.all([loadCountries(earth), loadData(earth)])
    .then(([countriesData, eventsData]) => {
        initSearch(earth, countriesData, eventsData);

        loadingElement.classList.add('opacity-0');
        setTimeout(() => {
            loadingElement.classList.add('hidden');
        }, 1000);
    })
    .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
        loadingElement.innerHTML = "<h1>Failed to load data. Please try again later.</h1>";
    });

updateDOMTranslation(earth);