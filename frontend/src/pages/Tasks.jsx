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
  CheckSquare,
  Plus,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  Filter
} from 'lucide-react';

export const Tasks = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assignedFilter) params.assignedTo = assignedFilter;

      const res = await axiosClient.get('/tasks', { params });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      if (res.success) setUsersList(res.data);
    } catch (err) {
      // non-admin
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, assignedFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 3);

    setFormData({
      ...initialForm,
      assignedTo: user?.id || '',
      dueDate: defaultDue.toISOString().slice(0, 10)
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ''
    });
    setIsEditOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/tasks', formData);
      if (res.success) {
        success('Task created successfully!');
        setIsAddOpen(false);
        fetchTasks();
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
      const res = await axiosClient.put(`/tasks/${selectedTask._id}`, formData);
      if (res.success) {
        success('Task updated successfully!');
        setIsEditOpen(false);
        fetchTasks();
      }
    } catch (err) {
      toastError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await axiosClient.put(`/tasks/${task._id}`, { status: nextStatus });
      if (res.success) {
        success(`Task marked as ${nextStatus}!`);
        fetchTasks();
      }
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await axiosClient.delete(`/tasks/${selectedTask._id}`);
      if (res.success) {
        success('Task deleted successfully');
        setIsDeleteOpen(false);
        fetchTasks();
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Task Management</h1>
          <p className="text-sm text-slate-500">
            Assign sales deliverables, collaborate with colleagues, and track execution status.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {usersList.length > 0 && (
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Assignees</option>
            {usersList.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tasks Table */}
      {loading ? (
        <LoadingSkeleton count={5} type="table" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create your first task assignment to boost team productivity."
          actionLabel="Create Task"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Status & Title</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tasks.map((task) => {
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr
                      key={task._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCompleted ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-indigo-600 bg-white'
                            }`}
                            title="Toggle Completed"
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <div>
                            <span
                              className={`font-bold text-slate-800 ${
                                isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700">
                          {task.assignedTo?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={task.priority} size="sm">
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? 'Create New Task' : 'Edit Task'}
      >
        <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Prepare Security Compliance Whitepaper"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Assigned Employee *</label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Choose User --</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role?.replace('_', ' ')})
                  </option>
                ))}
              </select>
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
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Instructions or acceptance criteria for this task..."
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
              {submitting ? 'Saving...' : isAddOpen ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};
