import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  History,
  FileText
} from 'lucide-react';

export const Customers = () => {
  const { user, isAdmin, isSalesManager } = useAuth();
  const { success, error: toastError } = useToast();

  const [customers, setCustomers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: 'Technology',
    status: 'active',
    source: 'Website',
    assignedTo: '',
    address: { street: '', city: '', state: '', zip: '', country: 'USA' },
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await axiosClient.get('/customers', { params });
      if (res.success) {
        setCustomers(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/users');
      if (res.success) {
        setUsersList(res.data);
      }
    } catch (err) {
      // Non-admins might not fetch all users
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenAdd = () => {
    setFormData({ ...initialForm, assignedTo: user?.id || '' });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      name: cust.name,
      company: cust.company,
      email: cust.email,
      phone: cust.phone,
      industry: cust.industry || 'Technology',
      status: cust.status || 'active',
      source: cust.source || 'Website',
      assignedTo: cust.assignedTo?._id || '',
      address: {
        street: cust.address?.street || '',
        city: cust.address?.city || '',
        state: cust.address?.state || '',
        zip: cust.address?.zip || '',
        country: cust.address?.country || 'USA'
      },
      notes: cust.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleOpenDetail = async (cust) => {
    setSelectedCustomer(cust);
    setIsDetailOpen(true);
    try {
      const res = await axiosClient.get(`/customers/${cust._id}`);
      if (res.success) {
        setCustomerDetails(res.data);
      }
    } catch (err) {
      toastError('Failed to fetch full customer profile');
    }
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosClient.post('/customers', formData);
      if (res.success) {
        success('Customer created successfully!');
        setIsAddOpen(false);
        fetchCustomers();
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
      const res = await axiosClient.put(`/customers/${selectedCustomer._id}`, formData);
      if (res.success) {
        success('Customer updated successfully!');
        setIsEditOpen(false);
        fetchCustomers();
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
      const res = await axiosClient.delete(`/customers/${selectedCustomer._id}`);
      if (res.success) {
        success('Customer deleted successfully');
        setIsDeleteOpen(false);
        fetchCustomers();
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
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Management</h1>
          <p className="text-sm text-slate-500">Manage client profiles, company contacts, and account health.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer, company, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Prospect / Lead</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {loading ? (
        <LoadingSkeleton count={6} type="table" />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers match your criteria"
          description="Try modifying your search or click below to onboard a new customer record."
          actionLabel="Create Customer"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Client Contact</th>
                  <th className="px-6 py-4">Company & Industry</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Rep</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{cust.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cust.email}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {cust.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-slate-400" />
                        {cust.company}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{cust.industry || 'Technology'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={cust.status}>{cust.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-700 font-medium">{cust.assignedTo?.name || 'Unassigned'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ${(cust.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(cust)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Profile & Interactions"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {(isAdmin || isSalesManager) && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={10}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? 'Add New Customer Record' : 'Edit Customer Record'}
      >
        <form onSubmit={isAddOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Acme Corporation"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="john@acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Healthcare, Manufacturing"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">City / State</label>
              <input
                type="text"
                value={`${formData.address.city}${formData.address.state ? ', ' + formData.address.state : ''}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      city: parts[0]?.trim() || '',
                      state: parts[1]?.trim() || ''
                    }
                  });
                }}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Austin, TX"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Street Address</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value }
                  })
                }
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="100 Main St"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Account Notes & Context</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Important SLA details, key internal stakeholders, renewal dates..."
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
              {submitting ? 'Saving...' : isAddOpen ? 'Create Customer' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Drawer / Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setCustomerDetails(null);
        }}
        title="Customer Profile & Timeline"
        maxWidth="max-w-3xl"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedCustomer.company}</h3>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5">{selectedCustomer.name}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600 mt-3">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.email}</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.phone}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.address?.city || 'N/A'}, {selectedCustomer.address?.state || 'USA'}</span>
                </div>
              </div>
              <div className="text-right flex sm:flex-col items-center sm:items-end gap-2">
                <Badge variant={selectedCustomer.status}>{selectedCustomer.status}</Badge>
                <div className="mt-2 text-sm font-bold text-emerald-600">
                  ${(selectedCustomer.totalRevenue || 0).toLocaleString()} Closed
                </div>
              </div>
            </div>

            {/* Interaction history section */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Customer Interaction History ({customerDetails?.interactions?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {!customerDetails?.interactions || customerDetails.interactions.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No logged interactions for this customer.</p>
                ) : (
                  customerDetails.interactions.map((int) => (
                    <div key={int._id} className="py-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-600 uppercase">{int.type}</span>
                        <span className="text-slate-400">{new Date(int.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{int.subject}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{int.details}</p>
                      {int.outcome && (
                        <p className="text-xs font-medium text-emerald-600 mt-1">Outcome: {int.outcome}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Opportunities section */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Associated Deals & Contracts ({customerDetails?.opportunities?.length || 0})
              </h4>
              <div className="space-y-2">
                {!customerDetails?.opportunities || customerDetails.opportunities.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2 text-center">No linked opportunities recorded.</p>
                ) : (
                  customerDetails.opportunities.map((opp) => (
                    <div key={opp._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-800">{opp.title}</span>
                        <p className="text-xs text-slate-500">Stage: {opp.stage}</p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">${(opp.value || 0).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Record"
        message={`Are you sure you want to delete "${selectedCustomer?.company}"? All related data will be archived.`}
        confirmText="Confirm Delete"
        loading={submitting}
      />
    </div>
  );
};

