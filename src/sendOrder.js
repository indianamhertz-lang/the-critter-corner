import { ORDER_EMAIL, FORMSUBMIT_ALIAS } from "./config";

const target = () => (FORMSUBMIT_ALIAS.trim() || ORDER_EMAIL.trim());

export const emailConfigured = () => target().length > 0;

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

// Emails the order to the shop owner. Resolves true when it was accepted,
// false otherwise — the caller decides what to tell the customer.
export async function emailOrder(order) {
  if (!emailConfigured()) return false;

  const items = Array.isArray(order.items) ? order.items : [];

  // Each item gets its own field, because email clients collapse line breaks
  // inside a single field and the list is the whole point of the email.
  const itemFields = {};
  items.forEach((i, n) => {
    itemFields[`Item ${n + 1}`] = `${i.qty} x ${i.name} — ${money(i.qty * i.price)} (${money(i.price)} each)`;
  });

  const summary = items.map((i) => `${i.qty} x ${i.name}`).join(" • ");

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(target())}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New order — ${summary} — ${money(order.total)} — ${order.name}`,
        _template: "table",
        _captcha: "false",
        Ordered: summary,
        ...itemFields,
        Total: money(order.total),
        Customer: order.name,
        Contact: order.contact,
        "Paying by": order.payMethod || "not given",
        Notes: order.notes?.trim() ? order.notes.trim() : "(none)",
        Placed: new Date(order.createdAt || Date.now()).toLocaleString(),
        "Order ID": order.id,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return res.ok && String(data.success) !== "false";
  } catch {
    return false;
  }
}
