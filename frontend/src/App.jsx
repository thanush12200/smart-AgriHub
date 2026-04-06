import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Lazy-loaded pages for code splitting
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'));
const CropPredictionPage = lazy(() => import('./pages/CropPredictionPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FertilizerPage = lazy(() => import('./pages/FertilizerPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const WeatherPredictionPage = lazy(() => import('./pages/WeatherPredictionPage'));
const GovernmentSchemesPage = lazy(() => import('./pages/GovernmentSchemesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PredictionHistoryPage = lazy(() => import('./pages/PredictionHistoryPage'));
const JournalPage = lazy(() => import('./pages/JournalPage'));
const CropCalendarPage = lazy(() => import('./pages/CropCalendarPage'));
const SystemEvalPage = lazy(() => import('./pages/SystemEvalPage'));

const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="rounded-full border border-white/70 bg-white/70 p-4 shadow-shell backdrop-blur-xl">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-surface-200 border-t-brand-500" />
    </div>
  </div>
);

/* Clean shell — no more MODULE CONTEXT banner.
   Page headings belong *in* the page, not in a wrapper. */
const Shell = ({ children }) => (
  <div className="app-shell">
    <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-4 md:px-6 lg:px-8">
      <Navbar />
      <main className="mt-6">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </main>
    </div>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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

          <Route path="/profile" element={<ProtectedRoute><Shell><ProfilePage /></Shell></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Shell><OrdersPage /></Shell></ProtectedRoute>} />
          <Route path="/prediction-history" element={<ProtectedRoute><Shell><PredictionHistoryPage /></Shell></ProtectedRoute>} />

          <Route path="/journal" element={<ProtectedRoute><Shell><JournalPage /></Shell></ProtectedRoute>} />
          <Route path="/crop-calendar" element={<ProtectedRoute><Shell><CropCalendarPage /></Shell></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Shell><AdminPage /></Shell></ProtectedRoute>} />
          <Route path="/system-eval" element={<ProtectedRoute><Shell><SystemEvalPage /></Shell></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
