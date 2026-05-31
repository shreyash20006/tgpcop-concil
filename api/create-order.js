export default async function handler(req, res) {
  // Setup CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentName, studentEmail, studentPhone, amount, purpose, description, recordId } = req.body;

    const mode = process.env.VITE_CASHFREE_MODE || 'sandbox';
    const appId = process.env.VITE_CASHFREE_APP_ID;
    const secretKey = process.env.VITE_CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return res.status(500).json({ error: 'Cashfree API keys are not configured on the server.' });
    }

    const apiEndpoint = mode === 'production' 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const orderId = `order_${recordId.slice(0, 8)}_${Date.now().toString().slice(-6)}`;
    const origin = req.headers.origin || 'https://tgpcopcouncil.online';

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${studentPhone.slice(-6)}_${Math.random().toString(36).substring(2, 6)}`,
          customer_name: studentName,
          customer_email: studentEmail,
          customer_phone: studentPhone
        },
        order_meta: {
          return_url: `${origin}/payment-success?id=${recordId}&cf_order_id={order_id}`,
          payment_methods: 'cc,dc,ccc,ppc,nb,upi,paypal,eminointerest,emipartner,paylater'
        },
        order_note: description || purpose
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cashfree PG Server Failure:', errorText);
      return res.status(response.status).json({ 
        error: `Cashfree gateway error: ${response.statusText}`, 
        details: errorText 
      });
    }

    const orderData = await response.json();
    return res.status(200).json(orderData);
  } catch (err) {
    console.error('Serverless Exception:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
