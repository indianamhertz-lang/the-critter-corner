const NS = "crittercorner:";

export const storage = {
  async list(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const raw = localStorage.key(i);
      if (raw?.startsWith(NS + prefix)) keys.push(raw.slice(NS.length));
    }
    return { keys };
  },
  async get(key) {
    const value = localStorage.getItem(NS + key);
    return value === null ? null : { value };
  },
  async set(key, value) {
    localStorage.setItem(NS + key, value);
    return true;
  },
  async delete(key) {
    localStorage.removeItem(NS + key);
    return true;
  },
};
