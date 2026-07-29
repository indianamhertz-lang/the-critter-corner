import { neon } from "@neondatabase/serverless";

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED;

export const configured = Boolean(url);
export const sql = configured ? neon(url) : null;

let ready = false;

// Creates the tables on first use and loads the catalog if the shop is empty,
// so a fresh database fills itself in without a separate setup step.
export async function init() {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      price       NUMERIC NOT NULL DEFAULT 0,
      blurb       TEXT DEFAULT '',
      photo       TEXT,
      bg          TEXT,
      stock       INTEGER NOT NULL DEFAULT 0,
      sort        INTEGER NOT NULL DEFAULT 0,
      created_at  BIGINT NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      contact     TEXT NOT NULL,
      pay_method  TEXT,
      notes       TEXT DEFAULT '',
      items       JSONB NOT NULL,
      total       NUMERIC NOT NULL,
      status      TEXT NOT NULL DEFAULT 'new',
      emailed     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  BIGINT NOT NULL
    )`;
  await sql`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)`;
  ready = true;
}

export function rowToProduct(r) {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    blurb: r.blurb || "",
    photo: r.photo,
    bg: r.bg,
    stock: Number(r.stock),
    createdAt: Number(r.created_at),
  };
}

export function rowToOrder(r) {
  return {
    id: r.id,
    name: r.name,
    contact: r.contact,
    payMethod: r.pay_method,
    notes: r.notes || "",
    items: r.items,
    total: Number(r.total),
    status: r.status,
    emailed: r.emailed,
    createdAt: Number(r.created_at),
  };
}

// Admin writes must present the PIN. Set ADMIN_PIN in Vercel to something only
// Indiana knows; without it the endpoints stay read-only for everyone.
export function isAdmin(req) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) return false;
  const given = req.headers["x-admin-pin"];
  return typeof given === "string" && given === expected;
}

export function send(res, status, body) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(body));
}
