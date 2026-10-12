import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { BookServicePage } from './pages/BookServicePage';
import { PlanProjectPage } from './pages/PlanProjectPage';
import { ProfessionalsPage } from './pages/ProfessionalsPage';
import { ComparePage } from './pages/ComparePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#F5F9FF] text-[#101D3A]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/book-service" element={<BookServicePage />} />
              <Route path="/plan-project" element={<PlanProjectPage />} />
              <Route path="/professionals" element={<ProfessionalsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
