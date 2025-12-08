import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SensorReading } from '../../types';
import { Card, CardHeader, CardBody } from '../common/Card';

interface MoistureGraphProps {
  data: SensorReading[];
  loading?: boolean;
}

export function MoistureGraph({ data, loading }: MoistureGraphProps) {
  const chartData = data
    .map((reading) => ({
      timestamp: new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      sensor1: reading.soil_moisture_1,
      sensor2: reading.soil_moisture_2,
      time: new Date(reading.timestamp).getTime(),
    }))
    .reverse();

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader title="Soil Moisture" subtitle="Tracking moisture levels over time" />
        <CardBody className="h-80 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title="Soil Moisture"
        subtitle="Moisture levels from dual sensors with wilting point and corm rot thresholds"
      />
      <CardBody className="p-0">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timestamp"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9ca3af' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return `${value.toFixed(1)}%`;
                }
                return `${value}%`;
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '16px' }} />

            <ReferenceLine
              y={30}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: 'Wilting Point (30%)', position: 'left', fill: '#ef4444' }}
            />
            <ReferenceLine
              y={85}
              stroke="#f97316"
              strokeDasharray="5 5"
              label={{ value: 'Corm Rot Risk (85%)', position: 'left', fill: '#f97316' }}
            />

            <Line
              type="monotone"
              dataKey="sensor1"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Sensor 1"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sensor2"
              stroke="#8b5cf6"
              dot={false}
              strokeWidth={2}
              name="Sensor 2"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
