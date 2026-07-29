import { WEB3FORMS_KEY } from "./config";

export const emailConfigured = () => WEB3FORMS_KEY.trim().length > 0;

function orderText(order) {
  const lines = order.items.map((i) => `  ${i.qty} x ${i.name} — $${(i.qty * i.price).toFixed(2)}`);
  return [
    `New order from ${order.name}`,
    "",
    `Contact:  ${order.contact}`,
    `Paying by: ${order.payMethod}`,
    "",
    "Items:",
    ...lines,
    "",
    `TOTAL: $${order.total.toFixed(2)}`,
    "",
    order.notes ? `Notes from customer:\n  ${order.notes}` : "No notes.",
    "",
    `Placed: ${new Date(order.createdAt).toLocaleString()}`,
    `Order ID: ${order.id}`,
  ].join("\n");
}

// Emails the order to the shop owner. Resolves true when it was sent, false
// when it wasn't — the caller decides what to tell the customer.
export async function emailOrder(order) {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY.trim(),
        subject: `New Critter Corner order — ${order.name} — $${order.total.toFixed(2)}`,
        from_name: "The Critter Corner",
        // Lets you hit reply in Gmail if the customer gave an email address.
        replyto: order.contact.includes("@") ? order.contact : undefined,
        message: orderText(order),
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && data.success !== false;
  } catch {
    return false;
  }
}
