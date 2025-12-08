import { FieldHealthScore as IFieldHealthScore } from '../../types';
import { Card, CardHeader, CardBody } from '../common/Card';

interface FieldHealthScoreProps {
  score: IFieldHealthScore | null;
  loading?: boolean;
}

function getHealthStatus(vitality: number) {
  if (vitality >= 75) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
  if (vitality >= 50) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (vitality >= 25) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
}

function ScoreIndicator({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 75) return 'bg-green-500';
    if (val >= 50) return 'bg-blue-500';
    if (val >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${getColor(value)}`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-sm font-semibold text-gray-900 w-10 text-right">{value}</span>
      </div>
    </div>
  );
}

export function FieldHealthScore({ score, loading }: FieldHealthScoreProps) {
  if (loading || !score) {
    return (
      <Card>
        <CardHeader title="Field Health Score" subtitle="Overall farm vitality index" />
        <CardBody className="h-48 flex items-center justify-center">
          <div className="text-gray-500">{loading ? 'Loading...' : 'No data available'}</div>
        </CardBody>
      </Card>
    );
  }

  const status = getHealthStatus(score.vitality_index);

  return (
    <Card>
      <CardHeader title="Field Health Score" subtitle="Overall farm vitality index" />
      <CardBody className="space-y-6">
        {/* Main Vitality Index */}
        <div className={`${status.bg} rounded-lg p-4`}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vitality Index</p>
              <p className="text-4xl font-bold text-gray-900">{score.vitality_index}</p>
              <p className={`text-sm font-semibold mt-1 ${status.color}`}>{status.label}</p>
            </div>
            <div className="text-right">
              <svg className="w-20 h-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    score.vitality_index >= 75
                      ? '#22c55e'
                      : score.vitality_index >= 50
                        ? '#3b82f6'
                        : score.vitality_index >= 25
                          ? '#eab308'
                          : '#ef4444'
                  }
                  strokeWidth="8"
                  strokeDasharray={`${(score.vitality_index / 100) * 282.7} 282.7`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Component Scores */}
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 text-sm">Component Scores (30% each)</h4>
          <div className="space-y-3">
            <ScoreIndicator label="Moisture" value={score.moisture_score} />
            <ScoreIndicator label="Nutrients" value={score.nutrient_score} />
            <ScoreIndicator label="Temperature" value={score.temperature_score} />
            <ScoreIndicator label="Pest Risk" value={100 - score.pest_risk_score} />
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date(score.timestamp).toLocaleString()}
        </p>
      </CardBody>
    </Card>
  );
}
