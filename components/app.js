export async function fetchData() {

  try {
    const responseNasa = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=all&limit=4000", {
      // limit = 200 pour récupérer plus d'événements : 
      // modifie pour voir la différence ex : limit 3000 pour récupérer encore plus d'événements 
      // ou retire le limit 
      // status=all pour récupérer les événements passés et en cours
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const responseUSGS = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });



    if (!responseNasa.ok) {
      throw new Error(`HTTP ${responseNasa.status} - ${responseNasa.statusText}`);
    }
    if (!responseUSGS.ok) {
      throw new Error(`HTTP ${responseUSGS.status} - ${responseUSGS.statusText}`);
    }


    const data = await responseNasa.json();
    const earthquakeData = await responseUSGS.json();


    // Fusionner les données de NASA et USGS
    data.events = data.events.concat(earthquakeData.features.map(feature => {
      return {
        id: feature.id,
        title: feature.properties.title,
        geometry: [{
          coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]
        }],
        categories: [{ id: 'earthquakes' }]
      };
    }));
    return data;





  } catch (error) {
    throw new Error(`Erreur lors de la récupération des données : ${error.message}`);

  }
}

export async function fetchCountry() {
  try {
    const response = await fetch('/datasets/ne_110m_admin_0_countries.geojson');

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des pays :", error);
  }
}

export async function restCountries(isoCode) {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du pays :", error);
  }
}

export async function loadCountries(earth) {
  const countriesData = await fetchCountry();
  let hoverD = null;

  earth.polygonsData(countriesData.features)
    .polygonAltitude(0.006)
    .polygonCapColor(d => d === hoverD ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0,0,0,0)')
    .polygonSideColor(() => 'rgba(0,0,0,0)')
    .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.1)') // Légères frontières
    .onPolygonHover(d => {
      hoverD = d;
      earth.polygonCapColor(earth.polygonCapColor());
      const infoCard = document.getElementById('countryInfoCard');
      if (!d) {
        infoCard.classList.remove('opacity-100');
        infoCard.classList.add('opacity-0');
        return;
      }
      infoCard.classList.remove('opacity-0');
      infoCard.classList.add('opacity-100');
      document.getElementById('countryName').textContent = d.properties.NAME || d.properties.ADMIN;

      document.getElementById('countryFlag').classList.add('hidden');
      document.getElementById('countryTime').textContent = "...";
      document.getElementById('countryLang').textContent = "...";
      document.getElementById('countryPop').textContent = "...";

      let isoCode = d.properties.ISO_A3;
      if (isoCode === '-99') {
        isoCode = d.properties.ADM0_A3; // Certains pays ont un code ISO_A3 invalide, on essaie avec ISO_A2
      }
      if (!isoCode || isoCode === '-99') return;

      updateCountryDetails(isoCode);
    })
    .polygonsTransitionDuration(300);
}

const countryCache = {};

export async function updateCountryDetails(isoCode) {
  let data;

  if (countryCache[isoCode]) {
    data = countryCache[isoCode];
  } else {
    try {
      const countryData = await restCountries(isoCode);
      if (!countryData || !countryData[0]) {
        console.error("Aucun détail trouvé pour le code ISO :", isoCode);
        return;
      }
      data = countryData[0];
      countryCache[isoCode] = data;
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du pays :", error);
      return;
    }
  }
  if (data.flags && data.flags.png) {
    document.getElementById('countryFlag').src = data.flags.png;
    document.getElementById('countryFlag').classList.remove('hidden');
  }
  let timeDisplay = data.timezones && data.timezones.length > 0 ? data.timezones[0] : "N/A";

  if (data.timezones && data.timezones.length > 1) {
    if (data.cca3 === 'FRA') {
      timeDisplay = "UTC+01:00 (Métropole)";
    }
    else if (data.cca3 === 'GBR') {
      timeDisplay = "UTC+00:00 (Londres)";
    }
    else if (data.timezones.length > 3) {
      timeDisplay = `${data.timezones.length} fuseaux horaires`;
    }
    else {
      timeDisplay = data.timezones.join(', ');
    }
  }
  document.getElementById('countryTime').textContent = timeDisplay;
  document.getElementById('countryLang').textContent = Object.values(data.languages).join(', ');
  document.getElementById('countryPop').textContent = data.population.toLocaleString();
}

