// Small server-side proxy for the Metlink Open Data API.
// Runs on Netlify's servers, not in the browser - so CORS doesn't apply here,
// and the API key stays server-side (as an environment variable) instead of
// sitting in plain sight in the dashboard's HTML source.
exports.handler = async function () {
  const key = process.env.METLINK_API_KEY;
  console.log('METLINK_API_KEY present:', !!key, '| length:', key ? key.length : 0);

  if (!key) {
    console.log('ERROR: METLINK_API_KEY environment variable is missing or empty.');
    return { statusCode: 500, body: JSON.stringify({ error: 'METLINK_API_KEY not set on server' }) };
  }

  try {
    const res = await fetch('https://api.opendata.metlink.org.nz/v1/gtfs-rt/vehiclepositions', {
      headers: {
        'x-api-key': key,
        'accept': 'application/json'
      }
    });

    console.log('Metlink responded with status:', res.status);

    if (!res.ok) {
      const bodyText = await res.text();
      console.log('Metlink error response body:', bodyText.slice(0, 500));
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Metlink API returned HTTP ${res.status}`, details: bodyText.slice(0, 300) })
      };
    }

    const data = await res.json();
    console.log('Success - entity count:', data.entity ? data.entity.length : 'unknown');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.log('Exception thrown:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
