// Talks to the shared database through /api, so stock and orders are the same
// for everyone instead of living in each visitor's own browser.

async function req(path, { method = "GET", body, pin } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(pin ? { "x-admin-pin": pin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const fetchProducts = () =>
  req("/api/products").then((d) => {
    // A dev server with no API returns the HTML page with a 200, so check the
    // shape rather than trusting the status — otherwise an empty shop looks
    // like a real (but empty) answer and the catalog fallback never runs.
    if (!Array.isArray(d.products)) throw new Error("no product list in response");
    return d.products;
  });

export const placeOrder = (order) => req("/api/orders", { method: "POST", body: order });

export const fetchOrders = (pin) =>
  req("/api/orders", { pin }).then((d) => {
    if (!Array.isArray(d.orders)) throw new Error("no order list in response");
    return d.orders;
  });

export const setOrderStatus = (id, status, pin) =>
  req("/api/orders", { method: "PATCH", body: { id, status }, pin });

export const saveProduct = (product, pin) =>
  req("/api/products", { method: "PUT", body: product, pin });

export const deleteProduct = (id, pin) =>
  req(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE", pin });

// Used by the Manage page to check the PIN before unlocking: the server is the
// thing that actually decides, so the PIN never sits in the site's code.
export async function checkPin(pin) {
  try {
    await fetchOrders(pin);
    return true;
  } catch (e) {
    if (e.status === 401) return false;
    throw e;
  }
}
