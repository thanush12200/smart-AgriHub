import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AdminPage from './pages/AdminPage';
import ChatbotPage from './pages/ChatbotPage';
import CropPredictionPage from './pages/CropPredictionPage';
import DashboardPage from './pages/DashboardPage';
import FertilizerPage from './pages/FertilizerPage';
import LoginPage from './pages/LoginPage';
import MarketplacePage from './pages/MarketplacePage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';
import WeatherPredictionPage from './pages/WeatherPredictionPage';
import GovernmentSchemesPage from './pages/GovernmentSchemesPage';

// Phase 1 Pages
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';

// Phase 2 Pages
import JournalPage from './pages/JournalPage';

import CropCalendarPage from './pages/CropCalendarPage';

// Phase 4
import SystemEvalPage from './pages/SystemEvalPage';

/* Clean shell — no more MODULE CONTEXT banner.
   Page headings belong *in* the page, not in a wrapper. */
const Shell = ({ children }) => (
  <div className="min-h-screen bg-surface-50">
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-3 md:px-6">
      <Navbar />
      <main className="mt-6">{children}</main>
    </div>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />} />

        <Route path="/" element={<ProtectedRoute><Shell><DashboardPage /></Shell></ProtectedRoute>} />
        <Route path="/crop-prediction" element={<ProtectedRoute><Shell><CropPredictionPage /></Shell></ProtectedRoute>} />
        <Route path="/fertilizer" element={<ProtectedRoute><Shell><FertilizerPage /></Shell></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><Shell><ChatbotPage /></Shell></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Shell><MarketplacePage /></Shell></ProtectedRoute>} />
        <Route path="/govt-schemes" element={<ProtectedRoute><Shell><GovernmentSchemesPage /></Shell></ProtectedRoute>} />
        <Route path="/weather-prediction" element={<ProtectedRoute><Shell><WeatherPredictionPage /></Shell></ProtectedRoute>} />

        {/* Phase 1 Routes */}
        <Route path="/profile" element={<ProtectedRoute><Shell><ProfilePage /></Shell></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Shell><OrdersPage /></Shell></ProtectedRoute>} />
        <Route path="/prediction-history" element={<ProtectedRoute><Shell><PredictionHistoryPage /></Shell></ProtectedRoute>} />

        {/* Phase 2 Routes */}
        <Route path="/journal" element={<ProtectedRoute><Shell><JournalPage /></Shell></ProtectedRoute>} />

        <Route path="/crop-calendar" element={<ProtectedRoute><Shell><CropCalendarPage /></Shell></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Shell><AdminPage /></Shell></ProtectedRoute>} />
        <Route path="/system-eval" element={<ProtectedRoute><Shell><SystemEvalPage /></Shell></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
