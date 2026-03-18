import { randomUUID } from "crypto";

const bookmarks = {};

export function create(userId, data) {
  const id = randomUUID();
  const item = { id, ...data, createdAt: new Date() };
  if (!bookmarks[userId]) bookmarks[userId] = [];
  bookmarks[userId].push(item);
  return item;
}

export function list(userId, { q, tag } = {}) {
  let result = bookmarks[userId] || [];
  if (q) result = result.filter(b => b.title?.includes(q) || b.url.includes(q));
  if (tag) result = result.filter(b => b.tags && b.tags.includes(tag));
  return result;
}

export function remove(userId, id) {
  const list = bookmarks[userId] || [];
  const index = list.findIndex(b => b.id === id);
  if (index === -1) return false;
  bookmarks[userId].splice(index, 1);
  return true;
}