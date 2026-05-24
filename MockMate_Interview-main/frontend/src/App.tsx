import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { InterviewPage } from './pages/InterviewPage';
import { WaitingPage } from './pages/WaitingPage';

function ProtectedRoute() {
  const { auth } = useAuth();
  return auth ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route path="/" element={auth ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/interview/:roomId" element={<InterviewPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Route>
    </Routes>
  );
}
