import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

import Login from './pages/Login.jsx';
import DashboardLayout from './pages/DashboardLayout.jsx';
import { TeacherOverview, TeacherHeatmap, TeacherGroups } from './pages/Teacher.jsx';
import { AdminCoverage, AdminAudit } from './pages/Admin.jsx';
import { ParentDashboard } from './pages/Parent.jsx';
import { LearnerDashboard } from './pages/Learner.jsx';
import { GamePlayer } from './pages/GamePlayer.jsx';
import { CefrCatalogue } from './pages/Cefr.jsx';
import { CefrProgress } from './pages/CefrProgress.jsx';
import { CurriculumScope, CurriculumResources } from './pages/Curriculum.jsx';

function RequireRole({ roles, children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const home = { learner: '/learner', teacher: '/teacher', parent: '/parent', admin: '/admin' };
  return <Navigate to={home[user.role] || '/login'} replace />;
}

// Wraps the CEFR progress page in the learner shell with a back link.
function LearnerCefrWrapper() {
  return (
    <div className="learner-shell">
      <div className="main" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <a href="/learner" className="btn-ghost" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Back to games</a>
        <CefrProgress />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Learner — standalone kid-friendly shell */}
          <Route path="/learner" element={<RequireRole roles={['learner']}><LearnerDashboard /></RequireRole>} />
          <Route path="/learner/play/:activityId" element={<RequireRole roles={['learner']}><GamePlayer /></RequireRole>} />
          <Route path="/learner/cefr" element={<RequireRole roles={['learner']}><LearnerCefrWrapper /></RequireRole>} />

          {/* Teacher */}
          <Route path="/teacher" element={<RequireRole roles={['teacher']}><DashboardLayout /></RequireRole>}>
            <Route index element={<TeacherOverview />} />
            <Route path="heatmap" element={<TeacherHeatmap />} />
            <Route path="groups" element={<TeacherGroups />} />
            <Route path="cefr" element={<CefrCatalogue />} />
            <Route path="curriculum" element={<CurriculumResources />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<RequireRole roles={['admin']}><DashboardLayout /></RequireRole>}>
            <Route index element={<AdminCoverage />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="cefr" element={<CefrCatalogue />} />
            <Route path="curriculum" element={<CurriculumScope />} />
          </Route>

          {/* Parent */}
          <Route path="/parent" element={<RequireRole roles={['parent']}><DashboardLayout /></RequireRole>}>
            <Route index element={<ParentDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
