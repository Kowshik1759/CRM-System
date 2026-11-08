import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  CalendarClock,
  ArrowUpRight,
  Download,
  Filter,
  DollarSign,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const Reports = () => {
  const { error: toastError } = useToast();
  const [activeReport, setActiveReport] = useState('conversion'); // conversion, sales, customers, followups
  const [loading, setLoading] = useState(true);

  // Report Data States
  const [conversionData, setConversionData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [followupData, setFollowupData] = useState(null);

  // Customer report filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatus, setCustomerStatus] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeReport === 'conversion') {
        const res = await axiosClient.get('/reports/lead-conversion');
        if (res.success) setConversionData(res.data);
      } else if (activeReport === 'sales') {
        const res = await axiosClient.get('/reports/sales-performance');
        if (res.success) setSalesData(res.data);
      } else if (activeReport === 'customers') {
        const params = {};
        if (customerSearch) params.search = customerSearch;
        if (customerStatus) params.status = customerStatus;
        const res = await axiosClient.get('/reports/customer-details', { params });
        if (res.success) setCustomerData(res.data);
      } else if (activeReport === 'followups') {
        const res = await axiosClient.get('/reports/followup-activity');
        if (res.success) setFollowupData(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeReport, customerStatus]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Enterprise Reports & Analytics</h1>
          <p className="text-sm text-slate-500">
            Real-time business intelligence calculated dynamically from live database records.
          </p>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveReport('conversion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeReport === 'conversion'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>1. Lead Conversion</span>
        </button>

        <button
          onClick={() => setActiveReport('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeReport === 'sales'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. Sales Performance</span>
        </button>

        <button
          onClick={() => setActiveReport('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeReport === 'customers'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Customer Details</span>
        </button>

        <button
          onClick={() => setActiveReport('followups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            activeReport === 'followups'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>4. Follow-up Activity</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} type="card" />
      ) : (
        <>
          {/* ========================================================= */}
          {/* REPORT 1: LEAD CONVERSION REPORT */}
          {/* ========================================================= */}
          {activeReport === 'conversion' && conversionData && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Leads</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{conversionData.summary.totalLeads}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Converted Leads</span>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{conversionData.summary.convertedLeads}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-rose-500 uppercase">Lost Leads</span>
                  <p className="text-2xl font-extrabold text-rose-500 mt-1">{conversionData.summary.lostLeads}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-indigo-600 uppercase">Conversion Rate</span>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">{conversionData.summary.conversionRate}%</p>
                </div>
              </div>

              {/* Funnel Chart & Source Conversion Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800 mb-1">Conversion Funnel Progression</h3>
                  <p className="text-xs text-slate-500 mb-4">Lead volume across stages</p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionData.funnel} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: '#334155' }} width={80} />
                        <Tooltip
                          formatter={(val) => [`${val} Leads`, 'Count']}
                          contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800 mb-1">Conversion by Lead Acquisition Source</h3>
                  <p className="text-xs text-slate-500 mb-4">Effectiveness across marketing channels</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs font-bold text-slate-500 uppercase">
                          <th className="pb-3">Source</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Won</th>
                          <th className="pb-3">Win %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {conversionData.sourceBreakdown?.map((src) => (
                          <tr key={src.source}>
                            <td className="py-2.5 font-semibold text-slate-800">{src.source}</td>
                            <td className="py-2.5 text-slate-600">{src.total}</td>
                            <td className="py-2.5 text-emerald-600 font-bold">{src.converted}</td>
                            <td className="py-2.5 font-bold text-indigo-600">{Math.round(src.conversionRate)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REPORT 2: SALES PERFORMANCE REPORT */}
          {/* ========================================================= */}
          {activeReport === 'sales' && salesData && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Revenue Generated</span>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                    ${(salesData.summary.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Deals Won</span>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                    {salesData.summary.wonOpportunitiesCount} Opportunities
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Average Deal Size</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">
                    ${(salesData.summary.averageDealSize || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Monthly Sales Trends Chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-1">Monthly Sales Revenue Trends</h3>
                <p className="text-xs text-slate-500 mb-4">Historical sales performance by closed month</p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData.monthlySalesTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val / 1000}k`} />
                      <Tooltip
                        formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sales Rep Leaderboard Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-4">Sales Performance by Employee</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-bold text-slate-500 uppercase">
                        <th className="pb-3">Sales Executive</th>
                        <th className="pb-3">Won Deals</th>
                        <th className="pb-3">Total Closed Revenue</th>
                        <th className="pb-3">Average Deal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {salesData.salesByEmployee?.map((emp) => (
                        <tr key={emp.employeeId}>
                          <td className="py-3">
                            <span className="font-bold text-slate-800">{emp.employeeName}</span>
                            <span className="text-xs text-slate-400 block">{emp.employeeEmail}</span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">{emp.wonOpportunities}</td>
                          <td className="py-3 font-bold text-emerald-600">${emp.totalRevenue.toLocaleString()}</td>
                          <td className="py-3 font-medium text-slate-600">
                            ${Math.round(emp.totalRevenue / emp.wonOpportunities).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REPORT 3: CUSTOMER DETAILS REPORT */}
          {/* ========================================================= */}
          {activeReport === 'customers' && customerData && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-3 items-center flex-1">
                  <input
                    type="text"
                    placeholder="Search customer report..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchReportData()}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={customerStatus}
                    onChange={(e) => setCustomerStatus(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lead">Prospect</option>
                  </select>
                </div>
                <div className="text-sm font-bold text-slate-700">
                  Total Matching Customers: {customerData.totalCustomers}
                </div>
              </div>

              {/* Status Breakdown & Acquisition Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-base font-bold text-slate-800 mb-1">Customer Acquisition Velocity</h3>
                  <p className="text-xs text-slate-500 mb-4">New customer signups by month</p>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData.acquisitionTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Status Capitalization</h3>
                    <p className="text-xs text-slate-500 mb-4">Total revenue breakdown by account status</p>
                  </div>
                  <div className="space-y-4 my-auto">
                    {customerData.statusBreakdown?.map((item) => (
                      <div key={item._id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                        <div>
                          <Badge variant={item._id}>{item._id}</Badge>
                          <span className="text-xs text-slate-500 ml-2">({item.count} Accounts)</span>
                        </div>
                        <span className="text-base font-bold text-emerald-600">
                          ${(item.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Detailed Listing */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Assigned Rep</th>
                        <th className="px-6 py-4">Created Date</th>
                        <th className="px-6 py-4">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerData.customers?.map((cust) => (
                        <tr key={cust._id}>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-800">{cust.company}</span>
                            <span className="text-xs text-slate-400 block">{cust.name} &bull; {cust.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={cust.status}>{cust.status}</Badge>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">
                            {cust.assignedTo?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(cust.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600">
                            ${(cust.totalRevenue || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* REPORT 4: FOLLOW-UP ACTIVITY REPORT */}
          {/* ========================================================= */}
          {activeReport === 'followups' && followupData && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Follow-ups</span>
                  <p className="text-2xl font-extrabold text-slate-800 mt-1">{followupData.summary.totalFollowups}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Completed</span>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1">{followupData.summary.completedFollowups}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-amber-500 uppercase">Pending</span>
                  <p className="text-2xl font-extrabold text-amber-500 mt-1">{followupData.summary.pendingFollowups}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-rose-500 uppercase">Overdue</span>
                  <p className="text-2xl font-extrabold text-rose-500 mt-1">{followupData.summary.overdueFollowups}</p>
                </div>
              </div>

              {/* Employee activity table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-1">Employee Follow-up Compliance & Activity</h3>
                <p className="text-xs text-slate-500 mb-4">Adherence to scheduled communication cadences</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-bold text-slate-500 uppercase">
                        <th className="pb-3">Employee</th>
                        <th className="pb-3">Total Scheduled</th>
                        <th className="pb-3">Completed</th>
                        <th className="pb-3">Pending</th>
                        <th className="pb-3">Overdue</th>
                        <th className="pb-3">Compliance Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {followupData.employeeActivity?.map((emp) => (
                        <tr key={emp.employeeId}>
                          <td className="py-3 font-bold text-slate-800">{emp.employeeName}</td>
                          <td className="py-3 text-slate-600">{emp.total}</td>
                          <td className="py-3 text-emerald-600 font-semibold">{emp.completed}</td>
                          <td className="py-3 text-amber-600 font-semibold">{emp.pending}</td>
                          <td className="py-3 text-rose-600 font-semibold">{emp.overdue}</td>
                          <td className="py-3 font-bold text-indigo-600">{Math.round(emp.completionRate)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

