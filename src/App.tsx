import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import SubscriptionsPage from './pages/SubscriptionsPage';
import MessagesPage from './pages/MessagesPage';
import PaymentsPage from './pages/PaymentsPage';
import PlansPage from './pages/PlansPage';
import DeviceSlotPlansPage from './pages/DeviceSlotPlansPage';
import SettingsPage from './pages/SettingsPage';
import BotPagesPage from './pages/BotPagesPage';
import MarzbanPage from './pages/MarzbanPage';
import ClientsPage from './pages/ClientsPage';
import AppLayout from './app/AppLayout';
import NotFoundPage from './app/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Miniapp — single route, tabs inside */}
        <Route path="/app/:token" element={<AppLayout />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Admin panel */}
        <Route path="/admin/*" element={
          <AuthProvider>
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="subscriptions" replace />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="device-slots" element={<DeviceSlotPlansPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="bot-pages" element={<BotPagesPage />} />
                <Route path="marzban" element={<MarzbanPage />} />
                <Route path="clients" element={<ClientsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AuthProvider>
        } />

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
