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

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Shell><DashboardPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/crop-prediction"
          element={
            <ProtectedRoute>
              <Shell><CropPredictionPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fertilizer"
          element={
            <ProtectedRoute>
              <Shell><FertilizerPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Shell><ChatbotPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Shell><MarketplacePage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/govt-schemes"
          element={
            <ProtectedRoute>
              <Shell><GovernmentSchemesPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather-prediction"
          element={
            <ProtectedRoute>
              <Shell><WeatherPredictionPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Shell><AdminPage /></Shell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
