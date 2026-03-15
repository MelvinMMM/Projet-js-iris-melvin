export async function fetchData() {

  try {
    const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Erreur de connexion :", error);


}
}