import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";

import AdminLogin from "./pages/AdminLogin";
import DashboardOverview from "./pages/DashboardOverview";
import ManageCompanies from "./pages/ManageCompanies";
import ManageCandidates from "./pages/ManageCandidates";
import ManageMeetings from "./pages/ManageMeetings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DashboardOverview />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ManageCompanies />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidates"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ManageCandidates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ManageMeetings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
