import { SensorReading } from '../../types';
import { Card, CardHeader, CardBody } from '../common/Card';
import { AlertCircle } from 'lucide-react';

interface NPKGaugeProps {
  reading: SensorReading | null;
  loading?: boolean;
}

const SAFFRON_RANGES = {
  N: { min: 10, max: 15, optimal: 12.5 },
  P: { min: 8, max: 12, optimal: 10 },
  K: { min: 12, max: 18, optimal: 15 },
};

function getNutrientStatus(value: number, nutrient: keyof typeof SAFFRON_RANGES) {
  const range = SAFFRON_RANGES[nutrient];
  if (value < range.min) return { status: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
  if (value > range.max) return { status: 'High', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { status: 'Optimal', color: 'text-green-600', bg: 'bg-green-50' };
}

function NutrientCard({
  label,
  value,
  nutrient,
}: {
  label: string;
  value: number;
  nutrient: keyof typeof SAFFRON_RANGES;
}) {
  const { status, color, bg } = getNutrientStatus(value, nutrient);
  const range = SAFFRON_RANGES[nutrient];

  return (
    <div className={`${bg} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900">{label}</h4>
        <span className={`${color} text-sm font-semibold`}>{status}</span>
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)} ppm</div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Target: {range.min}-{range.max} ppm</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                value < range.min
                  ? 'bg-red-500'
                  : value > range.max
                    ? 'bg-orange-500'
                    : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(100, (value / (range.max * 1.5)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NPKGauge({ reading, loading }: NPKGaugeProps) {
  if (loading || !reading) {
    return (
      <Card>
        <CardHeader title="NPK Nutrients" subtitle="Nitrogen, Phosphorus, Potassium levels" />
        <CardBody className="h-48 flex items-center justify-center">
          <div className="text-gray-500">{loading ? 'Loading...' : 'No data available'}</div>
        </CardBody>
      </Card>
    );
  }

  const hasIssue =
    reading.n_value < SAFFRON_RANGES.N.min ||
    reading.n_value > SAFFRON_RANGES.N.max ||
    reading.p_value < SAFFRON_RANGES.P.min ||
    reading.p_value > SAFFRON_RANGES.P.max ||
    reading.k_value < SAFFRON_RANGES.K.min ||
    reading.k_value > SAFFRON_RANGES.K.max;

  return (
    <Card>
      <CardHeader
        title="NPK Nutrients"
        subtitle="Nitrogen, Phosphorus, Potassium levels"
        action={
          hasIssue && (
            <div className="flex items-center gap-1 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              <AlertCircle size={16} />
              <span>Action needed</span>
            </div>
          )
        }
      />
      <CardBody className="grid grid-cols-1 gap-3">
        <NutrientCard label="Nitrogen (N)" value={reading.n_value} nutrient="N" />
        <NutrientCard label="Phosphorus (P)" value={reading.p_value} nutrient="P" />
        <NutrientCard label="Potassium (K)" value={reading.k_value} nutrient="K" />
      </CardBody>
    </Card>
  );
}
