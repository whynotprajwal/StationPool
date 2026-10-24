import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import MetroTicketPoolLandingPage from "./pages/MetroTicketPoolLandingPage";
import MetroMatchingPage from "./pages/MetroMatchingPage";
import MetroMatchConfirmedPage from "./pages/MetroMatchConfirmedPage";
import PassengerActiveRidePage from "./pages/PassengerActiveRidePage";
import DriverActiveRidePage from "./pages/DriverActiveRidePage";
import VerifyPassengerPINPage from "./pages/VerifyPassengerPINPage";
import RideCompletedPage from "./pages/RideCompletedPage";
import DriverRegistrationPage from "./pages/DriverRegistrationPage";
import PublishJourneyPage from "./pages/PublishJourneyPage";
import ActivitySafetyCenterPage from "./pages/ActivitySafetyCenterPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes — Entry and Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />

          {/* Protected Routes — Strictly require Sign Up / Sign In & OTP Verification */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <MetroTicketPoolLandingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match"
            element={
              <ProtectedRoute>
                <MetroMatchingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/match/:journeyId"
            element={
              <ProtectedRoute>
                <MetroMatchConfirmedPage />
              </ProtectedRoute>
            }
          />

          {/* Active Rides & Security PIN Verification */}
          <Route
            path="/ride/passenger/:tripId"
            element={
              <ProtectedRoute>
                <PassengerActiveRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride/driver/:tripId"
            element={
              <ProtectedRoute>
                <DriverActiveRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ride/verify-pin/:tripId"
            element={
              <ProtectedRoute>
                <VerifyPassengerPINPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:tripId/complete"
            element={
              <ProtectedRoute>
                <RideCompletedPage />
              </ProtectedRoute>
            }
          />

          {/* Driver Registration & Feeder Publishing */}
          <Route
            path="/driver/register"
            element={
              <ProtectedRoute>
                <DriverRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/publish"
            element={
              <ProtectedRoute>
                <PublishJourneyPage />
              </ProtectedRoute>
            }
          />

          {/* Safety Center & Commuter Activity */}
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivitySafetyCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
