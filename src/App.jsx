import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import CrmLayout from './layouts/CrmLayout';
import ReceptionLayout from './layouts/ReceptionLayout';
import Login from './pages/auth/Login';
import ControlRoom from './pages/admin/ControlRoom';
import Reception from './pages/admin/Reception';
import Workspace from './pages/agent/Workspace';

import ManageAgents from './pages/admin/ManageAgents';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageLeads from './pages/admin/ManageLeads';
import ManagePatients from './pages/admin/ManagePatients';
import CallLogs from './pages/admin/CallLogs';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import WhatsappDashboard from './pages/admin/WhatsappDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        
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
            <Route path="attendance" element={<AttendanceLogs />} />
            <Route path="whatsapp" element={<WhatsappDashboard />} />
          </Route>
        </Route>

        {/* CRM Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/crm" element={<CrmLayout />}>
            <Route index element={<Navigate to="leads" replace />} />
            <Route path="leads" element={<ManageLeads />} />
            <Route path="accounts" element={<div className="p-8 text-center text-zinc-500 font-bold">Accounts Module Coming Soon</div>} />
          </Route>
        </Route>

        {/* Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'AGENT']} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<Workspace />} />
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
