import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Droplets, Thermometer, Leaf } from 'lucide-react';
import { useFarms, useLatestSensorReading, useAlerts, useHealthScore } from '../hooks/useFarmData';
import { NPKGauge } from '../components/sensors/NPKGauge';
import { FieldHealthScore } from '../components/sensors/FieldHealthScore';
import { PhenologyStage } from '../components/sensors/PhenologyStage';
import { AlertPanel } from '../components/alerts/AlertPanel';
import { Card, CardHeader, CardBody } from '../components/common/Card';

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <Card className={`border ${statusColors[status]}`}>
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="text-2xl font-bold mt-1">
            {value} <span className="text-lg font-normal text-gray-600">{unit}</span>
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg opacity-50">{Icon}</div>
      </CardBody>
    </Card>
  );
}

export function Dashboard() {
  const { farmId } = useParams<{ farmId?: string }>();
  const { data: farms } = useFarms();
  const currentFarmId = farmId || farms?.[0]?.id || null;

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(currentFarmId || null);
  const { data: latestReading, isLoading: readingLoading } =
    useLatestSensorReading(selectedFarmId);
  const { data: alerts, isLoading: alertsLoading } = useAlerts(selectedFarmId);
  const { data: healthScore, isLoading: healthLoading } = useHealthScore(selectedFarmId);

  const getStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) return 'critical';
    if (Math.abs(value - min) < 5 || Math.abs(value - max) < 5) return 'warning';
    return 'good';
  };

  return (
    <main className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 sm:p-6">
        {/* Farm Selector */}
        {farms && farms.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Farm
            </label>
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Stats */}
        {latestReading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<Droplets className="text-blue-600" size={24} />}
              label="Avg Moisture"
              value={(
                (latestReading.soil_moisture_1 + latestReading.soil_moisture_2) /
                2
              ).toFixed(1)}
              unit="%"
              status={getStatus(
                (latestReading.soil_moisture_1 + latestReading.soil_moisture_2) / 2,
                35,
                75
              )}
            />
            <StatCard
              icon={<Thermometer className="text-orange-600" size={24} />}
              label="Soil Temp"
              value={latestReading.soil_temp.toFixed(1)}
              unit="°C"
              status={getStatus(latestReading.soil_temp, 10, 25)}
            />
            <StatCard
              icon={<Leaf className="text-green-600" size={24} />}
              label="pH Level"
              value={latestReading.ph_level.toFixed(1)}
              unit=""
              status={getStatus(latestReading.ph_level, 6, 7.5)}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <NPKGauge reading={latestReading || null} loading={readingLoading} />
            <FieldHealthScore score={healthScore || null} loading={healthLoading} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <PhenologyStage
              currentEvent={
                latestReading
                  ? {
                      id: '1',
                      crop_cycle_id: '1',
                      farm_id: selectedFarmId || '',
                      stage: latestReading.soil_temp < 15 ? 'flowering' : 'vegetative',
                      detected_at: new Date().toISOString(),
                      confidence_score: 0.85,
                      trigger_reason: 'Temperature-based phenology detection',
                    }
                  : null
              }
              loading={readingLoading}
            />
            <Card>
              <CardHeader title="Last Reading" subtitle="Most recent sensor data" />
              <CardBody className="text-sm space-y-2">
                {latestReading ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {new Date(latestReading.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Air Temp:</span>
                      <span className="font-medium">{latestReading.air_temp.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humidity:</span>
                      <span className="font-medium">{latestReading.humidity.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Light:</span>
                      <span className="font-medium">{latestReading.light_lux.toFixed(0)} lux</span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Alerts and Moisture Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AlertPanel alerts={alerts || []} loading={alertsLoading} />
        </div>
      </div>
    </main>
  );
}
