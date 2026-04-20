import { randomUUID } from "crypto"; // require 대신 import 사용

const words = {}; // 메모리 저장소

export function create(userId, data) {
  const id = randomUUID();
  const item = { id, ...data, createdAt: new Date() };
  if (!words[userId]) words[userId] = [];
  words[userId].push(item);
  return item;
}

export function list(userId, { q, tag } = {}) {
  let result = words[userId] || [];
  if (q) result = result.filter(w => w.term.includes(q) || w.definition.includes(q));
  if (tag) result = result.filter(w => w.tags && w.tags.includes(tag));
  return result;
}

export function get(userId, id) {
  return (words[userId] || []).find(w => w.id === id);
}

export function update(userId, id, data) {
  const list = words[userId] || [];
  const index = list.findIndex(w => w.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...data, updatedAt: new Date() };
  return list[index];
}

export function remove(userId, id) {
  const list = words[userId] || [];
  const index = list.findIndex(w => w.id === id);
  if (index === -1) return false;
  words[userId].splice(index, 1);
  return true;
}