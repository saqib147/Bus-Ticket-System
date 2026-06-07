import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LandingPage from '@/pages/LandingPage';
import SearchResultsPage from '@/pages/SearchResultsPage';
import BusDetailPage from '@/pages/BusDetailPage';
import SeatSelectionPage from '@/pages/SeatSelectionPage';
import CheckoutPage from '@/pages/CheckoutPage';
import BookingSuccessPage from '@/pages/BookingSuccessPage';
import PassengerDashboard from '@/pages/PassengerDashboard';
import BookingHistoryPage from '@/pages/BookingHistoryPage';
import ProfilePage from '@/pages/ProfilePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/bus/:id" element={<BusDetailPage />} />
          <Route path="/schedule/:id/seats" element={<SeatSelectionPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />
          <Route path="/dashboard" element={<PassengerDashboard />} />
          <Route path="/dashboard/bookings" element={<BookingHistoryPage />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
