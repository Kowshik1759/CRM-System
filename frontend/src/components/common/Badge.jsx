import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variantStyles = {
    // Lead Stages
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    Qualified: 'bg-amber-50 text-amber-700 border-amber-200',
    Proposal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Lost: 'bg-slate-100 text-slate-600 border-slate-200',

    // Priorities
    Low: 'bg-slate-100 text-slate-700 border-slate-200',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200',
    High: 'bg-amber-50 text-amber-800 border-amber-300',
    Urgent: 'bg-rose-50 text-rose-700 border-rose-300 font-semibold',

    // Statuses
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    Cancelled: 'bg-slate-100 text-slate-500 border-slate-200',

    // Customer status
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    lead: 'bg-amber-50 text-amber-700 border-amber-200',

    // Roles
    admin: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    sales_manager: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    sales_executive: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    customer_support: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',

    // Defaults
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sz = sizeStyles[size] || sizeStyles.md;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${style} ${sz}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};

