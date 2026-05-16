import React, { useEffect, useState } from 'react';
import axiosClient from '@api/client';

interface PipelineStage {
  name: string;
  order: number;
  auto_transition?: boolean;
}

interface CustomerCard {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  kpiMetrics?: Record<string, any>;
}

interface PipelineKanbanProps {
  pipelineId: string;
}

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({ pipelineId }) => {
  const [pipeline, setPipeline] = useState<any>(null);
  const [stages, setStages] = useState<Record<string, CustomerCard[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/api/pipelines/${pipelineId}`);
        setPipeline(res.data.data.pipeline);
        setStages(res.data.data.stages);
      } catch (error) {
        console.error('Error fetching pipeline:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, [pipelineId]);

  if (loading) {
    return <div className="p-4 text-center">Loading pipeline...</div>;
  }

  if (!pipeline) {
    return <div className="p-4 text-center text-red-600">Pipeline not found</div>;
  }

  const handleAdvanceCustomer = async (customerId: string, stageName: string) => {
    try {
      await axiosClient.post(`/api/pipelines/${pipelineId}/customers/${customerId}/advance`);
      // Refetch pipeline
      const res = await axiosClient.get(`/api/pipelines/${pipelineId}`);
      setStages(res.data.data.stages);
    } catch (error) {
      console.error('Error advancing customer:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2">{pipeline.name}</h1>
      {pipeline.description && <p className="text-gray-600 mb-6">{pipeline.description}</p>}

      <div className="overflow-x-auto">
        <div className="flex gap-4" style={{ minWidth: '100%' }}>
          {(pipeline.stages as PipelineStage[]).map((stage) => (
            <div
              key={stage.name}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{stage.name}</h2>
                <div className="text-sm text-gray-600">
                  {stages[stage.name]?.length || 0} customers
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stages[stage.name] && stages[stage.name].length > 0 ? (
                  stages[stage.name].map((customer: CustomerCard) => (
                    <div
                      key={customer.id}
                      className="p-3 bg-white rounded border border-gray-300 hover:shadow-md transition cursor-move"
                    >
                      <div className="font-semibold text-sm">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-xs text-gray-600">{customer.email}</div>

                      {customer.kpiMetrics && (
                        <div className="mt-2 text-xs">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Health: {(customer.kpiMetrics as any).health_score?.toFixed(0) || 'N/A'}%
                          </span>
                        </div>
                      )}

                      <div className="mt-2 flex gap-2">
                        {stage.order < (pipeline.stages as PipelineStage[]).length - 1 && (
                          <button
                            onClick={() => handleAdvanceCustomer(customer.id, stage.name)}
                            className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">No customers</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
        <h3 className="font-semibold text-blue-900 mb-2">Pipeline Info</h3>
        <p className="text-blue-800">
          Total customers in pipeline: {Object.values(stages).flat().length}
        </p>
      </div>
    </div>
  );
};

export default PipelineKanban;
