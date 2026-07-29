import { sql, configured, init, rowToOrder, isAdmin, send } from "./_db.js";

export default async function handler(req, res) {
  if (!configured) return send(res, 503, { error: "database not configured" });
  try {
    await init();

    // Anyone can place an order; only Indiana can read or change them.
    if (req.method === "POST") {
      const o = req.body || {};
      if (!o.name?.trim() || !o.contact?.trim()) return send(res, 400, { error: "name and contact required" });
      const items = Array.isArray(o.items) ? o.items : [];
      if (items.length === 0) return send(res, 400, { error: "no items" });

      // Take the stock first. Each update only succeeds while enough is left,
      // so two people racing for the last critter can't both win.
      const taken = [];
      for (const item of items) {
        const qty = Math.max(1, Number(item.qty) || 1);
        const rows = await sql`
          UPDATE products SET stock = stock - ${qty}
          WHERE id = ${item.id} AND stock >= ${qty}
          RETURNING id, name, stock`;
        if (rows.length === 0) {
          // Put back whatever we already claimed, then report what ran out.
          for (const t of taken) {
            await sql`UPDATE products SET stock = stock + ${t.qty} WHERE id = ${t.id}`;
          }
          const [p] = await sql`SELECT name, stock FROM products WHERE id = ${item.id}`;
          return send(res, 409, {
            error: "out_of_stock",
            item: p?.name || item.name,
            remaining: p ? Number(p.stock) : 0,
          });
        }
        taken.push({ id: item.id, qty });
      }

      const id = o.id || `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await sql`
        INSERT INTO orders (id, name, contact, pay_method, notes, items, total, status, emailed, created_at)
        VALUES (${id}, ${o.name.trim()}, ${o.contact.trim()}, ${o.payMethod || ""}, ${o.notes || ""},
                ${JSON.stringify(items)}, ${o.total || 0}, 'new', ${Boolean(o.emailed)},
                ${o.createdAt || Date.now()})
        ON CONFLICT (id) DO NOTHING`;
      return send(res, 200, { ok: true, id });
    }

    if (!isAdmin(req)) return send(res, 401, { error: "not allowed" });

    if (req.method === "GET") {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return send(res, 200, { orders: rows.map(rowToOrder) });
    }

    if (req.method === "PATCH") {
      const { id, status } = req.body || {};
      if (!id || !status) return send(res, 400, { error: "id and status required" });
      await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: "method not allowed" });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}
