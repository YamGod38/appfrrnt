import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import ReceptionLayout from './layouts/ReceptionLayout';
import Login from './pages/auth/Login';
import ControlRoom from './pages/admin/ControlRoom';
import Reception from './pages/admin/Reception';
import Workspace from './pages/agent/Workspace';
import Feedback from './pages/Feedback';

import ManageAgents from './pages/admin/ManageAgents';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageLeads from './pages/admin/ManageLeads';
import ManagePatients from './pages/admin/ManagePatients';
import CallLogs from './pages/admin/CallLogs';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import WhatsappDashboard from './pages/admin/WhatsappDashboard';
import BookingLogs from './pages/admin/BookingLogs';
import AdminKnowledge from './pages/admin/AdminKnowledge';
import ServiceChart from './pages/admin/ServiceChart';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/feedback/:id" element={<Feedback />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<ControlRoom />} />
            <Route path="reception" element={<Reception />} />
            <Route path="agents" element={<ManageAgents />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="leads" element={<ManageLeads />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="logs" element={<CallLogs />} />
            <Route path="bookings" element={<BookingLogs />} />
            <Route path="attendance" element={<AttendanceLogs />} />
            <Route path="whatsapp" element={<WhatsappDashboard />} />
            <Route path="knowledge" element={<AdminKnowledge />} />
            <Route path="services" element={<ServiceChart />} />
          </Route>
        </Route>


        {/* Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'AGENT']} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<Workspace />} />
            <Route path="services" element={<ServiceChart />} />
          </Route>
        </Route>

        {/* Reception Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RECEPTION']} />}>
          <Route path="/reception" element={<ReceptionLayout />}>
            <Route index element={<Reception />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
