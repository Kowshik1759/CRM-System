import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

// 12 Mandatory Screens
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Leads } from './pages/Leads';
import { SalesPipeline } from './pages/SalesPipeline';
import { FollowUps } from './pages/FollowUps';
import { Tasks } from './pages/Tasks';
import { Opportunities } from './pages/Opportunities';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Interactions } from './pages/Interactions';
import { ProfileSettings } from './pages/ProfileSettings';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* 1. Main Dashboard */}
              <Route index element={<Dashboard />} />

              {/* 2. Customer Management */}
              <Route path="customers" element={<Customers />} />

              {/* 3. Lead Management */}
              <Route path="leads" element={<Leads />} />

              {/* 4. Sales Pipeline */}
              <Route path="pipeline" element={<SalesPipeline />} />

              {/* 5. Follow-up Management */}
              <Route path="followups" element={<FollowUps />} />

              {/* 6. Task Management */}
              <Route path="tasks" element={<Tasks />} />

              {/* 7. Opportunities Management */}
              <Route path="opportunities" element={<Opportunities />} />

              {/* 8. Reports & Analytics */}
              <Route path="reports" element={<Reports />} />

              {/* 9. User Management (Admin Only) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* 10. Customer Interaction History */}
              <Route path="interactions" element={<Interactions />} />

              {/* 11. Profile and Settings */}
              <Route path="settings" element={<ProfileSettings />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
