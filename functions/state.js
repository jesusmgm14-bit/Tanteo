const { getStore } = require('@netlify/blobs');

const EMPTY_STATE = { games: [], players: [], matches: [] };

exports.handler = async (event) => {
  try {
    const store = getStore('tanteo');

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
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: String((err && err.message) || err) }),
    };
  }
};
