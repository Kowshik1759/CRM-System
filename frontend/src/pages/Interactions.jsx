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
  History,
  Plus,
  Phone,
  Video,
  Mail,
  FileText,
  LifeBuoy,
  Clock,
  Building,
  User,
  Trash2,
  Search,
  Filter
} from 'lucide-react';

export const Interactions = () => {
  const { user, isAdmin, isSalesManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [interactions, setInteractions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    type: 'Call',
    subject: '',
    details: '',
    targetType: 'customer',
    targetId: '',
    date: new Date().toISOString().slice(0, 16),
    durationMinutes: 15,
    outcome: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;

      const res = await axiosClient.get('/interactions', { params });
      if (res.success) {
        setInteractions(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationalData = async () => {
    try {
      const [custRes, leadRes] = await Promise.all([
        axiosClient.get('/customers?limit=100'),
        axiosClient.get('/leads')
      ]);
      if (custRes.success) setCustomers(custRes.data);
      if (leadRes.success) setLeads(leadRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInteractions();
  }, [typeFilter]);

  useEffect(() => {
    fetchRelationalData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      date: new Date().toISOString().slice(0, 16)
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        type: formData.type,
        subject: formData.subject,
        details: formData.details,
        date: formData.date,
        durationMinutes: Number(formData.durationMinutes) || 0,
        outcome: formData.outcome
      };

      if (formData.targetType === 'customer' && formData.targetId) {
        payload.customer = formData.targetId;
      } else if (formData.targetType === 'lead' && formData.targetId) {
        payload.lead = formData.targetId;
      }

      const res = await axiosClient.post('/interactions', payload);
      if (res.success) {
        success('Customer touchpoint logged successfully!');
        setIsAddOpen(false);
        fetchInteractions();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.delete(`/interactions/${selectedInteraction._id}`);
      if (res.success) {
        success('Interaction record deleted');
        setIsDeleteOpen(false);
        fetchInteractions();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call':
        return <Phone className="w-5 h-5 text-blue-600" />;
      case 'Meeting':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'Email':
        return <Mail className="w-5 h-5 text-amber-600" />;
      case 'Support Ticket':
        return <LifeBuoy className="w-5 h-5 text-teal-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Interaction History</h1>
          <p className="text-sm text-slate-500">
            Chronological log of phone conversations, meetings, email correspondence, and support resolution notes.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Log Interaction</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchInteractions();
          }}
          className="relative w-full sm:w-80"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search interaction notes or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Interaction Channels</option>
          <option value="Call">Phone Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Email">Email</option>
          <option value="Note">Internal Note</option>
          <option value="Support Ticket">Support Ticket</option>
        </select>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <LoadingSkeleton count={4} type="card" />
      ) : interactions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No customer interactions recorded"
          description="Log notes from your calls, emails, or discovery sessions to maintain institutional history."
          actionLabel="Log First Interaction"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {interactions.map((int) => (
            <div key={int._id} className="relative group">
              {/* Timeline indicator node */}
              <div className="absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 shadow-sm flex items-center justify-center transform -translate-x-1/2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              </div>

              {/* Card content */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getTypeIcon(int.type)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {int.type}
                      </span>
                      <h3 className="text-base font-bold text-slate-800">{int.subject}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(int.date).toLocaleDateString()} at {new Date(int.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {int.durationMinutes > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                        {int.durationMinutes} mins
                      </span>
                    )}
                    {(isAdmin || isSalesManager) && (
                      <button
                        onClick={() => {
                          setSelectedInteraction(int);
                          setIsDeleteOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  {int.details}
                </div>

                {int.outcome && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-100">
                    <span className="font-bold">Result / Outcome:</span> {int.outcome}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">
                      {int.customer?.company || int.lead?.company || 'General Interaction'}
                    </span>
                    {(int.customer?.name || int.lead?.name) && (
                      <span>({int.customer?.name || int.lead?.name})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Logged by: {int.performedBy?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Interaction Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Log Customer Interaction">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Subject *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Discussed Enterprise SLA and Payment terms"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Note">Internal Note</option>
                <option value="Support Ticket">Support Ticket</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Duration (minutes)</label>
              <input
                type="number"
                min="0"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Associate With</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="customer">Customer Record</option>
                <option value="lead">Sales Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Account</label>
              <select
                value={formData.targetId}
                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose Account --</option>
                {formData.targetType === 'customer'
                  ? customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.company} ({c.name})
                      </option>
                    ))
                  : leads.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.company} - {l.title}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Interaction Details *</label>
            <textarea
              required
              rows={4}
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Summary of topics discussed, customer feedback, pain points raised..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Outcome / Next Steps</label>
            <input
              type="text"
              value={formData.outcome}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Schedule technical architecture review next Monday."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Record Interaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Interaction Record"
        message="Are you sure you want to delete this interaction log?"
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

