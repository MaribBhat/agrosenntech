import { PhenologyEvent } from '../../types';
import { Card, CardHeader, CardBody } from '../common/Card';

interface PhenologyStageProps {
  currentEvent: PhenologyEvent | null;
  loading?: boolean;
}

function getStageInfo(stage: string) {
  const stages: Record<
    string,
    { label: string; emoji: string; color: string; description: string; monthRange: string }
  > = {
    dormant: {
      label: 'Dormant',
      emoji: '🌡️',
      color: 'bg-slate-50 border-slate-200',
      description: 'Plant is in hibernation state. Avoid disturbance.',
      monthRange: 'May - September',
    },
    flowering: {
      label: 'Flowering',
      emoji: '🌸',
      color: 'bg-pink-50 border-pink-200',
      description: 'Critical blooming period. Protect blossoms from stress.',
      monthRange: 'October - November',
    },
    vegetative: {
      label: 'Vegetative',
      emoji: '🌿',
      color: 'bg-green-50 border-green-200',
      description: 'Active leaf growth and development phase.',
      monthRange: 'December - April',
    },
  };

  return (
    stages[stage] || {
      label: 'Unknown',
      emoji: '❓',
      color: 'bg-gray-50 border-gray-200',
      description: 'Stage unknown',
      monthRange: 'N/A',
    }
  );
}

export function PhenologyStage({ currentEvent, loading }: PhenologyStageProps) {
  if (loading || !currentEvent) {
    return (
      <Card>
        <CardHeader title="Growth Stage" subtitle="Current phenology stage of saffron crop" />
        <CardBody className="h-48 flex items-center justify-center">
          <div className="text-gray-500">{loading ? 'Loading...' : 'No growth stage detected'}</div>
        </CardBody>
      </Card>
    );
  }

  const stageInfo = getStageInfo(currentEvent.stage);

  return (
    <Card>
      <CardHeader title="Growth Stage" subtitle="Current phenology stage of saffron crop" />
      <CardBody className="space-y-4">
        <div className={`border-2 rounded-lg p-4 ${stageInfo.color}`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">{stageInfo.emoji}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{stageInfo.label}</h3>
              <p className="text-sm text-gray-600">{stageInfo.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Typical months:</span>
                <span className="text-xs font-semibold text-gray-700">{stageInfo.monthRange}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Detection Confidence</span>
            <span className="text-sm font-bold text-gray-900">
              {(currentEvent.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${currentEvent.confidence_score * 100}%` }}
            />
          </div>
        </div>

        {/* Trigger Reason */}
        {currentEvent.trigger_reason && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">Why detected:</p>
            <p className="text-sm text-blue-800">{currentEvent.trigger_reason}</p>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-gray-500 text-center">
          Detected: {new Date(currentEvent.detected_at).toLocaleString()}
        </p>
      </CardBody>
    </Card>
  );
}
