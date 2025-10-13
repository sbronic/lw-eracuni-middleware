export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // 1. Tvoje e-racuni API vjerodajnice
  const API_URL = "https://e-racuni.com/WebServices/API";
  const username = "BRONICS";
  const secretKey = "31aea4d21d75980bd08b1eed54ef3f74";
  const token = "1A6A66F340AC0D008F463FA300A7F970";

  // 2. Payload iz LearnWorlds ili test-payload.json
  const { buyer, products, payment } = req.body;

  // 3. Priprema SalesInvoice objekta
  const SalesInvoice = {
    buyerName: buyer.company_name || buyer.name,
    buyerEmail: buyer.email,
    buyerTaxNumber: buyer.vat_id || "",
    currency: "EUR",
    date: new Date().toISOString().slice(0, 10),
    methodOfPayment: payment?.method === "bank" ? "BankTransfer" : "Stripe",
    items: products.map((p) => ({
      code:
        p.id === "67d81170a316b9bac4010507"
          ? "EDU-001"
          : p.id === "67d81233b53a971def0d6227"
          ? "EDU-002"
          : "GEN-001",
      name: p.name,
      quantity: 1,
      price: p.price,
      taxRate: 25,
    })),
  };

  const body = {
    username,
    secretKey,
    token,
    method: "SalesInvoiceCreate",
    parameters: {
      SalesInvoice,
    },
  };

  console.log("➡️ Slanje u e-racuni:", JSON.stringify(body, null, 2));

  // 4. Testni način: postavi na false ako želiš stvarno kreirati račun
  const DRY_RUN = true;

  if (DRY_RUN) {
    return res.status(200).json({
      message: "Dry-run payload spreman za e-racune",
      apiCall: body,
    });
  }

  // 5. Stvarni poziv e-racuni API-ja
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("✅ Odgovor e-racuni:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Greška pri slanju na e-racune:", error);
    res.status(500).json({ error: error.message });
  }
}
