/*
  # Create Saffron-specific agronomy tables

  1. New Tables
    - `crop_cycles`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key)
      - `start_date` (date) - When cultivation started
      - `end_date` (date) - When harvest completed
      - `expected_yield` (numeric) - Projected yield in kg/ha
      - `actual_yield` (numeric) - Actual harvest yield in kg/ha
      - `current_phenology_stage` (text) - dormant/flowering/vegetative
      - `created_at` (timestamp)
      
    - `phenology_events`
      - `id` (uuid, primary key)
      - `crop_cycle_id` (uuid, foreign key)
      - `farm_id` (uuid, foreign key) - Denormalized for easier queries
      - `stage` (text) - Stage name (dormant/flowering/vegetative)
      - `detected_at` (timestamptz) - When stage was detected
      - `confidence_score` (numeric) - 0-1 confidence that this is correct stage
      - `trigger_reason` (text) - Why the stage was triggered (for audit)
      
    - `npk_recommendations`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key)
      - `timestamp` (timestamptz) - When recommendation was generated
      - `nutrient_type` (text) - N/P/K
      - `current_level` (numeric) - Current level in ppm
      - `target_level` (numeric) - Target level in ppm
      - `recommended_action` (text) - e.g., "Apply Urea"
      - `dosage` (text) - e.g., "5kg/ha"
      - `reasoning` (text) - Explanation for recommendation
      - `applied` (boolean) - Whether farmer applied recommendation
      
  2. Security
    - Enable RLS on all tables
    - Add policies for farm ownership verification
    
  3. Indexes
    - Index on farm_id and crop_cycle_id for efficient queries
*/

CREATE TABLE IF NOT EXISTS crop_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  expected_yield numeric,
  actual_yield numeric,
  current_phenology_stage text DEFAULT 'dormant',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS phenology_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_cycle_id uuid NOT NULL REFERENCES crop_cycles(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  stage text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  confidence_score numeric DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  trigger_reason text
);

CREATE TABLE IF NOT EXISTS npk_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  nutrient_type text NOT NULL,
  current_level numeric NOT NULL,
  target_level numeric NOT NULL,
  recommended_action text NOT NULL,
  dosage text,
  reasoning text,
  applied boolean DEFAULT false
);

CREATE INDEX idx_crop_cycles_farm_id ON crop_cycles(farm_id);
CREATE INDEX idx_crop_cycles_current_stage ON crop_cycles(farm_id, current_phenology_stage);
CREATE INDEX idx_phenology_events_farm_id ON phenology_events(farm_id);
CREATE INDEX idx_phenology_events_detected_at ON phenology_events(detected_at DESC);
CREATE INDEX idx_npk_recommendations_farm_id ON npk_recommendations(farm_id);
CREATE INDEX idx_npk_recommendations_timestamp ON npk_recommendations(timestamp DESC);

ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE phenology_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE npk_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crop cycles"
  ON crop_cycles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = crop_cycles.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert crop cycles to own farms"
  ON crop_cycles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own crop cycles"
  ON crop_cycles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = crop_cycles.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view phenology events for own farms"
  ON phenology_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = phenology_events.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert phenology events to own farms"
  ON phenology_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view NPK recommendations for own farms"
  ON npk_recommendations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = npk_recommendations.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert NPK recommendations to own farms"
  ON npk_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own NPK recommendations"
  ON npk_recommendations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = npk_recommendations.farm_id
      AND farms.owner_id = auth.uid()
    )
  );
