/*
  # Create Alert and Monitoring tables for SaffronTech

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key)
      - `alert_type` (text) - MOISTURE_LOW, MOISTURE_HIGH, NUTRIENT_DEFICIENCY, TEMPERATURE_STRESS, PHENOLOGY_CHANGE, PEST_RISK
      - `severity` (text) - INFO, WARNING, CRITICAL
      - `message` (text) - Human-readable alert message
      - `triggered_at` (timestamptz) - When alert was generated
      - `acknowledged_at` (timestamptz) - When user acknowledged
      - `snoozed_until` (timestamptz) - When snooze expires
      - `action_taken` (text) - What farmer did in response
      
    - `field_health_scores`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key)
      - `timestamp` (timestamptz) - When score was calculated
      - `vitality_index` (numeric) - 0-100 composite health score
      - `moisture_score` (numeric) - 0-100 moisture health
      - `nutrient_score` (numeric) - 0-100 nutrient balance health
      - `temperature_score` (numeric) - 0-100 temperature stress
      - `pest_risk_score` (numeric) - 0-100 pest risk indicator
      
    - `irrigation_events`
      - `id` (uuid, primary key)
      - `farm_id` (uuid, foreign key)
      - `scheduled_at` (timestamptz)
      - `executed_at` (timestamptz)
      - `duration_minutes` (integer)
      - `moisture_before` (numeric)
      - `moisture_after` (numeric)
      
  2. Security
    - Enable RLS with farm ownership verification
    
  3. Indexes
    - Indexes on farm_id and timestamp for time-series queries
    - Index on alert_type for filtering
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'WARNING',
  message text NOT NULL,
  triggered_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  snoozed_until timestamptz,
  action_taken text,
  CONSTRAINT valid_severity CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

CREATE TABLE IF NOT EXISTS field_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT now(),
  vitality_index numeric DEFAULT 50 CHECK (vitality_index >= 0 AND vitality_index <= 100),
  moisture_score numeric DEFAULT 50 CHECK (moisture_score >= 0 AND moisture_score <= 100),
  nutrient_score numeric DEFAULT 50 CHECK (nutrient_score >= 0 AND nutrient_score <= 100),
  temperature_score numeric DEFAULT 50 CHECK (temperature_score >= 0 AND temperature_score <= 100),
  pest_risk_score numeric DEFAULT 50 CHECK (pest_risk_score >= 0 AND pest_risk_score <= 100)
);

CREATE TABLE IF NOT EXISTS irrigation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  executed_at timestamptz,
  duration_minutes integer,
  moisture_before numeric,
  moisture_after numeric,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_alerts_farm_id ON alerts(farm_id);
CREATE INDEX idx_alerts_severity ON alerts(farm_id, severity);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_acknowledged ON alerts(farm_id, acknowledged_at);

CREATE INDEX idx_field_health_scores_farm_id ON field_health_scores(farm_id);
CREATE INDEX idx_field_health_scores_timestamp ON field_health_scores(farm_id, timestamp DESC);

CREATE INDEX idx_irrigation_events_farm_id ON irrigation_events(farm_id);
CREATE INDEX idx_irrigation_events_scheduled_at ON irrigation_events(scheduled_at DESC);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE irrigation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = alerts.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert alerts to own farms"
  ON alerts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = alerts.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own field health scores"
  ON field_health_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = field_health_scores.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert field health scores to own farms"
  ON field_health_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own irrigation events"
  ON irrigation_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = irrigation_events.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert irrigation events to own farms"
  ON irrigation_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms
      WHERE farms.id = farm_id
      AND farms.owner_id = auth.uid()
    )
  );
