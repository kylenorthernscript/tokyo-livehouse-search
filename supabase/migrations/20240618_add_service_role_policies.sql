-- Add service role policies for data insertion scripts

-- Allow service role to insert venues
CREATE POLICY "Service role can insert venues" 
  ON venues FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Allow service role to insert events
CREATE POLICY "Service role can insert events" 
  ON events FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Allow service role to insert artists
CREATE POLICY "Service role can insert artists" 
  ON artists FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Allow service role to insert event_artists
CREATE POLICY "Service role can insert event_artists" 
  ON event_artists FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Allow service role to update data
CREATE POLICY "Service role can update venues" 
  ON venues FOR UPDATE 
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update events" 
  ON events FOR UPDATE 
  TO service_role
  WITH CHECK (true);