// JSON opt-in endpoint used by the site's modal forms.
// Body: { email, firstName | name, source | list }
// Adds the contact to list 105 and tags them with the source (e.g. "agency-ai-optin"),
// which is what ActiveCampaign automations trigger on.
const { upsertContact, subscribeToList, tagContact } = require('./_lib/ac');

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };

function parseBody(event) {
  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : (event.body || '');
  try { return JSON.parse(raw); } catch (e) {
    return Object.fromEntries(new URLSearchParams(raw));
  }
}

const clean = s => String(s || '').trim();
const slug = s => clean(s).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };

  const b = parseBody(event);
  const email = clean(b.email).toLowerCase();
  const firstName = clean(b.firstName || b.firstname || b.name).split(/\s+/)[0] || '';
  const tag = slug(b.source || b.list) || 'website-optin';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Valid email required' }) };
  }

  try {
    const contactId = await upsertContact(email, firstName);
    if (!contactId) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Could not create contact' }) };
    await subscribeToList(contactId);
    await tagContact(contactId, tag);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true, tag }) };
  } catch (err) {
    console.error('ac-subscribe failed', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
