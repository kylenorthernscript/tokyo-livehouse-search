-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create venues table
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT,
  area TEXT NOT NULL,
  address TEXT,
  capacity INTEGER,
  official_url TEXT,
  google_place_id TEXT,
  location GEOGRAPHY(POINT, 4326),
  metadata JSONB DEFAULT '{}',
  scraping_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  artists JSONB DEFAULT '[]',
  ticket_info JSONB DEFAULT '{}',
  description TEXT,
  source_url TEXT,
  raw_data JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'postponed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, date, title)
);

-- Create artists table
CREATE TABLE artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  genre TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create event_artists junction table
CREATE TABLE event_artists (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

-- Create indexes for performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_venue ON events(venue_id);
CREATE INDEX idx_venues_area ON venues(area);
-- 全文検索インデックスは後で追加

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public venues are viewable by everyone" 
  ON venues FOR SELECT 
  USING (true);

CREATE POLICY "Public events are viewable by everyone" 
  ON events FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Public artists are viewable by everyone" 
  ON artists FOR SELECT 
  USING (true);

CREATE POLICY "Public event_artists are viewable by everyone" 
  ON event_artists FOR SELECT 
  USING (true);

-- Create policies for authenticated users to insert data
CREATE POLICY "Authenticated users can insert venues" 
  ON venues FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert events" 
  ON events FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();