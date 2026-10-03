import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ReportLostModal from './components/ReportLostModal.jsx';
import ReportFoundModal from './components/ReportFoundModal.jsx';
import SubmitClaimModal from './components/SubmitClaimModal.jsx';

import DashboardPage from './pages/DashboardPage.jsx';
import LostFeedPage from './pages/LostFeedPage.jsx';
import FoundFeedPage from './pages/FoundFeedPage.jsx';
import MatchRadarPage from './pages/MatchRadarPage.jsx';
import ClaimsPage from './pages/ClaimsPage.jsx';
import AiHubPage from './pages/AiHubPage.jsx';

export default function App() {
  return (
    <>
      {/* Persistent Global Navbar */}
      <Navbar />

      {/* Main Dynamic View Shell */}
      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lost" element={<LostFeedPage />} />
          <Route path="/found" element={<FoundFeedPage />} />
          <Route path="/matches" element={<MatchRadarPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/ai-hub" element={<AiHubPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </main>

      {/* Global Modals & Toasts */}
      <ReportLostModal />
      <ReportFoundModal />
      <SubmitClaimModal />
      <ToastContainer />
    </>
  );
}
