import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

const routeMeta = {
  '/': {
    title: 'Farm Command Center',
    subtitle: 'Monitor weather, soil confidence, and AI recommendations from a single control plane.',
    badge: 'overview'
  },
  '/crop-prediction': {
    title: 'Crop Prediction Lab',
    subtitle: 'Estimate high-fit crops using climate and soil inputs with model explainability.',
    badge: 'ml'
  },
  '/fertilizer': {
    title: 'Fertilizer Intelligence',
    subtitle: 'Generate dosage plans with organic alternatives and nutrient balancing.',
    badge: 'nutrition'
  },
  '/chatbot': {
    title: 'Farmer AI Assistant',
    subtitle: 'Get crop, disease, and seasonal guidance with multilingual and voice support.',
    badge: 'assistant'
  },
  '/weather-prediction': {
    title: 'Weather Prediction System',
    subtitle: 'Region-based nowcast + 7-day forecast trends with farming risk indicators.',
    badge: 'forecast'
  },
  '/marketplace': {
    title: 'Agri Marketplace',
    subtitle: 'Explore complete agricultural product listings across seeds, inputs, equipment, and smart tools.',
    badge: 'commerce'
  },
  '/govt-schemes': {
    title: 'Government Schemes',
    subtitle: 'Find active agriculture schemes, eligibility criteria, benefits, and official application links.',
    badge: 'support'
  },
  '/admin': {
    title: 'Admin Control Tower',
    subtitle: 'Oversee farmers, logs, and model versions with centralized governance.',
    badge: 'admin'
  }
};

const Shell = ({ children }) => {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || {
    title: 'Smart Agri Hub',
    subtitle: 'AI-enabled agriculture platform.',
    badge: 'module'
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#0f766e22_0%,#0b1023_45%,#050816_100%)]">
      <div className="pointer-events-none absolute -left-20 -top-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-4 md:px-6">
        <Navbar />

        <section className="mb-5 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.23em] text-emerald-200/90">Module Context</p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">{meta.title}</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-200/90">{meta.subtitle}</p>
            </div>
            <span className="rounded-full border border-emerald-300/40 bg-emerald-300/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
              {meta.badge}
            </span>
          </div>
        </section>

        <main>{children}</main>
      </div>
    </div>
  );
};

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
              <Shell>
                <DashboardPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/crop-prediction"
          element={
            <ProtectedRoute>
              <Shell>
                <CropPredictionPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fertilizer"
          element={
            <ProtectedRoute>
              <Shell>
                <FertilizerPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Shell>
                <ChatbotPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Shell>
                <MarketplacePage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/govt-schemes"
          element={
            <ProtectedRoute>
              <Shell>
                <GovernmentSchemesPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/weather-prediction"
          element={
            <ProtectedRoute>
              <Shell>
                <WeatherPredictionPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Shell>
                <AdminPage />
              </Shell>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
