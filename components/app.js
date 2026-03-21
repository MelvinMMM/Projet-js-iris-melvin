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