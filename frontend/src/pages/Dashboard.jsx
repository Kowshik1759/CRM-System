import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import {
  Users,
  Target,
  Award,
  DollarSign,
  TrendingUp,
  CheckSquare,
  CalendarClock,
  ArrowUpRight,
  Clock,
  PhoneCall,
  Mail,
  Building,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axiosClient.get('/dashboard');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton count={4} type="card" />
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  const { kpis, leadsByStage, monthlyRevenue, recentActivities, upcomingFollowupList, urgentTasksList } = data || {};

  const STAGE_COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#6366f1', '#10b981', '#64748b'];

  const kpiCards = [
    {
      title: 'Total Customers',
      value: kpis?.totalCustomers || 0,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      link: '/customers'
    },
    {
      title: 'Total Leads',
      value: kpis?.totalLeads || 0,
      icon: Target,
      color: 'from-purple-600 to-pink-600',
      link: '/leads'
    },
    {
      title: 'Converted Leads',
      value: kpis?.convertedLeads || 0,
      sub: `${kpis?.conversionRate || 0}% Win Rate`,
      icon: Award,
      color: 'from-emerald-600 to-teal-600',
      link: '/leads'
    },
    {
      title: 'Active Opportunities',
      value: kpis?.activeOpportunities || 0,
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      link: '/opportunities'
    },
    {
      title: 'Closed Revenue',
      value: `$${(kpis?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      link: '/reports'
    },
    {
      title: 'Pipeline Value',
      value: `$${(kpis?.pipelineValue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-indigo-500 to-blue-600',
      link: '/pipeline'
    },
    {
      title: 'Pending Tasks',
      value: kpis?.pendingTasks || 0,
      icon: CheckSquare,
      color: 'from-rose-500 to-red-600',
      link: '/tasks'
    },
    {
      title: 'Upcoming Follow-ups',
      value: kpis?.upcomingFollowUps || 0,
      icon: CalendarClock,
      color: 'from-sky-500 to-cyan-600',
      link: '/followups'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">Enterprise Overview</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">CRM Command Center</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time pipeline progression, deal velocity, and team operational metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/pipeline"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
          >
            <span>Open Pipeline</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition"
          >
            Detailed Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {card.value}
                </p>
                {card.sub && (
                  <p className="text-xs text-emerald-600 font-semibold mt-0.5">{card.sub}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Closed Revenue Performance</h3>
              <p className="text-xs text-slate-500">Historical closed won contract revenue over time</p>
            </div>
            <Link to="/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue && monthlyRevenue.length > 0 ? monthlyRevenue : [{ _id: 'Current', revenue: kpis?.totalRevenue || 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Stages Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Lead Funnel Distribution</h3>
            <p className="text-xs text-slate-500">Volume breakdown by pipeline stage</p>
          </div>
          <div className="h-60 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsByStage}
                  dataKey="count"
                  nameKey="stage"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {leadsByStage?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STAGE_COLORS[index % STAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Leads`, name]}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
            {leadsByStage?.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[idx % STAGE_COLORS.length] }} />
                <span className="truncate">{s.stage}: <b>{s.count}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Modules Row: Tasks, Follow-ups & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Follow-ups Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Upcoming Follow-ups</h3>
            </div>
            <Link to="/followups" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {upcomingFollowupList?.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No scheduled follow-ups pending</p>
            ) : (
              upcomingFollowupList?.map((item) => (
                <div key={item._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {item.customer?.company || item.lead?.company || 'General'}
                    </p>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      {new Date(item.scheduledDate).toLocaleDateString()} at{' '}
                      {new Date(item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Badge variant={item.priority} size="sm">{item.priority}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Urgent Tasks Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-800">Pending Tasks</h3>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {urgentTasksList?.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">All caught up! No pending tasks</p>
            ) : (
              urgentTasksList?.map((task) => (
                <div key={task._id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Assigned to: {task.assignedTo?.name || 'Unassigned'}</p>
                    <span className="text-[11px] text-slate-400">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={task.priority} size="sm">{task.priority}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-800">Recent Interactions</h3>
            </div>
            <Link to="/interactions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              History
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {recentActivities?.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No interactions recorded yet</p>
            ) : (
              recentActivities?.map((act) => (
                <div key={act._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{act.type}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(act.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-0.5">{act.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {act.customer?.company || act.lead?.company || 'Account'} &bull; by {act.performedBy?.name}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
