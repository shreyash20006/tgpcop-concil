export interface CashfreePaymentParams {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  amount: number;
  purpose: string;
  description: string;
  recordId: string; // Used to structure the return URL
}

function loadCashfree(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initiatePayment({
  studentName,
  studentEmail,
  studentPhone,
  amount,
  purpose,
  description,
  recordId
}: CashfreePaymentParams): Promise<any> {
  // 1. Load Cashfree JS SDK
  const loaded = await loadCashfree();
  if (!loaded) {
    throw new Error('Cashfree SDK failed to load. Please check your internet connection.');
  }

  const mode = import.meta.env.VITE_CASHFREE_MODE || 'sandbox';
  const appId = import.meta.env.VITE_CASHFREE_APP_ID;
  const secretKey = import.meta.env.VITE_CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error('Cashfree environment keys are not configured correctly.');
  }

  // 2. Create Order via Cashfree PG API directly
  // We do this by hitting Cashfree's Order Creation API
  const apiEndpoint = mode === 'production' 
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

  const orderId = `order_${recordId.slice(0, 8)}_${Date.now().toString().slice(-6)}`;

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
        return_url: `${window.location.origin}/payment-success?id=${recordId}&cf_order_id={order_id}`,
        payment_methods: 'cc,dc,ccc,ppc,nb,upi,paypal,eminointerest,emipartner,paylater'
      },
      order_note: description || purpose
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Cashfree Order API Failure:', errorText);
    throw new Error(`Failed to create Cashfree transaction session: ${response.statusText}`);
  }

  const orderData = await response.json();
  const paymentSessionId = orderData.payment_session_id;

  if (!paymentSessionId) {
    throw new Error('Failed to generate payment session from Cashfree gateway.');
  }

  // 3. Initialize Cashfree and trigger Checkout popup modal
  const cashfree = (window as any).Cashfree({ mode });

  return new Promise((resolve, reject) => {
    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: '_modal'
    }).then((result: any) => {
      if (result.error) {
        console.warn('Cashfree Checkout Closed/Failed:', result.error);
        reject(new Error(result.error.message || 'Payment session closed or failed.'));
      } else {
        resolve({
          razorpay_payment_id: result.paymentDetails?.cfPaymentId || orderId, // maintain compatibility with existing handlers
          cfOrderId: orderId
        });
      }
    });
  });
}
