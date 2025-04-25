import sqlite3 from "sqlite3";
import { open } from "sqlite";

export type ShortLink = {
  name: string;
  url: string;
  owner: string; // Nostr pubkey
};

// Initialize SQLite database
let db: any;

export async function initDb() {
  db = await open({
    filename: "./shortlinks.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS short_links (
      name TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      owner TEXT NOT NULL
    )
  `);
}

export async function createShortLink(link: ShortLink) {
  try {
    await db.run(
      `INSERT INTO short_links (name, url, owner) VALUES (?, ?, ?)`,
      [link.name, link.url, link.owner]
    );
    return link;
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT") {
      throw new Error("Short link name already exists");
    }
    throw error;
  }
}

export async function getShortLink(name: string) {
  return await db.get(`SELECT * FROM short_links WHERE name = ?`, [name]);
}
