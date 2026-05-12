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

// Ensure indexes for querying
// (Dexie automatically indexes the primary key; we can add indexes for category, lastUsed if needed)

export default db;