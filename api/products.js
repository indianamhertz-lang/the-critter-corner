import { sql, configured, init, rowToProduct, isAdmin, send } from "./_db.js";
import { CATALOG, CATALOG_VERSION } from "../shared/catalog.js";

// Loads the catalog into an empty shop, and re-applies it when Indiana bumps
// CATALOG_VERSION (that's her signal that prices or stock changed on purpose).
async function syncCatalog() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM products`;
  const rows = await sql`SELECT value FROM meta WHERE key = 'catalogVersion'`;
  const seeded = rows[0]?.value;
  if (count > 0 && seeded === CATALOG_VERSION) return;

  const now = Date.now();
  for (let i = 0; i < CATALOG.length; i++) {
    const p = CATALOG[i];
    await sql`
      INSERT INTO products (id, name, price, blurb, photo, bg, stock, sort, created_at)
      VALUES (${p.id}, ${p.name}, ${p.price}, ${p.blurb || ""}, ${p.photo}, ${p.bg}, ${p.stock}, ${i}, ${now})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, price = EXCLUDED.price, blurb = EXCLUDED.blurb,
        photo = EXCLUDED.photo, bg = EXCLUDED.bg, stock = EXCLUDED.stock,
        sort = EXCLUDED.sort`;
  }
  const ids = CATALOG.map((p) => p.id);
  await sql`DELETE FROM products WHERE NOT (id = ANY(${ids}))`;
  await sql`
    INSERT INTO meta (key, value) VALUES ('catalogVersion', ${CATALOG_VERSION})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}

export default async function handler(req, res) {
  if (!configured) return send(res, 503, { error: "database not configured" });
  try {
    await init();

    if (req.method === "GET") {
      await syncCatalog();
      const rows = await sql`SELECT * FROM products ORDER BY sort, created_at`;
      return send(res, 200, { products: rows.map(rowToProduct) });
    }

    if (!isAdmin(req)) return send(res, 401, { error: "not allowed" });

    if (req.method === "PUT") {
      const p = req.body || {};
      if (!p.id || !p.name) return send(res, 400, { error: "id and name required" });
      await sql`
        INSERT INTO products (id, name, price, blurb, photo, bg, stock, sort, created_at)
        VALUES (${p.id}, ${p.name}, ${p.price || 0}, ${p.blurb || ""}, ${p.photo || null},
                ${p.bg || null}, ${p.stock ?? 0}, 9999, ${p.createdAt || Date.now()})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, price = EXCLUDED.price, blurb = EXCLUDED.blurb,
          photo = EXCLUDED.photo, bg = EXCLUDED.bg, stock = EXCLUDED.stock`;
      return send(res, 200, { ok: true });
    }

    if (req.method === "DELETE") {
      const id = req.query?.id || req.body?.id;
      if (!id) return send(res, 400, { error: "id required" });
      await sql`DELETE FROM products WHERE id = ${id}`;
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: "method not allowed" });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}
