import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  KanbanSquare,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Building,
  User,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award
} from 'lucide-react';

export const SalesPipeline = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);

  const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'];

  const stageHeaderColors = {
    New: 'border-t-blue-500 bg-blue-50/40 text-blue-900',
    Contacted: 'border-t-purple-500 bg-purple-50/40 text-purple-900',
    Qualified: 'border-t-amber-500 bg-amber-50/40 text-amber-900',
    Proposal: 'border-t-indigo-500 bg-indigo-50/40 text-indigo-900',
    Converted: 'border-t-emerald-500 bg-emerald-50/40 text-emerald-900',
    Lost: 'border-t-slate-400 bg-slate-50/40 text-slate-700'
  };

  const fetchPipeline = async () => {
    try {
      const res = await axiosClient.get('/pipeline');
      if (res.success) {
        setPipelineData(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch sales pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleMoveStage = async (leadId, newStage) => {
    setMovingId(leadId);
    try {
      const res = await axiosClient.patch(`/leads/${leadId}/stage`, { status: newStage });
      if (res.success) {
        success(`Lead moved to "${newStage}" stage!`);
        fetchPipeline();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setMovingId(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={4} type="card" />;
  }

  const { columns, totalPipelineValue, activeDealsCount, totalLeads } = pipelineData || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Pipeline Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <KanbanSquare className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sales Pipeline Board</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visual stage progression, deal velocity, and total pipeline capitalization.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="border-l pl-4 border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Deals</span>
            <p className="text-xl font-extrabold text-slate-800">{activeDealsCount || 0}</p>
          </div>
          <div className="border-l pl-4 border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Capital</span>
            <p className="text-xl font-extrabold text-indigo-600">
              ${(totalPipelineValue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {stages.map((stage, idx) => {
          const col = columns?.[stage] || { items: [], totalValue: 0, count: 0 };
          const prevStage = idx > 0 ? stages[idx - 1] : null;
          const nextStage = idx < stages.length - 1 ? stages[idx + 1] : null;

          return (
            <div
              key={stage}
              className="flex-shrink-0 w-80 bg-slate-100/70 rounded-2xl border border-slate-200/90 flex flex-col max-h-[78vh]"
            >
              {/* Column Header */}
              <div
                className={`p-4 rounded-t-2xl border-t-4 border-b border-slate-200/80 ${stageHeaderColors[stage]}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm tracking-tight">{stage}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-slate-700 shadow-xs">
                    {col.count}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs opacity-80">
                  <span>Stage Volume:</span>
                  <span className="font-bold">${(col.totalValue || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Cards list */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {col.items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No deals in {stage}
                  </div>
                ) : (
                  col.items.map((lead) => (
                    <div
                      key={lead._id}
                      className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {lead.title}
                          </h4>
                          <Badge variant={lead.priority} size="sm">
                            {lead.priority}
                          </Badge>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">{lead.company}</span>
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Contact: <span className="text-slate-600">{lead.name}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Value</span>
                          <span className="text-sm font-extrabold text-indigo-600">
                            ${(lead.estimatedValue || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Stage changer actions */}
                        <div className="flex items-center gap-1">
                          {prevStage && (
                            <button
                              onClick={() => handleMoveStage(lead._id, prevStage)}
                              disabled={movingId === lead._id}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                              title={`Move to ${prevStage}`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          )}
                          {nextStage && (
                            <button
                              onClick={() => handleMoveStage(lead._id, nextStage)}
                              disabled={movingId === lead._id}
                              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
                              title={`Advance to ${nextStage}`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

