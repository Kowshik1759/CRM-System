import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  TrendingUp,
  Plus,
  DollarSign,
  Award,
  Calendar,
  Building,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search
} from 'lucide-react';

export const Opportunities = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [metrics, setMetrics] = useState({ totalValue: 0, wonValue: 0, pipelineValue: 0 });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    customer: '',
    value: '',
    stage: 'Discovery',
    probability: 20,
    expectedCloseDate: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (stageFilter) params.stage = stageFilter;
      if (search) params.search = search;

      const res = await axiosClient.get('/opportunities', { params });
      if (res.success) {
        setOpportunities(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers?limit=100');
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [stageFilter]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    setFormData({
      ...initialForm,
      expectedCloseDate: futureDate.toISOString().slice(0, 10)
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (opp) => {
    setSelectedOpp(opp);
    setFormData({
      title: opp.title,
      customer: opp.customer?._id || '',
      value: opp.value,
      stage: opp.stage,
      probability: opp.probability,
      expectedCloseDate: opp.expectedCloseDate ? opp.expectedCloseDate.slice(0, 10) : '',
      notes: opp.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/opportunities', formData);
      if (res.success) {
        success('Opportunity created successfully!');
        setIsAddOpen(false);
        fetchOpportunities();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.put(`/opportunities/${selectedOpp._id}`, formData);
      if (res.success) {
        success('Opportunity updated successfully!');
        setIsEditOpen(false);
        fetchOpportunities();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetStage = async (opp, stage) => {
    try {
      const res = await axiosClient.put(`/opportunities/${opp._id}`, { stage });
      if (res.success) {
        success(`Opportunity marked as ${stage}!`);
        fetchOpportunities();
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.delete(`/opportunities/${selectedOpp._id}`);
      if (res.success) {
        success('Opportunity deleted successfully');
        setIsDeleteOpen(false);
        fetchOpportunities();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Opportunities Management</h1>
          <p className="text-sm text-slate-500">
            Forecast deal revenue, probability, and track win/loss outcomes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">
              ${(metrics.totalValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Closed Won Revenue</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              ${(metrics.wonValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pipeline</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              ${(metrics.pipelineValue || 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOpportunities();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search opportunity title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Opportunity Stages</option>
          <option value="Discovery">Discovery</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Closed Won">Closed Won</option>
          <option value="Closed Lost">Closed Lost</option>
        </select>
      </div>

      {/* Opportunities List Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No opportunities found"
          description="Create your first deal opportunity to start forecasting sales revenue."
          actionLabel="Create Opportunity"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Opportunity</th>
                  <th className="px-6 py-4">Customer Account</th>
                  <th className="px-6 py-4">Deal Value</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Win Probability</th>
                  <th className="px-6 py-4">Expected Close</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {opportunities.map((opp) => (
                  <tr key={opp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{opp.title}</span>
                      <p className="text-xs text-slate-400 mt-0.5">Rep: {opp.assignedTo?.name || 'Unassigned'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {opp.customer?.company || opp.lead?.company || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${(opp.value || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={opp.stage}>{opp.stage}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${opp.probability || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{opp.probability || 0}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(opp.expectedCloseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {opp.stage !== 'Closed Won' && (
                          <button
                            onClick={() => handleSetStage(opp, 'Closed Won')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Mark as Won"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {opp.stage !== 'Closed Lost' && (
                          <button
                            onClick={() => handleSetStage(opp, 'Closed Lost')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Mark as Lost"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(opp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOpp(opp);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Opportunity Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? 'Create New Opportunity' : 'Edit Opportunity'}
      >
        <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Enterprise License Expansion"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Customer Account</label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Deal Value ($) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="50000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Discovery">Discovery</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Win Probability (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Expected Close Date *</label>
              <input
                type="date"
                required
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Deal Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Commercial terms, competitor insights, discounts..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isAddOpen ? 'Create Opportunity' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Opportunity"
        message="Are you sure you want to delete this opportunity record?"
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};
