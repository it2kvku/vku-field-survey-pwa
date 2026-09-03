CREATE TABLE IF NOT EXISTS surveys (
  id TEXT PRIMARY KEY,
  facility_name TEXT NOT NULL,
  building TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  condition TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  photo_data_url TEXT,
  gps_lat REAL,
  gps_lng REAL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_created ON surveys(created_at);

CREATE TABLE IF NOT EXISTS preferences (
  device_id TEXT PRIMARY KEY,
  locale TEXT NOT NULL DEFAULT 'en',
  updated_at TEXT NOT NULL
);
