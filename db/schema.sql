-- Golden Shotokan Karate Society database (Cloudflare D1 / SQLite).
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT NOT NULL,
  referral TEXT,
  notes TEXT,
  email_status TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_ip ON inquiries (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort INTEGER NOT NULL DEFAULT 0,
  day TEXT NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Club event',
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  description TEXT,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (date);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Seed the current class times only if the schedule is empty.
INSERT INTO schedule (sort, day, start, end, name)
SELECT 1, 'Monday', '18:00', '19:30', 'Karate class (ages 13+)'
WHERE NOT EXISTS (SELECT 1 FROM schedule);
INSERT INTO schedule (sort, day, start, end, name)
SELECT 2, 'Wednesday', '18:00', '19:30', 'Karate class (ages 13+)'
WHERE (SELECT COUNT(*) FROM schedule) = 1;
INSERT INTO schedule (sort, day, start, end, name)
SELECT 3, 'Friday', '18:00', '19:30', 'Open training (no instruction)'
WHERE (SELECT COUNT(*) FROM schedule) = 2;

-- Training clips (YouTube, Vimeo or video file links) shown on /training.
CREATE TABLE IF NOT EXISTS clips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  competition TEXT,
  recorded_on TEXT,
  published INTEGER NOT NULL DEFAULT 1
);

-- Club members' tournament results shown on /results.
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  competition TEXT NOT NULL,
  competition_date TEXT NOT NULL,
  athlete TEXT NOT NULL,
  event_type TEXT NOT NULL,
  division TEXT,
  place TEXT NOT NULL,
  note TEXT,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_results_comp ON results (competition_date, competition);
