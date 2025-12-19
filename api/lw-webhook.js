// Funkcija koja zove eracuni-create endpoint
async function callEracuniCreate(payload) {
  const res = await fetch('https://lw-eracuni-middleware-2zkg.vercel.app/api/eracuni-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return data;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    console.log("LW payload:", JSON.stringify(body, null, 2));

    // ➤ Provjera tipa Stripe eventa
    if (body.type === 'payment_intent.succeeded') {
      const paymentIntent = body.data?.object || {};

      const buyerName = paymentIntent.shipping?.name || 'Nepoznat kupac';
      const buyerEmail = paymentIntent.receipt_email || 'nepoznato@example.com';
      const amount = (paymentIntent.amount_received || 0) / 100;

      const invoicePayload = {
        source: "stripe",
        test: true, // ⚠️ makni ovo kad budeš radio pravi račun
        buyer: {
          name: buyerName,
          email: buyerEmail
        },
        products: [
          {
            id: "67d81170a316b9bac4010507", // fiksni mapping za edukaciju
            name: "Online edukacija – Stripe test",
            price: amount
          }
        ],
        payment: {
          method: "card"
        }
      };

      console.log("[LW-WEBHOOK] Pripremljeni payload:", invoicePayload);

      // ➤ Pozivamo /api/eracuni-create
      const response = await callEracuniCreate(invoicePayload);

      console.log("[LW-WEBHOOK] Odgovor e-racuni middlewarea:", response);

      return res.status(200).json({
        received: true,
        invoicePayload,
        eracuniResponse: response,
        message: "Račun generiran (dry-run)"
      });
    }

    // fallback za druge evente
    return res.status(200).json({
      received: true,
      keys: Object.keys(body),
      message: "Webhook primljen (bez obrade)"
    });

  } catch (error) {
    console.error("Parse error:", error);
    return res.status(400).json({ error: "Invalid JSON", details: String(error) });
  }
}
