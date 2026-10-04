const { getStore } = require('@netlify/blobs');

const EMPTY_STATE = { games: [], players: [], matches: [] };

function getBlobsStore() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: 'tanteo', siteID, token });
  }
  return getStore('tanteo');
}

exports.handler = async (event) => {
  try {
    const store = getBlobsStore();

    if (event.httpMethod === 'GET') {
      let data = null;
      try {
        data = await store.get('state', { type: 'json' });
      } catch (e) {
        data = null;
      }
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data || EMPTY_STATE),
      };
    }

    if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON' };
      }
      const safe = {
        games: Array.isArray(body.games) ? body.games : [],
        players: Array.isArray(body.players) ? body.players : [],
        matches: Array.isArray(body.matches) ? body.matches : [],
      };
      await store.setJSON('state', safe);
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ok: true }),
      };
    }

    return { statusCode: 405, body: 'Method not allowed' };
  } catch (err) {
    const siteID = process.env.BLOBS_SITE_ID;
    const token = process.env.BLOBS_TOKEN;
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        error: String((err && err.message) || err),
        debug: {
          hasSiteID: !!siteID,
          siteIDPreview: siteID ? siteID.slice(0, 8) + '...' : null,
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          netlifyContext: process.env.CONTEXT || null,
        },
      }),
    };
  }
};
