import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import FlightLoadingPage from "./pages/FlightLoadingPage";
import ItineraryResult from "./pages/ItineraryResult";
import MyTrips from "./pages/MyTrips";
import SharedTrip from "./pages/SharedTrip";
import FloatingLines from "./components/FloatingLines";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { restoreSession } from "./utils/apiClient";
import { isUserLoggedIn } from "./utils/auth";

function ProtectedRoute({ children }) {
  return isUserLoggedIn() ? children : <Navigate to="/auth" replace />;
}

function PublicOnlyRoute({ children }) {
  return isUserLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}

function AppShell() {
  const location = useLocation();
  const { theme } = useTheme();
  const [sessionReady, setSessionReady] = useState(false);
  const hideBackground = location.pathname === "/flight-loading";
  const isLightTheme = theme === "light";
  const appBackground = isLightTheme ? "bg-sky-200" : "bg-[#020617]";
  const appBackgroundStyle = isLightTheme
    ? {
        background:
          "radial-gradient(circle at 18% 22%, rgba(186,230,253,0.85), transparent 42%), radial-gradient(circle at 80% 18%, rgba(147,197,253,0.7), transparent 44%), radial-gradient(circle at 70% 82%, rgba(125,211,252,0.65), transparent 46%), #cfefff",
      }
    : undefined;

  // Restore session from refresh token on app startup
  useEffect(() => {
    restoreSession().finally(() => setSessionReady(true));
  }, []);

  // Show nothing until session restoration completes (prevents flash of auth page)
  if (!sessionReady) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center ${appBackground}`} style={appBackgroundStyle}>
        <div className="w-8 h-8 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${appBackground}`}
      style={appBackgroundStyle}
    >
      {!hideBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines
            linesGradient={
              theme === "light"
                ? ["#1e3a8a", "#1d4ed8", "#1e40af", "#1e3a8a"]
                : ["#4f46e5", "#9333ea", "#2563eb", "#ffffff"]
            }
            lineCount={8}
            lineDistance={0.4}
            animationSpeed={0.6}
            interactive={true}
            parallax={true}
          />
        </div>
      )}

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* Guest-accessible routes — no ProtectedRoute */}
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/flight-loading" element={<FlightLoadingPage />} />
          <Route path="/itinerary-result" element={<ItineraryResult />} />
          <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/share/:shareToken" element={<SharedTrip />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}

export default App;
