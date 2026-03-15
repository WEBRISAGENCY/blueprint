exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const firstName = params.get('firstname') || '';
  const email = params.get('email') || '';

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email required' }) };
  }

  const AC_URL = 'https://theblueprint29100.api-us1.com/api/3';
  const AC_KEY = '4dbb561616a848bfbe77e45ec0eb16ebaab1732206aab0e38d2b455761ff5e26c5a19066';
  const LIST_ID = 105;

  try {
    // 1. Create or update contact
    const contactRes = await fetch(`${AC_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Token': AC_KEY },
      body: JSON.stringify({ contact: { email, firstName } })
    });

    const contactData = await contactRes.json();

    // Get contact ID — handle both new and duplicate
    let contactId = contactData.contact?.id;
    if (!contactId) {
      // Fetch existing by email
      const searchRes = await fetch(`${AC_URL}/contacts?email=${encodeURIComponent(email)}`, {
        headers: { 'Api-Token': AC_KEY }
      });
      const searchData = await searchRes.json();
      contactId = searchData.contacts?.[0]?.id;
    }

    if (!contactId) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Could not create contact' }) };
    }

    // 2. Subscribe to list 105
    await fetch(`${AC_URL}/contactLists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Api-Token': AC_KEY },
      body: JSON.stringify({ contactList: { list: LIST_ID, contact: contactId, status: 1 } })
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
