import { supabase } from './supabase';
import {
  Farm,
  SensorReading,
  Alert,
  FieldHealthScore,
  CropCycle,
  PhenologyEvent,
  NPKRecommendation,
} from '../types';

export const farmApi = {
  async getFarms(): Promise<Farm[]> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getFarmById(farmId: string): Promise<Farm | null> {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('id', farmId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createFarm(name: string, location: string, kashmirZone: string): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .insert({ name, location, kashmir_zone: kashmirZone })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFarm(farmId: string, updates: Partial<Farm>): Promise<Farm> {
    const { data, error } = await supabase
      .from('farms')
      .update(updates)
      .eq('id', farmId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const sensorApi = {
  async getLatestReading(farmId: string): Promise<SensorReading | null> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getReadings(
    farmId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<SensorReading[]> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getReadingsInRange(
    farmId: string,
    startTime: string,
    endTime: string
  ): Promise<SensorReading[]> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async insertReading(reading: Omit<SensorReading, 'id'>): Promise<SensorReading> {
    const { data, error } = await supabase
      .from('sensor_readings')
      .insert(reading)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const alertApi = {
  async getAlerts(farmId: string, limit: number = 50): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('farm_id', farmId)
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getUnacknowledgedAlerts(farmId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('farm_id', farmId)
      .is('acknowledged_at', null)
      .order('triggered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .update({ acknowledged_at: new Date().toISOString() })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async snoozeAlert(alertId: string, minutes: number): Promise<Alert> {
    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

    const { data, error } = await supabase
      .from('alerts')
      .update({ snoozed_until: snoozeUntil.toISOString() })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createAlert(
    farmId: string,
    alertType: string,
    severity: 'INFO' | 'WARNING' | 'CRITICAL',
    message: string
  ): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        farm_id: farmId,
        alert_type: alertType,
        severity,
        message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const healthScoreApi = {
  async getLatestHealthScore(farmId: string): Promise<FieldHealthScore | null> {
    const { data, error } = await supabase
      .from('field_health_scores')
      .select('*')
      .eq('farm_id', farmId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getHealthScoresInRange(
    farmId: string,
    startTime: string,
    endTime: string
  ): Promise<FieldHealthScore[]> {
    const { data, error } = await supabase
      .from('field_health_scores')
      .select('*')
      .eq('farm_id', farmId)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async insertHealthScore(score: Omit<FieldHealthScore, 'id'>): Promise<FieldHealthScore> {
    const { data, error } = await supabase
      .from('field_health_scores')
      .insert(score)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const phenologyApi = {
  async getCurrentCropCycle(farmId: string): Promise<CropCycle | null> {
    const { data, error } = await supabase
      .from('crop_cycles')
      .select('*')
      .eq('farm_id', farmId)
      .is('end_date', null)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPhenologyEvents(farmId: string, limit: number = 50): Promise<PhenologyEvent[]> {
    const { data, error } = await supabase
      .from('phenology_events')
      .select('*')
      .eq('farm_id', farmId)
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createPhenologyEvent(
    cropCycleId: string,
    farmId: string,
    stage: string,
    confidenceScore: number,
    triggerReason: string
  ): Promise<PhenologyEvent> {
    const { data, error } = await supabase
      .from('phenology_events')
      .insert({
        crop_cycle_id: cropCycleId,
        farm_id: farmId,
        stage,
        confidence_score: confidenceScore,
        trigger_reason: triggerReason,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const npkApi = {
  async getNPKRecommendations(farmId: string, limit: number = 20): Promise<NPKRecommendation[]> {
    const { data, error } = await supabase
      .from('npk_recommendations')
      .select('*')
      .eq('farm_id', farmId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createRecommendation(
    farmId: string,
    nutrientType: 'N' | 'P' | 'K',
    currentLevel: number,
    targetLevel: number,
    recommendedAction: string,
    dosage?: string,
    reasoning?: string
  ): Promise<NPKRecommendation> {
    const { data, error } = await supabase
      .from('npk_recommendations')
      .insert({
        farm_id: farmId,
        nutrient_type: nutrientType,
        current_level: currentLevel,
        target_level: targetLevel,
        recommended_action: recommendedAction,
        dosage,
        reasoning,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsApplied(recommendationId: string): Promise<NPKRecommendation> {
    const { data, error } = await supabase
      .from('npk_recommendations')
      .update({ applied: true })
      .eq('id', recommendationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
