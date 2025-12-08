import { useQuery, useQueryClient } from '@tanstack/react-query';
import { farmApi, sensorApi, alertApi, healthScoreApi } from '../lib/api';

const QUERY_KEYS = {
  farms: 'farms',
  farm: (id: string) => ['farm', id],
  latestReading: (farmId: string) => ['latestReading', farmId],
  readings: (farmId: string) => ['readings', farmId],
  alerts: (farmId: string) => ['alerts', farmId],
  healthScore: (farmId: string) => ['healthScore', farmId],
};

export function useFarms() {
  return useQuery({
    queryKey: [QUERY_KEYS.farms],
    queryFn: () => farmApi.getFarms(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFarm(farmId: string | null) {
  return useQuery({
    queryKey: farmId ? QUERY_KEYS.farm(farmId) : [],
    queryFn: () => farmApi.getFarmById(farmId!),
    enabled: !!farmId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useLatestSensorReading(farmId: string | null) {
  return useQuery({
    queryKey: farmId ? QUERY_KEYS.latestReading(farmId) : [],
    queryFn: () => sensorApi.getLatestReading(farmId!),
    enabled: !!farmId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useSensorReadings(farmId: string | null, limit: number = 100) {
  return useQuery({
    queryKey: farmId ? QUERY_KEYS.readings(farmId) : [],
    queryFn: () => sensorApi.getReadings(farmId!, limit),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlerts(farmId: string | null) {
  return useQuery({
    queryKey: farmId ? QUERY_KEYS.alerts(farmId) : [],
    queryFn: () => alertApi.getAlerts(farmId!),
    enabled: !!farmId,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useHealthScore(farmId: string | null) {
  return useQuery({
    queryKey: farmId ? QUERY_KEYS.healthScore(farmId) : [],
    queryFn: () => healthScoreApi.getLatestHealthScore(farmId!),
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useRefreshData(farmId: string | null) {
  const queryClient = useQueryClient();

  return {
    refetchAll: () => {
      if (farmId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.latestReading(farmId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.readings(farmId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.alerts(farmId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.healthScore(farmId),
        });
      }
    },
  };
}
