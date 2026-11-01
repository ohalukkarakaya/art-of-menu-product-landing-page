-- ArtOfMenu launch list
CREATE TABLE IF NOT EXISTS signups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  maps_url   TEXT NOT NULL,
  plan       TEXT NOT NULL,          -- menu | order | smart | undecided
  lang       TEXT NOT NULL,          -- tr | en | de
  ip_hash    TEXT NOT NULL,          -- salted SHA-256 of the IP, only for rate limiting
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS signups_ip_recent ON signups (ip_hash, updated_at);
