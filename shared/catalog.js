// Product catalog — the source of truth for what's in the shop.
// `photo` points at a file in public/products, so images ship with the site
// instead of living in browser storage.
//
// Prices and stock counts come from Indiana. Update them here, or from the
// Manage page for quick stock changes.

export const CATALOG = [
  // Turtles
  { id: "turtle-watermelon", name: "Watermelon Turtle", price: 20, blurb: "Big cuddly turtle with a watermelon shell.", photo: "/products/turtles-watermelon-012.jpg", bg: "#DCEEDB", stock: 1 },
  { id: "turtle-dragonfruit", name: "Dragon Fruit Turtle", price: 20, blurb: "Coral shell with speckled dragon fruit flesh.", photo: "/products/turtles-dragon-fruit-003.jpg", bg: "#FBD8E0", stock: 1 },
  { id: "turtle-strawberry", name: "Strawberry Turtle", price: 20, blurb: "Soft pink shell with a little green top.", photo: "/products/turtles-strawberry-017.jpg", bg: "#FBD8E0", stock: 1 },
  { id: "turtle-blueberry", name: "Blueberry Turtle", price: 20, blurb: "Sage green shell with a berry crown.", photo: "/products/turtles-blueberry-007.jpg", bg: "#DCEEDB", stock: 1 },

  // Bees
  { id: "bee-yellow", name: "Bee - Yellow", price: 14, blurb: "Classic black and yellow bumble bee.", photo: "/products/bee-yellow-022.jpg", bg: "#FFE9B3", stock: 4 },
  { id: "bee-pink", name: "Bee - Pink", price: 14, blurb: "Soft pink and black stripes.", photo: "/products/bee-pink-027.jpg", bg: "#FBD8E0", stock: 2 },
  { id: "bee-blue", name: "Bee - Blue", price: 14, blurb: "Mint blue stripes with fluffy wings.", photo: "/products/bee-blue-032.jpg", bg: "#DCEEDB", stock: 2 },

  // Octopus
  { id: "octopus-brown", name: "Octopus - Brown", price: 7, blurb: "Tiny curled-up octopus.", photo: "/products/octopus-brown-082.jpg", bg: "#E8D9BF", stock: 2 },
  { id: "octopus-teal", name: "Octopus - Teal", price: 7, blurb: "Bright mint tentacles.", photo: "/products/octopus-teal-087.jpg", bg: "#DCEEDB", stock: 2 },
  { id: "octopus-pink", name: "Octopus - Pink", price: 7, blurb: "Dusty pink little friend.", photo: "/products/octopus-pink-093.jpg", bg: "#FBD8E0", stock: 2 },
  { id: "octopus-blue", name: "Octopus - Blue", price: 7, blurb: "Soft sage blue octopus.", photo: "/products/octopus-blue-098.jpg", bg: "#DCEEDB", stock: 2 },
  { id: "octopus-leopard", name: "Octopus - Leopard", price: 7, blurb: "Speckled leopard print octopus.", photo: "/products/octopus-leopard-077.jpg", bg: "#EDEDE6", stock: 2 },

  // Chickens
  { id: "chicken-white", name: "Chicken - White", price: 12, blurb: "Little white hen with a red comb.", photo: "/products/chickens-white-106.jpg", bg: "#FFFDF7", stock: 2 },
  { id: "chicken-brown", name: "Chicken - Brown", price: 12, blurb: "Warm golden brown hen.", photo: "/products/chickens-brown-113.jpg", bg: "#E8D9BF", stock: 2 },
  { id: "chicken-leopard", name: "Chicken - Leopard", price: 12, blurb: "Speckled hen with a red comb.", photo: "/products/chickens-leopard-109.jpg", bg: "#EDEDE6", stock: 2 },

  // Loaf cats
  { id: "loafcat-white", name: "Loaf Cat - White", price: 14, blurb: "A cat, loafing.", photo: "/products/loaf-cats-white-042.jpg", bg: "#FFFDF7", stock: 2 },
  { id: "loafcat-leopard", name: "Loaf Cat - Leopard Print", price: 14, blurb: "Speckled loaf with a long tail.", photo: "/products/loaf-cats-leopard-print-038.jpg", bg: "#EDEDE6", stock: 2 },

  // Axolotls
  { id: "axolotl-pink", name: "Axolotl - Pink", price: 8, blurb: "Pink axolotl with mint frills.", photo: "/products/axolotol-pink-055.jpg", bg: "#FBD8E0", stock: 2 },
  { id: "axolotl-teal", name: "Axolotl - Teal", price: 8, blurb: "Mint axolotl with pink frills.", photo: "/products/axolotol-teal-051.jpg", bg: "#DCEEDB", stock: 2 },

  // Leggy frogs
  { id: "frog-light-green", name: "Leggy Frog - Light Green", price: 7, blurb: "Bright green frog with long legs.", photo: "/products/leggy-frog-light-green-149.jpg", bg: "#DCEEDB", stock: 4 },
  { id: "frog-dark-green", name: "Leggy Frog - Dark Green", price: 7, blurb: "Sage green frog with long legs.", photo: "/products/leggy-frog-dark-green--152.jpg", bg: "#C3DFC0", stock: 4 },

  // Snakes
  { id: "snake-teal", name: "Snake - Teal", price: 5, blurb: "A long mint noodle friend.", photo: "/products/snakes-teal-071.jpg", bg: "#DCEEDB", stock: 2 },

  // Positive potatoes
  { id: "potato-brown", name: "Positive Potato", price: 8, blurb: "A little spud rooting for you.", photo: "/products/positive-potatoes-brown-118.jpg", bg: "#E8D9BF", stock: 3 },

  // Keychains
  { id: "keychain-strawberry", name: "Strawberry Keychain", price: 5, blurb: "Little strawberry on a keyring.", photo: "/products/strawberry-keychains-pink-062.jpg", bg: "#FBD8E0", stock: 3 },
  { id: "keychain-flower-yellow", name: "Flower Keychain - Yellow", price: 5, blurb: "Yellow bloom on a green stem.", photo: "/products/flower-keychains-yellow-127.jpg", bg: "#FFE9B3", stock: 3 },
  { id: "keychain-flower-white", name: "Flower Keychain - White", price: 5, blurb: "White bloom on a green stem.", photo: "/products/flower-keychains-white-128.jpg", bg: "#FFFDF7", stock: 1 },

  // Scrunchies
  { id: "scrunchie-pink", name: "Scrunchie - Pink", price: 5, blurb: "Soft fuzzy hair scrunchie.", photo: "/products/scrunchies-pink-058.jpg", bg: "#FBD8E0", stock: 2 },

  // Wallets
  { id: "wallet-green", name: "Wallet - Green", price: 8, blurb: "Sturdy little card wallet.", photo: "/products/wallets-green-141.jpg", bg: "#DCEEDB", stock: 1 },
  { id: "wallet-light-green", name: "Wallet - Light Green", price: 8, blurb: "Sturdy little card wallet.", photo: "/products/wallets-light-green-145.jpg", bg: "#DCEEDB", stock: 1 },
  { id: "wallet-orange", name: "Wallet - Orange", price: 8, blurb: "Sturdy little card wallet.", photo: "/products/wallets-orange-143.jpg", bg: "#F5D5B8", stock: 1 },
  { id: "wallet-cream", name: "Wallet - Cream", price: 8, blurb: "Sturdy little card wallet.", photo: "/products/wallets-cream-144.jpg", bg: "#F5EFDD", stock: 1 },
  { id: "wallet-red", name: "Wallet - Red", price: 8, blurb: "Sturdy little card wallet.", photo: "/products/wallets-red-146.jpg", bg: "#F2C6BD", stock: 1 },

  // Bracelets
  { id: "bracelet-yellow", name: "Bracelet - Yellow", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-yellow-133.jpg", bg: "#FFE9B3", stock: 3 },
  { id: "bracelet-yellow-white", name: "Bracelet - Yellow & White", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-yellow-and-white-134.jpg", bg: "#FFE9B3", stock: 3 },
  { id: "bracelet-green-yellow", name: "Bracelet - Green & Yellow", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-green-and-yellow-135.jpg", bg: "#DCEEDB", stock: 3 },
  { id: "bracelet-green", name: "Bracelet - Green", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-green-136.jpg", bg: "#DCEEDB", stock: 3 },
  { id: "bracelet-orange", name: "Bracelet - Orange", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-orange-137.jpg", bg: "#F5D5B8", stock: 3 },
  { id: "bracelet-brown", name: "Bracelet - Brown", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-brown-138.jpg", bg: "#E8D9BF", stock: 3 },
  { id: "bracelet-brown-white", name: "Bracelet - Brown & White", price: 3, blurb: "Hand-braided friendship bracelet.", photo: "/products/braclets-brown-and-white-140.jpg", bg: "#E8D9BF", stock: 3 },
];

// Bump this when the catalog changes so browsers pick up the new list
// instead of showing whatever was seeded on a previous visit.
export const CATALOG_VERSION = "2026-07-29-prices";
