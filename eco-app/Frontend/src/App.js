import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import TrekList from './pages/TrekList';
import TrekDetails from './pages/TrekDetails';
import ItineraryPlanner from './pages/ItineraryPlanner';
import BudgetTracker from './pages/BudgetTracker';
import GuideList from './pages/GuideList';
import GuideDetails from './pages/GuideDetails';
import UserProfile from './pages/UserProfile';
import Booking from './pages/Booking';
import './App.css';

// Redirect logged-in users away from login page
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? <Navigate to="/home" replace /> : children;
};

// Redirect guests to login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/treks" element={<ProtectedRoute><TrekList /></ProtectedRoute>} />
            <Route path="/trek/:id" element={<ProtectedRoute><TrekDetails /></ProtectedRoute>} />
            <Route path="/guides" element={<ProtectedRoute><GuideList /></ProtectedRoute>} />
            <Route path="/guides/:id" element={<ProtectedRoute><GuideDetails /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><ItineraryPlanner /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetTracker /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;