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
  CalendarClock,
  Plus,
  CheckCircle2,
  Phone,
  Video,
  Mail,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  Building,
  User,
  Trash2
} from 'lucide-react';

export const FollowUps = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [followUps, setFollowUps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, Overdue, Completed

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    type: 'Call',
    scheduledDate: '',
    priority: 'Medium',
    targetType: 'customer', // customer or lead
    targetId: '',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'Pending') params.status = 'Pending';
      if (activeTab === 'Overdue') params.status = 'Overdue';
      if (activeTab === 'Completed') params.status = 'Completed';

      const res = await axiosClient.get('/followups', { params });
      if (res.success) {
        setFollowUps(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch follow-ups');
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
    fetchFollowUps();
  }, [activeTab]);

  useEffect(() => {
    fetchRelationalData();
  }, []);

  const handleOpenAdd = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    setFormData({
      ...initialForm,
      scheduledDate: tomorrow.toISOString().slice(0, 16)
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        type: formData.type,
        scheduledDate: formData.scheduledDate,
        priority: formData.priority,
        notes: formData.notes
      };

      if (formData.targetType === 'customer' && formData.targetId) {
        payload.customer = formData.targetId;
      } else if (formData.targetType === 'lead' && formData.targetId) {
        payload.lead = formData.targetId;
      }

      const res = await axiosClient.post('/followups', payload);
      if (res.success) {
        success('Follow-up activity scheduled!');
        setIsAddOpen(false);
        fetchFollowUps();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteConfirm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.put(`/followups/${selectedFollowUp._id}`, {
        status: 'Completed',
        outcome: outcomeNotes
      });
      if (res.success) {
        success('Follow-up marked as Completed!');
        setIsCompleteOpen(false);
        setOutcomeNotes('');
        fetchFollowUps();
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
      const res = await axiosClient.delete(`/followups/${selectedFollowUp._id}`);
      if (res.success) {
        success('Follow-up record removed');
        setIsDeleteOpen(false);
        fetchFollowUps();
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
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'Meeting':
      case 'Demo':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'Email':
        return <Mail className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Follow-up Management</h1>
          <p className="text-sm text-slate-500">
            Schedule touches, prevent customer churn, and stay on top of pending deal tasks.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-up</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['All', 'Pending', 'Overdue', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Follow-up list */}
      {loading ? (
        <LoadingSkeleton count={4} type="card" />
      ) : followUps.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={`No ${activeTab.toLowerCase()} follow-up activities found`}
          description="Keep your client conversations momentum moving by scheduling your next interaction."
          actionLabel="Schedule Activity"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {followUps.map((item) => {
            const isOverdue =
              item.status === 'Overdue' ||
              (item.status === 'Pending' && new Date(item.scheduledDate) < new Date());

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isOverdue ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                      </div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>
                    <Badge variant={isOverdue ? 'Overdue' : item.status} size="sm">
                      {isOverdue ? 'Overdue' : item.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 mt-3 line-clamp-1">{item.title}</h3>

                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {item.customer?.company || item.lead?.company || 'General Outreach'}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.scheduledDate).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg line-clamp-2">
                      {item.notes}
                    </p>
                  )}

                  {item.outcome && (
                    <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                      Outcome: {item.outcome}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant={item.priority} size="sm">
                    {item.priority}
                  </Badge>

                  <div className="flex items-center gap-2">
                    {item.status !== 'Completed' && (
                      <button
                        onClick={() => {
                          setSelectedFollowUp(item);
                          setIsCompleteOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedFollowUp(item);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Client Follow-up">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Follow-up Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Discuss Q4 Pricing Renewal with CEO"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Activity Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Call">Phone Call</option>
                <option value="Meeting">In-Person Meeting</option>
                <option value="Demo">Online Demo / Zoom</option>
                <option value="Email">Email Follow-up</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Link Target Type</label>
              <select
                value={formData.targetType}
                onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetId: '' })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="customer">Customer Account</option>
                <option value="lead">Sales Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Select Record</label>
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
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes & Agenda</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Discussion points or reminder requirements..."
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
              {submitting ? 'Saving...' : 'Save Follow-up'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Outcome Modal */}
      <Modal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        title="Mark Follow-up as Completed"
      >
        <form onSubmit={handleCompleteConfirm} className="space-y-4">
          <p className="text-sm text-slate-600">
            Record the outcome and next action items resulting from this activity:
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
              Call / Meeting Outcome *
            </label>
            <textarea
              required
              rows={3}
              value={outcomeNotes}
              onChange={(e) => setOutcomeNotes(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Client approved 15% discount; sending contract for electronic signature."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCompleteOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition"
            >
              {submitting ? 'Completing...' : 'Confirm Completion'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Follow-up Activity"
        message="Are you sure you want to remove this follow-up record?"
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

