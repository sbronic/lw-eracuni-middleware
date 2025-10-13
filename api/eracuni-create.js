export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // --- 1. Postavke e-racuni API-a
const API_URL = "https://e-racuni.com/H5h/API";
  const username = "BRONICS";
  const secretKey = "31aea4d21d75980bd08b1eed54ef3f74";
  const token = "1A6A66F340AC0D008F463FA300A7F970";

  // --- 2. Ulazni podaci (buyer, products, payment)
  const { buyer, products, payment } = req.body;

  // --- 3. Opcije testiranja
  const TEST_MODE = true;  // ako je true -> račun ide kao TEST verzija
  const DRY_RUN = false;   // ako je true -> ne šalje na e-racune

  // --- 4. Priprema SalesInvoice objekta
  const SalesInvoice = {
    buyerName:
      (TEST_MODE ? "TEST - " : "") + (buyer.company_name || buyer.name),
    buyerEmail: buyer.email,
    buyerTaxNumber: buyer.vat_id || "",
    currency: "EUR",
    date: new Date().toISOString().slice(0, 10),
    methodOfPayment: payment?.method === "bank" ? "BankTransfer" : "Stripe",
    isFiscalized: false,
    status: "Draft",
    note: "Ovo je testni račun generiran putem API integracije.",
    items: products.map((p) => ({
      code:
        p.id === "67d81170a316b9bac4010507"
          ? "EDU-001"
          : p.id === "67d81233b53a971def0d6227"
          ? "EDU-002"
          : "GEN-001",
      name: (TEST_MODE ? "[TEST] " : "") + p.name,
      quantity: 1,
      price: p.price,
      taxRate: 25
    }))
  };

  const body = {
    username,
    secretKey,
    token,
    method: "SalesInvoiceCreate",
    parameters: {
      SalesInvoice
    }
  };

  console.log("➡️ Slanje u e-racuni:", JSON.stringify(body, null, 2));

  // --- 5. Ako je DRY_RUN uključen, samo vraćamo payload
  if (DRY_RUN) {
    return res.status(200).json({
      message: "Dry-run payload spreman za e-racune",
      apiCall: body
    });
  }

  // --- 6. Stvarni poziv prema e-racuni API-ju
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("✅ Odgovor e-racuni:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Greška pri slanju na e-racune:", error);
    res.status(500).json({ error: error.message });
  }
}
