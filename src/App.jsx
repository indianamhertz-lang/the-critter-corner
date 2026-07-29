import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Check,
  ClipboardList,
  Store,
  Loader2,
  PawPrint,
  Lock,
  Trash2,
  Pencil,
  TrendingUp,
  Image as ImageIcon,
  Leaf,
  Squirrel,
  Rabbit,
  Bird,
  Turtle,
  Cat,
  Dog,
  Bug,
} from "lucide-react";
import { storage } from "./storage";
import { CATALOG, CATALOG_VERSION } from "./catalog";

// Change this to whatever PIN you want to use for your private manage page.
const ADMIN_PIN = "crittercorner2319";
const PAY_LABELS = { venmo: "Venmo", paypal: "PayPal", card: "Card" };
const LOW_STOCK_THRESHOLD = 3;

const ACCENT_COLORS = ["#4F7A3D", "#D9A441", "#E8927C", "#7FA8C9", "#B79FD1", "#5FA88A"];

function Butterfly({ size = 16, color = "#C98FA6", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path d="M12 12 C9 6, 2 5, 2 10 C2 14, 8 14, 12 12 Z" fill={color} opacity="0.85" />
      <path d="M12 12 C15 6, 22 5, 22 10 C22 14, 16 14, 12 12 Z" fill={color} opacity="0.85" />
      <path d="M12 12 C10 16, 4 18, 4 21 C4 22.5, 9 21, 12 15 Z" fill={color} opacity="0.6" />
      <path d="M12 12 C14 16, 20 18, 20 21 C20 22.5, 15 21, 12 15 Z" fill={color} opacity="0.6" />
      <line x1="12" y1="9" x2="12" y2="16" stroke="#3B2E23" strokeWidth="0.8" />
    </svg>
  );
}

const CRITTER_ICONS = [Squirrel, Rabbit, Bird, Turtle, Cat, Dog, Bug];
const GARLAND_ITEMS = [Leaf, Butterfly, Leaf, Squirrel, Leaf, Butterfly, Leaf, Rabbit, Leaf, Butterfly, Leaf, Bird];

