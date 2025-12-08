/*
  # Create core SaffronTech tables: Farms and Sensor Readings

  1. New Tables
    - `farms`
      - `id` (uuid, primary key) - Unique farm identifier
      - `name` (text) - Farm name
      - `location` (text) - Geographic location
      - `owner_id` (uuid, foreign key) - Links to auth.users
      - `kashmir_zone` (text) - Regional climate zone for predictive purposes
      - `created_at` (timestamp) - Record creation timestamp
      
    - `sensor_readings`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key) - Links to farms table
      - `timestamp` (timestamptz) - When sensor data was recorded
      - `n_value` (numeric) - Nitrogen level in ppm
      - `p_value` (numeric) - Phosphorus level in ppm
      - `k_value` (numeric) - Potassium level in ppm
      - `soil_moisture_1` (numeric) - First soil moisture sensor (%)
      - `soil_moisture_2` (numeric) - Second soil moisture sensor (%)
      - `air_temp` (numeric) - Air temperature in Celsius
      - `soil_temp` (numeric) - Soil temperature in Celsius
      - `humidity` (numeric) - Relative humidity (%)
      - `light_lux` (numeric) - Light intensity in lux
      - `ph_level` (numeric) - Soil pH
      - `data_quality_score` (numeric) - 0-100 score for data reliability
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write their own farms
    - Restrict access to own farm data only
    
  3. Indexes
    - Index on farm_id for efficient querying
    - Index on timestamp for time-series queries
    - Composite index on (farm_id, timestamp) for efficient range queries
*/

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kashmir_zone text DEFAULT 'kashmiri_plains',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  n_value numeric DEFAULT 0,
  p_value numeric DEFAULT 0,
  k_value numeric DEFAULT 0,
  soil_moisture_1 numeric DEFAULT 0,
  soil_moisture_2 numeric DEFAULT 0,
  air_temp numeric DEFAULT 0,
  soil_temp numeric DEFAULT 0,
  humidity numeric DEFAULT 0,
  light_lux numeric DEFAULT 0,
  ph_level numeric DEFAULT 0,
  data_quality_score numeric DEFAULT 100 CHECK (data_quality_score >= 0 AND data_quality_score <= 100)
);

CREATE INDEX idx_sensor_readings_farm_id ON sensor_readings(farm_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX idx_sensor_readings_farm_timestamp ON sensor_readings(farm_id, timestamp DESC);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farms"
  ON farms FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create farms"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own farms"
  ON farms FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own farms"
  ON farms FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can read sensor data from own farms"
  ON sensor_readings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = sensor_readings.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sensor data to own farms"
  ON sensor_readings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );
