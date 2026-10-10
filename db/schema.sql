-- Golden Shotokan registrations database (Cloudflare D1 / SQLite).
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  student_first TEXT NOT NULL,
  student_last TEXT NOT NULL,
  dob TEXT NOT NULL,
  program TEXT,
  experience TEXT,
  family_members TEXT,
  guardian_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  start_date TEXT,
  preferred_class TEXT,
  referral TEXT,
  medical TEXT,
  emergency_name TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  waiver INTEGER NOT NULL DEFAULT 0,
  photo_consent INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  email_status TEXT,
  ip_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_ip ON registrations (ip_hash, created_at);

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
SELECT 1, 'Monday', '18:00', '19:00', 'Karate class, all ages'
WHERE NOT EXISTS (SELECT 1 FROM schedule);
INSERT INTO schedule (sort, day, start, end, name)
SELECT 2, 'Wednesday', '18:00', '19:00', 'Karate class, all ages'
WHERE (SELECT COUNT(*) FROM schedule) = 1;
