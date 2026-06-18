import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import Login from './pages/auth/Login';
import ControlRoom from './pages/admin/ControlRoom';
import Workspace from './pages/agent/Workspace';

import ManageAgents from './pages/admin/ManageAgents';
import ManageDoctors from './pages/admin/ManageDoctors';
import CallLogs from './pages/admin/CallLogs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ControlRoom />} />
          <Route path="agents" element={<ManageAgents />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="logs" element={<CallLogs />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<Workspace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
