import { Alert } from '../../types';
import { Card, CardHeader, CardBody } from '../common/Card';
import { alertApi } from '../../lib/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AlertPanelProps {
  alerts: Alert[];
  loading?: boolean;
  onAcknowledge?: () => void;
}

function getSeverityInfo(severity: string) {
  const levels: Record<
    string,
    { color: string; bgColor: string; icon: React.ReactNode; label: string }
  > = {
    CRITICAL: {
      color: 'text-red-700',
      bgColor: 'bg-red-50 border border-red-200',
      icon: <AlertCircle className="text-red-600" size={20} />,
      label: 'Critical',
    },
    WARNING: {
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border border-yellow-200',
      icon: <AlertCircle className="text-yellow-600" size={20} />,
      label: 'Warning',
    },
    INFO: {
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border border-blue-200',
      icon: <AlertCircle className="text-blue-600" size={20} />,
      label: 'Info',
    },
  };

  return (
    levels[severity] || {
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 border border-gray-200',
      icon: <AlertCircle className="text-gray-600" size={20} />,
      label: 'Unknown',
    }
  );
}

function AlertItem({
  alert,
  onAcknowledge,
  onSnooze,
}: {
  alert: Alert;
  onAcknowledge: () => void;
  onSnooze: (minutes: number) => void;
}) {
  const severity = getSeverityInfo(alert.severity);
  const isAcknowledged = !!alert.acknowledged_at;
  const isSnoozed = alert.snoozed_until ? new Date(alert.snoozed_until) > new Date() : false;

  return (
    <div className={`rounded-lg p-4 ${severity.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{severity.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${severity.color}`}>{severity.label}</span>
            {isAcknowledged && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                <CheckCircle size={12} />
                Acknowledged
              </span>
            )}
            {isSnoozed && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                <Clock size={12} />
                Snoozed
              </span>
            )}
          </div>

          <p className="text-sm text-gray-900 font-medium mb-2">{alert.message}</p>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-600">
              {new Date(alert.triggered_at).toLocaleString()}
            </span>
            {alert.action_taken && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                {alert.action_taken}
              </span>
            )}
          </div>

          {!isAcknowledged && (
            <div className="flex gap-2">
              <button
                onClick={onAcknowledge}
                className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                Acknowledge
              </button>
              <button
                onClick={() => onSnooze(60)}
                className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Snooze 1h
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AlertPanel({ alerts, loading, onAcknowledge }: AlertPanelProps) {
  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertApi.acknowledgeAlert(alertId);
      onAcknowledge?.();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleSnooze = async (alertId: string, minutes: number) => {
    try {
      await alertApi.snoozeAlert(alertId, minutes);
      onAcknowledge?.();
    } catch (error) {
      console.error('Failed to snooze alert:', error);
    }
  };

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged_at);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged_at);

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Alerts"
        subtitle={`${unacknowledgedAlerts.length} active, ${acknowledgedAlerts.length} resolved`}
      />
      <CardBody className="space-y-3 max-h-96 overflow-y-auto">
        {loading && <div className="text-gray-500 text-center">Loading alerts...</div>}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All systems nominal!</p>
          </div>
        )}

        {unacknowledgedAlerts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Unacknowledged</h4>
            <div className="space-y-2">
              {unacknowledgedAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => handleAcknowledge(alert.id)}
                  onSnooze={(minutes) => handleSnooze(alert.id, minutes)}
                />
              ))}
            </div>
          </div>
        )}

        {acknowledgedAlerts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Resolved</h4>
            <div className="space-y-2 opacity-75">
              {acknowledgedAlerts.slice(0, 3).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => {}}
                  onSnooze={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
