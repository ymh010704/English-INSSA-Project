const { randomUUID } = require("crypto");

const store = new Map(); // id -> bookmark

function create(userId, payload) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const bm = {
    id,
    userId,
    url: payload.url,
    title: payload.title || "",
    description: payload.description || "",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    createdAt: now,
  };
  store.set(id, bm);
  return bm;
}

function list(userId, { q, tag }) {
  let items = [...store.values()].filter((b) => b.userId === userId);

  if (q) {
    const qq = String(q).toLowerCase();
    items = items.filter(
      (b) =>
        b.url.toLowerCase().includes(qq) ||
        b.title.toLowerCase().includes(qq) ||
        b.description.toLowerCase().includes(qq)
    );
  }
  if (tag) {
    items = items.filter((b) => b.tags.includes(tag));
  }

  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items;
}

function remove(userId, id) {
  const item = store.get(id);
  if (!item || item.userId !== userId) return false;
  store.delete(id);
  return true;
}

module.exports = { create, list, remove };