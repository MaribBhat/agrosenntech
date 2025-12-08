import { Card, CardHeader, CardBody } from '../components/common/Card';

export function Alerts() {
  return (
    <main className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Alert Center</h2>

        <Card>
          <CardHeader title="Alert Management" subtitle="Coming soon" />
          <CardBody className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Alert management center is under development</p>
              <p className="text-sm text-gray-500">
                Configure alert rules, notification channels, and view alert history
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
