import { ORDER_EMAIL, FORMSUBMIT_ALIAS } from "./config";

const target = () => (FORMSUBMIT_ALIAS.trim() || ORDER_EMAIL.trim());

export const emailConfigured = () => target().length > 0;

function orderText(order) {
  const lines = order.items.map((i) => `  ${i.qty} x ${i.name} — $${(i.qty * i.price).toFixed(2)}`);
  return [
    `Contact:   ${order.contact}`,
    `Paying by: ${order.payMethod}`,
    "",
    "Items:",
    ...lines,
    "",
    `TOTAL: $${order.total.toFixed(2)}`,
    "",
    order.notes ? `Notes from customer:\n  ${order.notes}` : "No notes.",
    "",
    `Placed:   ${new Date(order.createdAt).toLocaleString()}`,
    `Order ID: ${order.id}`,
  ].join("\n");
}

// Emails the order to the shop owner. Resolves true when it was accepted,
// false otherwise — the caller decides what to tell the customer.
export async function emailOrder(order) {
  if (!emailConfigured()) return false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(target())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New Critter Corner order — ${order.name} — $${order.total.toFixed(2)}`,
        _template: "table",
        // Skip FormSubmit's own captcha page; this is a background request.
        _captcha: "false",
        Name: order.name,
        Contact: order.contact,
        Total: `$${order.total.toFixed(2)}`,
        Order: orderText(order),
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && String(data.success) !== "false";
  } catch {
    return false;
  }
}