export async function loadData(earth) {
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
        category: event.categories[0].title,
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
        category: event.categories[0].title,

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
        category: event.categories[0].title,
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
        category: event.categories[0].title,
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
        category: event.categories[0].title,
        pulsePeriod: 1200 + Math.random() * 1000
      };
    });
  const floodsData = data.events
    .filter(event => event.categories[0].id === 'floods')
    .map(event => {
      return {
        lat: event.geometry[0].coordinates[1], // Latitude
        lng: event.geometry[0].coordinates[0], // Longitude
        size: 0.05,
        color: '#00ffff', // cyan pour les inondations
        label: event.title,
        id: event.id,
        category: event.categories[0].title,
        pulsePeriod: 1200 + Math.random() * 1000
      };
    });

  const markersData = {
    'wildfires': fireData,
    'seaLakeIce': seaData,
    'volcanoes': volcaData,
    'severeStorms': stormData,
    'earthquakes': earthquakeData,
    'floods': floodsData
  };

  function updateGlobeData() {
    let activeMarkers = [];
    const checkboxes = document.querySelectorAll('#filters-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        activeMarkers = activeMarkers.concat(markersData[checkbox.id]);
      }
    });

    earth.pointsData(activeMarkers)
      .pointAltitude(0.01)
      .pointRadius(0.2)
      .pointColor('color')
      .pointLabel(d => `
            <strong>${d.label}</strong><br/>
            <div style="font-size:11px;opacity:0.9;margin-top:4px;">
                Type: ${d.category ?? 'N/A'}<br/>
                Lat: ${d.lat.toFixed(2)}°<br/>
                Lng: ${d.lng.toFixed(2)}°
            </div>
        `);

    earth.ringsData(activeMarkers)
      .ringColor('color')
      .ringMaxRadius(1.2)
      .ringPropagationSpeed(0.7)
      .ringRepeatPeriod('pulsePeriod');
  }

  const checkboxes = document.querySelectorAll('#filters-container input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateGlobeData);
  });

  updateGlobeData();

  console.log("Données formatées pour les tempêtes en mer :", seaData);
  console.log("Données formatées pour les feux :", fireData);
  console.log("Données formatées pour les volcans :", volcaData);
  console.log("Données formatées pour les tempêtes :", stormData);
  console.log("Données formatées pour les tremblements de terre :", earthquakeData);




  const chartCanvas = document.getElementById('chart');
  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      datasets: [
        { fill: 'origin' },      // 0: fill to 'origin'
        { fill: '+2' },          // 1: fill to dataset 3
        { fill: 1 },             // 2: fill to dataset 1
        { fill: false },         // 3: no fill
        { fill: '-2' },          // 4: fill to dataset 2
        { fill: { value: 25 } }    // 5: fill to axis value 25
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  const fireEvents = data.events.filter(event => event.categories[0].id === 'wildfires');

  const firesPerYear = {};

  fireEvents.forEach(event => {

    if (event.geometry && event.geometry.length > 0 && event.geometry[0].date) {

      const year = new Date(event.geometry[0].date).getFullYear();

      if (firesPerYear[year]) {
        firesPerYear[year]++;
      } else {
        firesPerYear[year] = 1;
      }
    }
  });

  const years = Object.keys(firesPerYear).sort();

  const fireCounts = years.map(year => firesPerYear[year]);

  const ctxLine = document.getElementById('fireLineChart').getContext('2d');

  if (window.fireChartInstance) {
    window.fireChartInstance.destroy();
  }

  window.fireChartInstance = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: years,

      datasets: [{
        label: 'Number of forest fire incidents',
        data: fireCounts,

        borderColor: '#ff4500',

        backgroundColor: 'rgba(255, 69, 0, 0.2)',

        borderWidth: 2,
        pointBackgroundColor: '#ff4500',
        pointBorderColor: '#fff',
        pointRadius: 4,
        fill: true,

        tension: 0.3

      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Evolution of forest fires by year',
          font: { size: 16 }
        },
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of fires'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        }
      }
    }
  });
}