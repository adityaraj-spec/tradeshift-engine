import { ThemeProvider } from './context/ThemeContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { ChatBot } from './components/ChatBot/ChatBot';

import Layout from './components/layout/layout';
import Home from './pages/Home';
import Home1 from './pages/Home1';
import ResearchHub from './pages/ResearchHub';
import ScreenerPage from './pages/ScreenerPage';
import MarketPage from './pages/MarketPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import PortfolioPage_old from './pages/PortfolioPage'; // Renamed to avoid clash
import LearnPage from './pages/LearnPage';
import NewsPage from './pages/NewsPage';

import { AuthPage } from './components/auth/AuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ProfilePage } from './pages/ProfilePage';

import { useChartPersistence } from './hooks/useChartPersistence';

function ChartPersistenceManager() {
  useChartPersistence();
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ChartPersistenceManager />
      <GameProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            {/* Redirect root to Profile (Auth protected) */}
            <Route path="/" element={<Navigate to="/profile" replace />} />

            {/* Public Auth Routes */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected App Routes */}
            <Route 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="trade" element={<Home />} />
              <Route path="home1" element={<Home1 />} />
              <Route path="markets" element={<MarketPage />} />
              <Route path="screener" element={<ScreenerPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="portfolio-old" element={<PortfolioPage_old />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="research/:symbol" element={<ResearchHub />} />
            </Route>
          </Routes>
          <Toaster />
          <ChatBot />
        </ThemeProvider>
      </GameProvider>
    </AuthProvider>
  );
}