const CRITTER_GARLAND = (
  <div className="flex items-center justify-center gap-4 sm:gap-6 py-1.5 overflow-hidden" aria-hidden="true">
    {GARLAND_ITEMS.map((Icon, i) => (
      <Icon
        key={i}
        size={13}
        color={Icon === Leaf ? "#4F7A3D" : ACCENT_COLORS[i % ACCENT_COLORS.length]}
        className="critter-bob"
        style={{
          "--r": `${(i % 2 === 0 ? -1 : 1) * (8 + (i % 4) * 4)}deg`,
          opacity: 0.7,
          flexShrink: 0,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

// Scattered decorative critters + leaves for section backdrops. Purely ornamental, non-interactive.
function CritterScatter({ spots }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {spots.map((s, i) => {
        if (s.kind === "butterfly") {
          return (
            <Butterfly
              key={i}
              size={s.size}
              color={ACCENT_COLORS[i % ACCENT_COLORS.length]}
              style={{ position: "absolute", top: s.top, left: s.left, right: s.right, bottom: s.bottom, transform: `rotate(${s.rotate}deg)` }}
            />
          );
        }
        if (s.kind === "leaf") {
          return (
            <Leaf
              key={i}
              size={s.size}
              color="#5FA05E"
              style={{ position: "absolute", top: s.top, left: s.left, right: s.right, bottom: s.bottom, transform: `rotate(${s.rotate}deg)`, opacity: 0.5 }}
            />
          );
        }
        const Icon = CRITTER_ICONS[i % CRITTER_ICONS.length];
        return (
          <Icon
            key={i}
            size={s.size}
            color={ACCENT_COLORS[(i + 2) % ACCENT_COLORS.length]}
            className="critter-bob"
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              "--r": `${s.rotate}deg`,
              opacity: 0.55,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        );
      })}
    </div>
  );
}

const HOME_SPOTS = [
  { top: "1%", left: "2%", rotate: -25, size: 24, kind: "leaf" },
  { top: "6%", right: "3%", rotate: 20, size: 18, kind: "butterfly" },
  { top: "18%", left: "10%", rotate: 10, size: 22, kind: "critter" },
  { top: "22%", right: "12%", rotate: -15, size: 20, kind: "critter" },
  { bottom: "18%", left: "4%", rotate: 15, size: 18, kind: "leaf" },
  { bottom: "10%", right: "5%", rotate: -10, size: 22, kind: "leaf" },
  { bottom: "2%", left: "20%", rotate: 8, size: 20, kind: "critter" },
  { bottom: "4%", right: "22%", rotate: -8, size: 18, kind: "butterfly" },
];

const SHOP_SPOTS = [
  { top: "0%", left: "1%", rotate: -20, size: 20, kind: "leaf" },
  { top: "2%", right: "2%", rotate: 15, size: 18, kind: "butterfly" },
  { bottom: "0%", left: "6%", rotate: 12, size: 18, kind: "critter" },
  { bottom: "2%", right: "8%", rotate: -12, size: 20, kind: "critter" },
];

const MANAGE_SPOTS = [
  { top: "0%", left: "2%", rotate: -18, size: 18, kind: "leaf" },
  { top: "3%", right: "3%", rotate: 15, size: 16, kind: "critter" },
];

function useCollection(prefix) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await storage.list(prefix);
      const keys = listRes?.keys || [];
      const values = await Promise.all(
        keys.map(async (k) => {
          try {
            const r = await storage.get(k);
            return r ? JSON.parse(r.value) : null;
          } catch {
            return null;
          }
        })
      );
      setItems(values.filter(Boolean).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [prefix]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh };
}

export default function App() {
  const [view, setView] = useState("home");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", contact: "", payMethod: "venmo", delivery: "mail", notes: "" });

  const { items: products, loading: productsLoading, refresh: refreshProducts } = useCollection("product:");
  const { items: orders, loading: ordersLoading, refresh: refreshOrders } = useCollection("order:");
  const seeded = useRef(false);

  // Load the catalog into storage on first visit, and again whenever the
  // catalog changes. Stock counts already saved are kept so a re-seed doesn't
  // wipe out sales, but names, prices and photos follow the catalog.
  useEffect(() => {
    if (productsLoading || seeded.current) return;
    seeded.current = true;
    (async () => {
      const seededVersion = (await storage.get("meta:catalogVersion"))?.value;
      if (seededVersion === CATALOG_VERSION && products.length > 0) return;

      const existing = new Map(products.map((p) => [p.id, p]));
      for (const p of CATALOG) {
        const prev = existing.get(p.id);
        try {
          await storage.set(
            `product:${p.id}`,
            JSON.stringify({ ...p, stock: prev?.stock ?? p.stock, createdAt: prev?.createdAt ?? Date.now() })
          );
        } catch {
          /* ignore */
        }
      }
      // Drop anything left over from an older catalog.
      for (const p of products) {
        if (!CATALOG.some((c) => c.id === p.id)) {
          try {
            await storage.delete(`product:${p.id}`);
          } catch {
            /* ignore */
          }
        }
      }
      await storage.set("meta:catalogVersion", CATALOG_VERSION);
      refreshProducts();
    })();
  }, [productsLoading, products, refreshProducts]);

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }))
    .filter((i) => i.id);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = (id) => {
    const product = products.find((p) => p.id === id);
    const currentQty = cart[id] || 0;
    if (product && product.stock != null && currentQty >= product.stock) return;
    setCart((c) => ({ ...c, [id]: currentQty + 1 }));
  };
  const changeQty = (id, delta) =>
    setCart((c) => {
      const product = products.find((p) => p.id === id);
      const cap = product && product.stock != null ? product.stock : Infinity;
      const next = Math.min(cap, Math.max(0, (c[id] || 0) + delta));
      return { ...c, [id]: next };
    });

  const submitOrder = async () => {
    if (!form.name.trim() || !form.contact.trim()) {
      setError("Please add your name and a way to reach you.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setError("");
    setSubmitting(true);
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      name: form.name.trim(),
      contact: form.contact.trim(),
      payMethod: form.payMethod,
      delivery: form.delivery,
      notes: form.notes.trim(),
      items: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      total: cartTotal,
      status: "new",
    };
    try {
      const res = await storage.set(`order:${order.id}`, JSON.stringify(order));
      if (!res) throw new Error("save failed");
      // Decrease stock for each item ordered.
      for (const item of cartItems) {
        const current = products.find((p) => p.id === item.id);
        if (current) {
          const updated = { ...current, stock: Math.max(0, (current.stock ?? 0) - item.qty) };
          await storage.set(`product:${current.id}`, JSON.stringify(updated));
        }
      }
      refreshProducts();
      setSubmitted(true);
      setCart({});
    } catch {
      setError("Something went wrong sending your order — please try again.");
    }
    setSubmitting(false);
  };

  const markFulfilled = async (order) => {
    try {
      const updated = { ...order, status: order.status === "fulfilled" ? "new" : "fulfilled" };
      await storage.set(`order:${order.id}`, JSON.stringify(updated));
      refreshOrders();
    } catch {
      /* ignore */
    }
  };

  const saveProduct = async (product) => {
    const toSave = { ...product, createdAt: product.createdAt || Date.now() };
    await storage.set(`product:${product.id}`, JSON.stringify(toSave));
    refreshProducts();
  };

  const deleteProduct = async (id) => {
    try {
      await storage.delete(`product:${id}`);
      refreshProducts();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF3", color: "#3B2E23" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Quicksand:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');
        .font-display { font-family: 'Caveat', cursive; }
        .font-body { font-family: 'Quicksand', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        @keyframes critterBob {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-5px) rotate(var(--r, 0deg)); }
        }
        .critter-bob { animation: critterBob 2.6s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur border-b-2" style={{ background: "rgba(245,239,221,0.92)", borderColor: "#4F7A3D" }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-2">
          <button onClick={() => setView("home")} className="font-display text-4xl font-bold flex items-center gap-2" style={{ color: "#4F7A3D" }}>
            <Leaf size={24} style={{ transform: "rotate(-20deg)" }} />
            The Critter Corner
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("home")}
              className="hidden sm:block font-body text-sm font-semibold px-3 py-2 rounded-full"
              style={{ color: view === "home" ? "#4F7A3D" : "#8A7C6A" }}
            >
              Home
            </button>
            <button
              onClick={() => setView("shop")}
              className="font-body text-sm font-semibold px-3 py-2 rounded-full"
              style={{ color: view === "shop" ? "#4F7A3D" : "#8A7C6A" }}
            >
              Shop
            </button>
            <button
              onClick={() => setView(view === "manage" ? "home" : "manage")}
              className="font-body text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-full border-2"
              style={{ borderColor: "#4F7A3D", color: "#4F7A3D" }}
            >
              {view === "manage" ? <Store size={15} /> : <Lock size={15} />}
              {view === "manage" ? "Back to shop" : "Manage"}
            </button>
            {(view === "shop" || view === "home") && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative font-body text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-full"
                style={{ background: "#D9A441", color: "#3B2E23" }}
              >
                <ShoppingBag size={15} />
                Cart
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono"
                    style={{ background: "#E8927C", color: "#3B2E23" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        <div style={{ color: "#4F7A3D" }}>{CRITTER_GARLAND}</div>
      </header>

      {view === "home" && <HomeView products={products} onShopNow={() => setView("shop")} />}
      {view === "shop" && <ShopView products={products} loading={productsLoading} onAdd={addToCart} />}
      {view === "manage" && (
        <ManageView
          products={products}
          orders={orders}
          ordersLoading={ordersLoading}
          onToggleOrder={markFulfilled}
          onRefreshOrders={refreshOrders}
          onSaveProduct={saveProduct}
          onDeleteProduct={deleteProduct}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0" style={{ background: "rgba(59,46,35,0.5)" }} onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm h-full p-5 flex flex-col" style={{ background: "#FFFBF3" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold" style={{ color: "#3B2E23" }}>
                Your cart
              </h2>
              <button onClick={() => setCartOpen(false)}>
                <X size={20} color="#3B2E23" />
              </button>
            </div>
            {cartItems.length === 0 ? (
              <p className="font-body text-sm font-medium" style={{ color: "#8A7C6A" }}>
                Nothing here yet — add a critter from the shop.
              </p>
            ) : (
              <div className="flex-1 overflow-auto space-y-3">
                {cartItems.map((i) => (
                  <div key={i.id} className="flex items-center justify-between font-body text-sm font-medium">
                    <div>
                      <p style={{ color: "#3B2E23" }}>{i.name}</p>
                      <p className="font-mono text-xs" style={{ color: "#8A7C6A" }}>
                        ${i.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(i.id, -1)} className="p-1 rounded-full border-2" style={{ borderColor: "#4F7A3D" }}>
                        <Minus size={12} color="#4F7A3D" />
                      </button>
                      <span className="font-mono w-4 text-center" style={{ color: "#3B2E23" }}>
                        {i.qty}
                      </span>
                      <button onClick={() => changeQty(i.id, 1)} className="p-1 rounded-full border-2" style={{ borderColor: "#4F7A3D" }}>
                        <Plus size={12} color="#4F7A3D" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t-2" style={{ borderColor: "#4F7A3D" }}>
              <div className="flex justify-between font-mono text-sm mb-3" style={{ color: "#3B2E23" }}>
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="w-full py-2.5 rounded-full font-body font-semibold text-sm disabled:opacity-40"
                style={{ background: "#4F7A3D", color: "#FFFDF7" }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(59,46,35,0.6)" }}
            onClick={() => {
              setCheckoutOpen(false);
              setSubmitted(false);
            }}
          />
          <div className="relative w-full max-w-sm rounded-3xl p-5 border-2" style={{ background: "#FFFFFF", borderColor: "#4F7A3D" }}>
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#4F7A3D" }}>
                  <Check size={22} color="#FFFDF7" />
                </div>
                <h3 className="font-display text-2xl font-bold mb-1" style={{ color: "#3B2E23" }}>
                  Order sent!
                </h3>
                <p className="font-body text-sm font-medium" style={{ color: "#6B5C4C" }}>
                  You'll get a note back on how to send payment via {PAY_LABELS[form.payMethod] || form.payMethod}.
                </p>
                <button
                  onClick={() => {
                    setCheckoutOpen(false);
                    setSubmitted(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-full font-body font-semibold text-sm"
                  style={{ background: "#D9A441", color: "#3B2E23" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold mb-3" style={{ color: "#3B2E23" }}>
                  Checkout
                </h2>
                <div className="space-y-3">
                  <input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none"
                    style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
                  />
                  <input
                    placeholder="Phone or email"
                    value={form.contact}
                    onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none"
                    style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
                  />
                  <div>
                    <p className="font-body text-xs font-semibold mb-1.5" style={{ color: "#8A7C6A" }}>
                      How you'll pay
                    </p>
                    <div className="flex gap-2">
                      {["venmo", "paypal", "card"].map((m) => (
                        <button
                          key={m}
                          onClick={() => setForm((f) => ({ ...f, payMethod: m }))}
                          className="flex-1 py-2 rounded-xl font-body text-sm font-semibold border-2"
                          style={{
                            borderColor: form.payMethod === m ? "#4F7A3D" : "#C9BB9E",
                            background: form.payMethod === m ? "rgba(79,122,61,0.12)" : "transparent",
                            color: form.payMethod === m ? "#4F7A3D" : "#8A7C6A",
                          }}
                        >
                          {PAY_LABELS[m]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="Notes (colors, sizing, mailing address...)"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl font-body text-sm outline-none resize-none"
                    style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
                  />
                  <div className="flex justify-between font-mono text-sm pt-1" style={{ color: "#3B2E23" }}>
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {error && (
                    <p className="font-body text-xs font-semibold" style={{ color: "#C4553E" }}>
                      {error}
                    </p>
                  )}
                  <button
                    onClick={submitOrder}
                    disabled={submitting}
                    className="w-full py-2.5 rounded-full font-body font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "#4F7A3D", color: "#FFFDF7" }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    {submitting ? "Sending..." : "Send order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductPhoto({ product, size = 40 }) {
  if (product.photo) {
    // Product shots are square cut-outs on white, so contain them rather than
    // cropping — otherwise flippers, keyrings and tails get sliced off.
    return <img src={product.photo} alt={product.name} className="w-full h-full object-contain" />;
  }
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ background: product.bg || "#DCE8D0" }}>
      <PawPrint size={size} color="#3B2E23" strokeWidth={1.75} />
    </div>
  );
}

function HomeView({ products, onShopNow }) {
  const featured = products.slice(0, 3);
  return (
    <main className="max-w-5xl mx-auto px-5 pb-24">
      <section className="pt-14 pb-10 text-center relative">
        <CritterScatter spots={HOME_SPOTS} />
        <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: "#7C8B6F" }}>
          a field guide to handmade friends
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-3" style={{ color: "#3B2E23" }}>
          Cute critters,<br />crocheted with love
        </h1>
        <p className="font-body text-sm sm:text-base max-w-md mx-auto font-medium mb-2" style={{ color: "#6B5C4C" }}>
          Every piece is stitched by hand, one critter at a time. Browse the shop, pick your favorites, and send
          your order — payment details come right after.
        </p>
        <p className="font-display text-2xl mb-6" style={{ color: "#4F7A3D" }}>
          handmade with love by Indiana
        </p>
        <button onClick={onShopNow} className="font-body font-semibold text-sm px-6 py-3 rounded-full relative z-10" style={{ background: "#4F7A3D", color: "#FFFDF7" }}>
          See all critters
        </button>
      </section>

      {featured.length > 0 && (
        <section>
          <p className="font-display text-2xl font-bold text-center mb-4" style={{ color: "#3B2E23" }}>
            A few recent favorites
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map((p) => (
              <div key={p.id} className="rounded-3xl overflow-hidden border-2 flex flex-col" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
                <div className="aspect-square" style={{ background: "#FFFFFF" }}>
                  <ProductPhoto product={p} size={44} />
                </div>
                <div className="p-3">
                  <h3 className="font-display text-xl font-semibold" style={{ color: "#3B2E23" }}>
                    {p.name}
                  </h3>
                  <p className="font-mono text-sm mt-1" style={{ color: "#D9A441" }}>
                    ${p.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl border-2 p-5" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
          <p className="font-display text-2xl font-bold mb-2" style={{ color: "#3B2E23" }}>
            About the maker
          </p>
          <p className="font-body text-sm font-medium" style={{ color: "#6B5C4C" }}>
            Hi, I'm Indiana! I crochet every critter and cozy piece here by hand, usually a few stitches at a time
            between everything else life throws at me. Thanks for supporting a small handmade shop — it means a lot.
          </p>
        </div>
        <div className="rounded-3xl border-2 p-5" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
          <p className="font-display text-2xl font-bold mb-2" style={{ color: "#3B2E23" }}>
            Good to know
          </p>
          <ul className="font-body text-sm font-medium space-y-1.5" style={{ color: "#6B5C4C" }}>
            <li>• Everything ships by mail.</li>
            <li>• Sold-out items may come back in stock — check back!</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function ShopView({ products, loading, onAdd }) {
  return (
    <main className="max-w-5xl mx-auto px-5 pb-24">
      <section className="pt-10 pb-6 text-center relative">
        <CritterScatter spots={SHOP_SPOTS} />
        <h2 className="font-display text-5xl font-bold" style={{ color: "#3B2E23" }}>
          All the critters
        </h2>
        <p className="font-body text-sm font-medium mt-1" style={{ color: "#6B5C4C" }}>
          Tap "Add" to send one home with you.
        </p>
      </section>

      {loading ? (
        <p className="font-body text-sm text-center font-medium" style={{ color: "#8A7C6A" }}>
          Loading...
        </p>
      ) : products.length === 0 ? (
        <p className="font-body text-sm text-center font-medium" style={{ color: "#8A7C6A" }}>
          Nothing in the shop yet.
        </p>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((p) => {
            const soldOut = (p.stock ?? 0) <= 0;
            return (
              <div key={p.id} className="rounded-3xl overflow-hidden border-2 flex flex-col" style={{ borderColor: "#4F7A3D", background: "#FFFFFF", opacity: soldOut ? 0.55 : 1 }}>
                <div className="aspect-square relative" style={{ background: "#FFFFFF" }}>
                  <ProductPhoto product={p} size={40} />
                  {soldOut && (
                    <span
                      className="absolute top-2 right-2 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#3B2E23", color: "#FFFDF7" }}
                    >
                      SOLD OUT
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-display text-xl font-semibold leading-snug" style={{ color: "#3B2E23" }}>
                    {p.name}
                  </h3>
                  <p className="font-body text-xs mt-1 flex-1 font-medium" style={{ color: "#8A7C6A" }}>
                    {p.blurb}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono text-sm" style={{ color: "#D9A441" }}>
                      ${p.price}
                    </span>
                    <button
                      onClick={() => onAdd(p.id)}
                      disabled={soldOut}
                      className="text-xs font-body font-semibold px-3 py-1.5 rounded-full disabled:opacity-60"
                      style={{ background: soldOut ? "#8A7C6A" : "#4F7A3D", color: "#FFFDF7" }}
                    >
                      {soldOut ? "Sold out" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}

function ManageView({ products, orders, ordersLoading, onToggleOrder, onRefreshOrders, onSaveProduct, onDeleteProduct }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [tab, setTab] = useState("products");

  if (!unlocked) {
    return (
      <main className="max-w-sm mx-auto px-5 pt-16 pb-24 text-center">
        <Lock size={28} color="#4F7A3D" className="mx-auto mb-3" />
        <h2 className="font-display text-4xl font-bold mb-2" style={{ color: "#3B2E23" }}>
          Manage page
        </h2>
        <p className="font-body text-sm font-medium mb-4" style={{ color: "#6B5C4C" }}>
          Enter your PIN to edit products and see orders.
        </p>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="w-full text-center px-3 py-2 rounded-xl font-mono text-lg outline-none mb-2"
          style={{ background: "#FFFFFF", border: "2px solid #C9BB9E", color: "#3B2E23" }}
        />
        {pinError && (
          <p className="font-body text-xs font-semibold mb-2" style={{ color: "#C4553E" }}>
            {pinError}
          </p>
        )}
        <button
          onClick={() => {
            if (pin === ADMIN_PIN) {
              setUnlocked(true);
              setPinError("");
            } else {
              setPinError("That's not the right PIN.");
            }
          }}
          className="w-full py-2.5 rounded-full font-body font-semibold text-sm"
          style={{ background: "#4F7A3D", color: "#FFFDF7" }}
        >
          Unlock
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-5 pb-24 pt-8 relative">
      <CritterScatter spots={MANAGE_SPOTS} />
      <div className="flex gap-2 mb-6 flex-wrap relative z-10">
        {[
          { id: "products", label: "Products" },
          { id: "orders", label: "Orders" },
          { id: "popular", label: "Most popular" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="font-body text-sm font-semibold px-4 py-2 rounded-full border-2"
            style={{
              borderColor: "#4F7A3D",
              background: tab === t.id ? "#4F7A3D" : "transparent",
              color: tab === t.id ? "#FFFDF7" : "#4F7A3D",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && <ProductsTab products={products} onSave={onSaveProduct} onDelete={onDeleteProduct} />}
      {tab === "orders" && (
        <OrdersTab orders={orders} loading={ordersLoading} onToggle={onToggleOrder} onRefresh={onRefreshOrders} />
      )}
      {tab === "popular" && <PopularTab orders={orders} products={products} />}
    </main>
  );
}

function emptyDraft() {
  return { id: null, name: "", price: "", blurb: "", photo: null, bg: "#DCE8D0", stock: "5" };
}

function ProductsTab({ products, onSave, onDelete }) {
  const [draft, setDraft] = useState(emptyDraft());
  const [editingId, setEditingId] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({ id: p.id, name: p.name, price: String(p.price), blurb: p.blurb, photo: p.photo, bg: p.bg || "#DCE8D0", stock: String(p.stock ?? 0) });
  };

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setPhotoError("");
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setPhotoError("That photo is a bit large — try one under 4MB.");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!draft.name.trim() || !draft.price) return;
    const id = editingId || `p_${Date.now()}`;
    await onSave({
      id,
      name: draft.name.trim(),
      price: parseFloat(draft.price) || 0,
      blurb: draft.blurb.trim(),
      photo: draft.photo,
      bg: draft.bg,
      stock: Math.max(0, parseInt(draft.stock, 10) || 0),
    });
    resetForm();
  };

  return (
    <div>
      <div className="rounded-2xl border-2 p-4 mb-6" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
        <h3 className="font-display text-2xl font-bold mb-3" style={{ color: "#3B2E23" }}>
          {editingId ? "Edit product" : "Add a product"}
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 flex items-center justify-center overflow-hidden shrink-0"
              style={{ borderColor: "#C9BB9E", background: draft.photo ? "transparent" : "#FFFBF3" }}
            >
              {draft.photo ? (
                <img src={draft.photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={22} color="#8A7C6A" />
              )}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <div className="flex-1 space-y-2">
              <input
                placeholder="Product name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none"
                style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                  className="w-1/2 px-3 py-2 rounded-lg font-body text-sm outline-none"
                  style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
                />
                <input
                  type="number"
                  placeholder="In stock"
                  value={draft.stock}
                  onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                  className="w-1/2 px-3 py-2 rounded-lg font-body text-sm outline-none"
                  style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
                />
              </div>
            </div>
          </div>
          <textarea
            placeholder="Short description"
            value={draft.blurb}
            onChange={(e) => setDraft((d) => ({ ...d, blurb: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-lg font-body text-sm outline-none resize-none"
            style={{ background: "#FFFBF3", border: "2px solid #C9BB9E", color: "#3B2E23" }}
          />
          {photoError && (
            <p className="font-body text-xs font-semibold" style={{ color: "#C4553E" }}>
              {photoError}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 py-2 rounded-full font-body font-semibold text-sm" style={{ background: "#4F7A3D", color: "#FFFDF7" }}>
              {editingId ? "Save changes" : "Add product"}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 py-2 rounded-full font-body font-semibold text-sm border-2" style={{ borderColor: "#C9BB9E", color: "#8A7C6A" }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {products.some((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD) && (
        <div className="rounded-xl border-2 p-3 mb-4" style={{ borderColor: "#E8927C", background: "#FDEDE7" }}>
          <p className="font-body text-xs font-bold mb-1" style={{ color: "#C4553E" }}>
            Running low
          </p>
          <p className="font-body text-xs font-medium" style={{ color: "#8A5B4C" }}>
            {products
              .filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
              .map((p) => `${p.name} (${p.stock ?? 0} left)`)
              .join(", ")}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => {
          const low = (p.stock ?? 0) <= LOW_STOCK_THRESHOLD;
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border-2 p-3" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <ProductPhoto product={p} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold truncate" style={{ color: "#3B2E23" }}>
                  {p.name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs" style={{ color: "#D9A441" }}>
                    ${p.price}
                  </p>
                  <p className="font-mono text-xs font-bold" style={{ color: low ? "#C4553E" : "#8A7C6A" }}>
                    {low ? `⚠ ${p.stock ?? 0} left` : `${p.stock ?? 0} in stock`}
                  </p>
                </div>
              </div>
              <button onClick={() => startEdit(p)} className="p-2 rounded-full border-2" style={{ borderColor: "#4F7A3D" }}>
                <Pencil size={14} color="#4F7A3D" />
              </button>
              <button onClick={() => onDelete(p.id)} className="p-2 rounded-full border-2" style={{ borderColor: "#C4553E" }}>
                <Trash2 size={14} color="#C4553E" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersTab({ orders, loading, onToggle, onRefresh }) {
  const newOrders = orders.filter((o) => o.status !== "fulfilled");
  const fulfilled = orders.filter((o) => o.status === "fulfilled");
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="font-body text-xs font-medium" style={{ color: "#8A7C6A" }}>
          {orders.length} total · ${revenue.toFixed(2)} lifetime
        </p>
        <button onClick={onRefresh} className="text-xs font-body font-semibold px-3 py-1.5 rounded-full border-2" style={{ borderColor: "#4F7A3D", color: "#4F7A3D" }}>
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="font-body text-sm font-medium" style={{ color: "#8A7C6A" }}>
          Loading...
        </p>
      ) : orders.length === 0 ? (
        <p className="font-body text-sm font-medium" style={{ color: "#8A7C6A" }}>
          No orders yet.
        </p>
      ) : (
        <div className="space-y-6">
          {newOrders.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "#4F7A3D" }}>
                New
              </p>
              <div className="space-y-2">
                {newOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onToggle={onToggle} />
                ))}
              </div>
            </div>
          )}
          {fulfilled.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "#D9A441" }}>
                Fulfilled
              </p>
              <div className="space-y-2">
                {fulfilled.map((o) => (
                  <OrderCard key={o.id} order={o} onToggle={onToggle} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PopularTab({ orders, products }) {
  const counts = {};
  orders.forEach((o) => {
    (o.items || []).forEach((i) => {
      counts[i.id] = (counts[i.id] || 0) + i.qty;
    });
  });
  const ranked = Object.entries(counts)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty, id }))
    .sort((a, b) => b.qty - a.qty);

  if (ranked.length === 0) {
    return (
      <p className="font-body text-sm font-medium" style={{ color: "#8A7C6A" }}>
        Nothing sold yet — once orders come in, your best sellers will show up here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {ranked.map((r, idx) => (
        <div key={r.id} className="flex items-center gap-3 rounded-xl border-2 p-3" style={{ borderColor: "#4F7A3D", background: "#FFFFFF" }}>
          <span className="font-mono text-sm w-6 text-center" style={{ color: "#D9A441" }}>
            #{idx + 1}
          </span>
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
            {r.product ? <ProductPhoto product={r.product} size={16} /> : <div className="w-full h-full" style={{ background: "#DCE8D0" }} />}
          </div>
          <div className="flex-1">
            <p className="font-body text-sm font-semibold" style={{ color: "#3B2E23" }}>
              {r.product ? r.product.name : "Removed item"}
            </p>
          </div>
          <span className="font-mono text-xs flex items-center gap-1" style={{ color: "#8A7C6A" }}>
            <TrendingUp size={12} />
            {r.qty} sold
          </span>
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onToggle }) {
  const done = order.status === "fulfilled";
  return (
    <div className="rounded-2xl p-4 border-2 font-body text-sm" style={{ borderColor: "#4F7A3D", background: "#FFFFFF", opacity: done ? 0.6 : 1 }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold" style={{ color: "#3B2E23" }}>
            {order.name}
          </p>
          <p className="text-xs font-medium" style={{ color: "#8A7C6A" }}>
            {order.contact} · pays via {order.payMethod}
          </p>
        </div>
        <span className="font-mono text-sm" style={{ color: "#D9A441" }}>
          ${order.total?.toFixed(2)}
        </span>
      </div>
      <ul className="text-xs font-medium mt-2 space-y-0.5" style={{ color: "#6B5C4C" }}>
        {order.items?.map((i) => (
          <li key={i.id}>
            {i.qty}× {i.name}
          </li>
        ))}
      </ul>
      {order.notes && (
        <p className="text-xs mt-2 italic font-medium" style={{ color: "#8A7C6A" }}>
          "{order.notes}"
        </p>
      )}
      <button
        onClick={() => onToggle(order)}
        className="mt-3 text-xs font-semibold px-3 py-1 rounded-full border-2"
        style={{ borderColor: done ? "#D9A441" : "#4F7A3D", color: done ? "#D9A441" : "#4F7A3D" }}
      >
        {done ? "Mark as new" : "Mark fulfilled"}
      </button>
    </div>
  );
}
