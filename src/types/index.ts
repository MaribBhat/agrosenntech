export interface Farm {
  id: string;
  name: string;
  location: string;
  owner_id: string;
  kashmir_zone: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  farm_id: string;
  timestamp: string;
  n_value: number;
  p_value: number;
  k_value: number;
  soil_moisture_1: number;
  soil_moisture_2: number;
  air_temp: number;
  soil_temp: number;
  humidity: number;
  light_lux: number;
  ph_level: number;
  data_quality_score: number;
}

export interface CropCycle {
  id: string;
  farm_id: string;
  start_date: string;
  end_date?: string;
  expected_yield?: number;
  actual_yield?: number;
  current_phenology_stage: string;
  created_at: string;
}

export interface PhenologyEvent {
  id: string;
  crop_cycle_id: string;
  farm_id: string;
  stage: string;
  detected_at: string;
  confidence_score: number;
  trigger_reason?: string;
}

export interface NPKRecommendation {
  id: string;
  farm_id: string;
  timestamp: string;
  nutrient_type: 'N' | 'P' | 'K';
  current_level: number;
  target_level: number;
  recommended_action: string;
  dosage?: string;
  reasoning?: string;
  applied: boolean;
}

export interface Alert {
  id: string;
  farm_id: string;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  triggered_at: string;
  acknowledged_at?: string;
  snoozed_until?: string;
  action_taken?: string;
}

export interface FieldHealthScore {
  id: string;
  farm_id: string;
  timestamp: string;
  vitality_index: number;
  moisture_score: number;
  nutrient_score: number;
  temperature_score: number;
  pest_risk_score: number;
}

export interface IrrigationEvent {
  id: string;
  farm_id: string;
  scheduled_at: string;
  executed_at?: string;
  duration_minutes?: number;
  moisture_before?: number;
  moisture_after?: number;
  created_at: string;
}

export type PhenologyStage = 'dormant' | 'flowering' | 'vegetative';
