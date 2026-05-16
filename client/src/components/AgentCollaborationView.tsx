import React, { useEffect, useState } from 'react';
import axiosClient from '@api/client';

interface AgentInsight {
  insight: string;
  recommendation?: string;
  confidence: number;
}

interface Interaction {
  id: string;
  type: string;
  notes?: string;
  transcript?: string;
  agentInsights?: AgentInsight[];
  outcome?: string;
  createdAt: string;
}

interface AgentCollaborationViewProps {
  customerId: string;
}

export const AgentCollaborationView: React.FC<AgentCollaborationViewProps> = ({
  customerId,
}) => {
  const [customerData, setCustomerData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [interactionType, setInteractionType] = useState<'call' | 'email' | 'meeting' | 'note' | 'sms'>('call');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch agent insights
        const insightsRes = await axiosClient.get(`/api/agent-insights/customer/${customerId}/insights`);
        setInsights(insightsRes.data.data);
        setCustomerData(insightsRes.data.data.customerProfile);

        // Fetch interactions
        const interactionsRes = await axiosClient.get(`/api/customers/${customerId}/interactions`);
        setInteractions(interactionsRes.data.data || []);

        if (interactionsRes.data.data && interactionsRes.data.data.length > 0) {
          setActiveInteractionId(interactionsRes.data.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching collaboration data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const handleLogInteraction = async () => {
    if (!notes.trim()) {
      alert('Please enter notes for this interaction');
      return;
    }

    try {
      await axiosClient.post(`/api/customers/${customerId}/interactions`, {
        type: interactionType,
        notes,
        agentInsights: insights?.insights || [],
      });

      // Reset form
      setNotes('');
      setInteractionType('call');

      // Refetch interactions
      const res = await axiosClient.get(`/api/customers/${customerId}/interactions`);
      setInteractions(res.data.data || []);

      alert('Interaction logged successfully');
    } catch (error) {
      console.error('Error logging interaction:', error);
      alert('Failed to log interaction');
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading agent collaboration view...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-screen p-4 bg-gray-100">
      {/* Left: Customer Info */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">{customerData?.name}</h2>
        <div className="space-y-2 text-sm mb-4">
          <div>
            <span className="font-semibold text-gray-700">Email:</span>
            <p className="text-gray-600">{customerData?.email}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Company:</span>
            <p className="text-gray-600">{customerData?.company}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Customer KPIs</h3>
          {customerData?.kpis && (
            <div className="space-y-2 text-sm">
              {Object.entries(customerData.kpis).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-bold">{value?.toFixed(1) || 'N/A'}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-3">Recent Interactions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {interactions.slice(0, 5).map((interaction: Interaction) => (
              <div
                key={interaction.id}
                className={`p-2 rounded text-xs cursor-pointer ${
                  activeInteractionId === interaction.id
                    ? 'bg-blue-100 border-l-2 border-blue-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setActiveInteractionId(interaction.id)}
              >
                <div className="font-semibold capitalize">{interaction.type}</div>
                <div className="text-gray-600">
                  {new Date(interaction.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Agent Insights */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Agent Insights</h2>

        {insights?.insights && insights.insights.length > 0 ? (
          <div className="space-y-3 flex-1 overflow-y-auto">
            {insights.insights.map((insight: AgentInsight, idx: number) => (
              <div key={idx} className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                <div className="text-sm font-semibold text-blue-900 mb-2">{insight.insight}</div>
                {insight.recommendation && (
                  <div className="text-sm text-blue-800 italic mb-2">
                    💡 {insight.recommendation}
                  </div>
                )}
                <div className="text-xs text-blue-600">
                  Confidence: {(insight.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No insights available
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold text-sm mb-2">Knowledge Base Status</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>✓ Churn Prediction: Ready</div>
            <div>✓ Expansion Prediction: Ready</div>
            <div>✓ Sentiment Analysis: Ready</div>
          </div>
        </div>
      </div>

      {/* Right: Rep Interaction Form */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">Log Interaction</h2>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-semibold mb-2">Type</label>
            <select
              value={interactionType}
              onChange={(e) => setInteractionType(e.target.value as any)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="sms">SMS</option>
              <option value="note">Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter interaction notes, call transcript, or meeting summary..."
              className="w-full p-2 border rounded text-sm h-40"
            />
          </div>

          {activeInteractionId && (
            <div className="bg-green-50 p-3 rounded text-xs border-l-4 border-green-600">
              <div className="font-semibold text-green-900 mb-2">Agent will assist with:</div>
              <ul className="text-green-800 space-y-1">
                <li>• Suggesting proven approaches based on history</li>
                <li>• Alerting to churn/expansion risks</li>
                <li>• Recommending next steps</li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleLogInteraction}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Log Interaction & Get Agent Insights
        </button>

        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
          <div className="font-semibold mb-2">💬 Fluid Exchange Mode</div>
          <p>
            Agent adapts in real-time to your rep's feedback. Suggestions are contextual and
            collaborative, not directive.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentCollaborationView;
