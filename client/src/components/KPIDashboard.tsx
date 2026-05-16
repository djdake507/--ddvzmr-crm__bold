import React, { useEffect, useState } from 'react';
import { Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosClient from '@api/client';

interface KPIDashboardProps {
  customerId?: string;
  representativeId?: string;
  period?: number; // days
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({
  customerId,
  representativeId,
  period = 30,
}) => {
  const [kpiData, setKpiData] = useState<any>(null);
  const [aggregated, setAggregated] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setLoading(true);

        if (customerId) {
          // Fetch customer KPIs
          const res = await axiosClient.get(`/api/kpi/customer/${customerId}`, {
            params: { period },
          });
          setKpiData(res.data.data);
        } else if (representativeId) {
          // Fetch rep KPIs
          const res = await axiosClient.get(`/api/kpi/representative/${representativeId}`, {
            params: { period },
          });
          setKpiData(res.data.data);
        } else {
          // Fetch tenant-level aggregated KPIs
          const res = await axiosClient.get('/api/kpi/dashboard/aggregate', {
            params: { days: period },
          });
          setAggregated(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [customerId, representativeId, period]);

  if (loading) {
    return <div className="p-4 text-center">Loading KPI data...</div>;
  }

  // Tenant-level dashboard
  if (aggregated && !customerId && !representativeId) {
    const metrics = aggregated.aggregated || {};
    const customerCount = aggregated.customerCount || 0;

    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Tenant KPI Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded">
            <div className="text-sm font-semibold text-gray-600">Total Customers</div>
            <div className="text-3xl font-bold text-blue-600">{customerCount}</div>
          </div>

          {Object.entries(metrics).map(([metricName, data]: [string, any]) => (
            <div key={metricName} className="p-4 bg-green-50 rounded">
              <div className="text-sm font-semibold text-gray-600 capitalize">
                {metricName.replace(/_/g, ' ')}
              </div>
              <div className="text-3xl font-bold text-green-600">
                {data.avg?.toFixed(1) || 0}
              </div>
              <div className="text-xs text-gray-500">
                Min: {data.min?.toFixed(1)} | Max: {data.max?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-4">Metric Averages Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(metrics).map(([name, data]: [string, any]) => ({
              name: name.replace(/_/g, ' '),
              average: data.avg,
              min: data.min,
              max: data.max,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Customer/Rep KPI detail
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">KPI Metrics ({period} days)</h2>

      {kpiData && kpiData.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Metric Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <Line
                data={kpiData.slice(0, 20).reverse()}
                xAxis={{ dataKey: 'metricName' }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="createdAt" />
                <YAxis />
                <Tooltip />
              </Line>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {kpiData.slice(0, 6).map((kpi: any, idx: number) => (
              <div key={idx} className="p-4 bg-blue-50 rounded">
                <div className="text-sm font-semibold text-gray-600 capitalize">
                  {kpi.metricName?.replace(/_/g, ' ')}
                </div>
                <div className="text-2xl font-bold text-blue-600">{kpi.value?.toFixed(1)}</div>
                {kpi.trend && (
                  <div className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No KPI data available</div>
      )}
    </div>
  );
};

export default KPIDashboard;
