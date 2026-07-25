// Small server-side proxy for the Metlink Open Data API.
// Runs on Netlify's servers, not in the browser - so CORS doesn't apply here,
// and the API key stays server-side (as an environment variable) instead of
// sitting in plain sight in the dashboard's HTML source.
exports.handler = async function () {
  try {
    const res = await fetch('https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions', {
      headers: {
        'x-api-key': process.env.METLINK_API_KEY,
        'accept': 'application/json'
      }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Metlink API returned HTTP ${res.status}` })
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
