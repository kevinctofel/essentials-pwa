import Dexie from 'dexie';

export const db = new Dexie('EssentialsDB');

db.version(1).stores({
  items: `
    ++id,
    name,
    category,
    location,
    addedDate,
    lastUsed,
    photoThumb
  `
});

db.version(2).stores({
  items: `
    ++id,
    name,
    category,
    location,
    addedDate,
    lastUsed,
    photoThumb
  `,
  settings: 'key'
});

export const DEFAULT_STALE_THRESHOLD_DAYS = 180;

export async function getSetting(key, defaultValue) {
  const row = await db.settings.get(key);
  return row ? row.value : defaultValue;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

export default db;