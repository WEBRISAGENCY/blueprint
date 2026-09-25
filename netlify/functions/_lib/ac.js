// Shared ActiveCampaign config. Set AC_API_KEY in Netlify env vars and delete the fallback.
const AC_URL = 'https://theblueprint29100.api-us1.com/api/3';
const AC_KEY = process.env.AC_API_KEY || '4dbb561616a848bfbe77e45ec0eb16ebaab1732206aab0e38d2b455761ff5e26c5a19066';
const DEFAULT_LIST_ID = 105;

async function ac(path, opts = {}) {
  const res = await fetch(`${AC_URL}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Api-Token': AC_KEY, ...(opts.headers || {}) }
  });
  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { raw: text }; }
  return { ok: res.ok, status: res.status, data };
}

// contact/sync creates or updates in one call
async function upsertContact(email, firstName) {
  const contact = { email };
  if (firstName) contact.firstName = firstName;
  const r = await ac('/contact/sync', { method: 'POST', body: JSON.stringify({ contact }) });
  return r.data.contact && r.data.contact.id;
}

async function subscribeToList(contactId, listId = DEFAULT_LIST_ID) {
  return ac('/contactLists', { method: 'POST', body: JSON.stringify({ contactList: { list: listId, contact: contactId, status: 1 } }) });
}

async function getOrCreateTag(name) {
  const found = await ac(`/tags?search=${encodeURIComponent(name)}`);
  const hit = (found.data.tags || []).find(t => t.tag.toLowerCase() === name.toLowerCase());
  if (hit) return hit.id;
  const created = await ac('/tags', { method: 'POST', body: JSON.stringify({ tag: { tag: name, tagType: 'contact', description: 'Added by website opt-in' } }) });
  return created.data.tag && created.data.tag.id;
}

async function tagContact(contactId, tagName) {
  const tagId = await getOrCreateTag(tagName);
  if (!tagId) return null;
  return ac('/contactTags', { method: 'POST', body: JSON.stringify({ contactTag: { contact: contactId, tag: tagId } }) });
}

module.exports = { upsertContact, subscribeToList, tagContact, DEFAULT_LIST_ID };
