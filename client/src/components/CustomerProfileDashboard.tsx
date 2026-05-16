import React, { useEffect, useState } from 'react';
import axiosClient from '@api/client';
import KPIDashboard from './KPIDashboard';

interface Customer {
  id: string;
  vendorCustomerId?: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  status: string;
  surfaceData?: Record<string, any>;
  internalProfile?: Record<string, any>;
  agentAccessibleProfile?: Record<string, any>;
  kpiMetrics?: Record<string, any>;
}

interface CustomerProfileDashboardProps {
  customerId: string;
  onClose?: () => void;
}

export const CustomerProfileDashboard: React.FC<CustomerProfileDashboardProps> = ({
  customerId,
  onClose,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'kpi' | 'interactions'>('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch customer profile
        const customerRes = await axiosClient.get(`/api/customers/${customerId}`);
        setCustomer(customerRes.data.data);

        // Fetch interactions
        const interactionsRes = await axiosClient.get(`/api/customers/${customerId}/interactions`);
        setInteractions(interactionsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return <div className="p-4 text-center">Loading customer profile...</div>;
  }

  if (!customer) {
    return <div className="p-4 text-center text-red-600">Customer not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-gray-600">{customer.email}</p>
            {customer.company && <p className="text-gray-500">{customer.company}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
              {customer.status}
            </span>
          </div>
          {customer.vendorCustomerId && (
            <div>
              <span className="font-semibold text-gray-700">Vendor ID:</span>
              <span className="ml-2 text-gray-600">{customer.vendorCustomerId}</span>
            </div>
          )}
          {customer.kpiMetrics && (
            <div>
              <span className="font-semibold text-gray-700">Health Score:</span>
              <span className="ml-2 font-bold">
                {(customer.kpiMetrics as any).health_score?.toFixed(0) || 'N/A'}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex">
        {(['profile', 'kpi', 'interactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Layer 1: Surface Data */}
            {customer.surfaceData && Object.keys(customer.surfaceData).length > 0 && (
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-lg font-semibold mb-4">Surface Data (Layer 1 - Vendor)</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(customer.surfaceData).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layer 2: Internal Profile (Redacted) */}
            {customer.internalProfile && Object.keys(customer.internalProfile).length > 0 && (
              <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-600">
                <h3 className="text-lg font-semibold mb-4 text-blue-900">
                  Internal Profile (Layer 2 - Admin/Agent Only)
                </h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(customer.internalProfile).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                      <span className="text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kpi' && <KPIDashboard customerId={customerId} />}

        {activeTab === 'interactions' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Interactions ({interactions.length})</h3>
            {interactions.length > 0 ? (
              interactions.map((interaction: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded border-l-4 border-green-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold capitalize">{interaction.type}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(interaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {interaction.notes && (
                    <div className="mt-2 text-sm text-gray-700">{interaction.notes}</div>
                  )}
                  {interaction.agentInsights && interaction.agentInsights.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <div className="font-semibold text-blue-900">Agent Insights:</div>
                      {interaction.agentInsights.map((insight: any, i: number) => (
                        <div key={i} className="mt-1">
                          <div className="text-blue-800">{insight.insight}</div>
                          {insight.recommendation && (
                            <div className="text-blue-700 italic">
                              → {insight.recommendation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No interactions yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProfileDashboard;
