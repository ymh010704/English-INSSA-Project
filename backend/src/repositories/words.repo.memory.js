const { randomUUID } = require("crypto");

const store = new Map(); // id -> word

function create(userId, payload) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const word = {
    id,
    userId,
    term: payload.term,
    meaning: payload.meaning || "",
    example: payload.example || "",
    memo: payload.memo || "",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    createdAt: now,
    updatedAt: now,
  };
  store.set(id, word);
  return word;
}

function list(userId, { q, tag }) {
  let items = [...store.values()].filter((w) => w.userId === userId);

  if (q) {
    const qq = String(q).toLowerCase();
    items = items.filter(
      (w) =>
        w.term.toLowerCase().includes(qq) ||
        w.meaning.toLowerCase().includes(qq) ||
        w.memo.toLowerCase().includes(qq)
    );
  }
  if (tag) {
    items = items.filter((w) => w.tags.includes(tag));
  }

  // 최신순
  items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return items;
}

function get(userId, id) {
  const item = store.get(id);
  if (!item || item.userId !== userId) return null;
  return item;
}

function update(userId, id, patch) {
  const item = get(userId, id);
  if (!item) return null;

  const next = {
    ...item,
    term: patch.term ?? item.term,
    meaning: patch.meaning ?? item.meaning,
    example: patch.example ?? item.example,
    memo: patch.memo ?? item.memo,
    tags: patch.tags ? (Array.isArray(patch.tags) ? patch.tags : item.tags) : item.tags,
    updatedAt: new Date().toISOString(),
  };
  store.set(id, next);
  return next;
}

function remove(userId, id) {
  const item = get(userId, id);
  if (!item) return false;
  store.delete(id);
  return true;
}

module.exports = { create, list, get, update, remove };