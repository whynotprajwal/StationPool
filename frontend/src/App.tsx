import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";

const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const SignUpPage = React.lazy(() => import("./pages/SignUpPage"));
const OTPVerificationPage = React.lazy(() => import("./pages/OTPVerificationPage"));
const MetroTicketPoolLandingPage = React.lazy(() => import("./pages/MetroTicketPoolLandingPage"));
const MetroMatchingPage = React.lazy(() => import("./pages/MetroMatchingPage"));
const MetroMatchConfirmedPage = React.lazy(() => import("./pages/MetroMatchConfirmedPage"));
const PassengerActiveRidePage = React.lazy(() => import("./pages/PassengerActiveRidePage"));
const DriverActiveRidePage = React.lazy(() => import("./pages/DriverActiveRidePage"));
const VerifyPassengerPINPage = React.lazy(() => import("./pages/VerifyPassengerPINPage"));
const RideCompletedPage = React.lazy(() => import("./pages/RideCompletedPage"));
const DriverRegistrationPage = React.lazy(() => import("./pages/DriverRegistrationPage"));
const PublishJourneyPage = React.lazy(() => import("./pages/PublishJourneyPage"));
const DriverDashboardPage = React.lazy(() => import("./pages/DriverDashboardPage"));
const ActivitySafetyCenterPage = React.lazy(() => import("./pages/ActivitySafetyCenterPage"));

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public — entry and authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-otp" element={<OTPVerificationPage />} />

            {/* Passenger flow */}
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

            {/* Driver flow */}
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
            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute>
                  <DriverDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Safety & activity */}
            <Route
              path="/activity"
              element={
                <ProtectedRoute>
                  <ActivitySafetyCenterPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
