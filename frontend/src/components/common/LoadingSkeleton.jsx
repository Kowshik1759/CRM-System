import React from 'react';

export const LoadingSkeleton = ({ count = 4, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-100 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-32 bg-slate-100 border border-slate-200/60 rounded-2xl p-5">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
