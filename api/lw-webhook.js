export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

    try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    console.log("LW payload:", JSON.stringify(body, null, 2));

    // ➤ Provjera tipa eventa
    if (body.type === 'payment_intent.succeeded') {
      const paymentIntent = body.data?.object || {};

      const buyerName = paymentIntent.shipping?.name || 'Nepoznat kupac';
      const buyerEmail = paymentIntent.receipt_email || 'nepoznato@example.com';
      const amount = (paymentIntent.amount_received || 0) / 100;

      const invoicePayload = {
        source: "stripe",
        test: true,
        buyer: {
          name: buyerName,
          email: buyerEmail
        },
        products: [
          {
            id: "67d81170a316b9bac4010507",
            name: "Online edukacija – Stripe test",
            price: amount
          }
        ],
        payment: {
          method: "card"
        }
      };

      console.log("[LW-WEBHOOK] Pripremljeni payload:", invoicePayload);

      return res.status(200).json({
        received: true,
        invoicePayload,
        message: "Podaci pripremljeni ✔️"
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
