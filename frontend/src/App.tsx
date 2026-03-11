import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { RequireAuth } from './components/RequireAuth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoomRedesign from './pages/RoomRedesign';
import MoodBoardGenerator from './pages/MoodBoardGenerator';
import MoodBoardEditor from './pages/MoodBoardEditor';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import SharedBoard from './pages/SharedBoard';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
      <ToastProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/shared/:token" element={<SharedBoard />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected App Routes */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/redesign" element={<RequireAuth><RoomRedesign /></RequireAuth>} />
          <Route path="/mood-boards" element={<RequireAuth><MoodBoardGenerator /></RequireAuth>} />
          <Route path="/generate/moodboard" element={<RequireAuth><MoodBoardGenerator /></RequireAuth>} />
          <Route path="/generate/redesign" element={<RequireAuth><RoomRedesign /></RequireAuth>} />
          <Route path="/editor/:id" element={<RequireAuth><MoodBoardEditor /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
