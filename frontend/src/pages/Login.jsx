import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, ArrowRight, Lock, Mail, Shield, UserCheck, Briefcase, Headphones } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleLoginSubmit = async (userEmail, userPassword) => {
    setLoading(true);
    try {
      const user = await login(userEmail, userPassword);
      success(`Welcome back, ${user.name}!`);
      navigate('/');
    } catch (err) {
      toastError(err.message || 'Failed to sign in. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginSubmit(email, password);
  };

  const handleFillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLoginSubmit(demoEmail, demoPass);
  };

  const demoAccounts = [
    {
      role: 'Admin',
      badge: 'Full Access',
      email: 'admin@crm.com',
      pass: 'Admin@123',
      icon: Shield,
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300'
    },
    {
      role: 'Sales Manager',
      badge: 'Team & Pipeline',
      email: 'manager@crm.com',
      pass: 'Manager@123',
      icon: Briefcase,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300'
    },
    {
      role: 'Sales Executive',
      badge: 'Leads & Tasks',
      email: 'sales@crm.com',
      pass: 'Sales@123',
      icon: UserCheck,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    },
    {
      role: 'Customer Support',
      badge: 'Service & Logs',
      email: 'support@crm.com',
      pass: 'Support@123',
      icon: Headphones,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-600/30 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Enterprise CRM Pro</h2>
        <p className="mt-2 text-sm text-slate-400">
          Small Business Sales, Pipeline & Support Management
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {/* Left Card: Demo Account Quick-Fill */}
        <div className="bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl rounded-3xl border border-slate-700/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Quick Demo Access</h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Click any role card below to instantly populate credentials and test role-specific screens:
            </p>

            <div className="space-y-3">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleFillDemo(acc.email, acc.pass)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-700/50 hover:border-indigo-500/50 transition duration-150 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${acc.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                          {acc.role}
                        </div>
                        <div className="text-xs text-slate-400">{acc.email}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-500 text-center">
            SR University Capstone &bull; DevOps & Full Stack Development
          </div>
        </div>

        {/* Right Card: Manual Sign-In Form */}
        <div className="bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl rounded-3xl border border-slate-700/80">
          <h3 className="text-lg font-bold text-white mb-2">Sign In with Credentials</h3>
          <p className="text-xs text-slate-400 mb-6">Enter your registered business account credentials</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
