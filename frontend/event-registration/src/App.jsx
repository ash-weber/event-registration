import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RegistrationPage from './pages/RegistrationPage';
import SuccessPage from './pages/SuccessPage';
import QrPassPage from './pages/QrPassPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="/success/:registrationId" element={<SuccessPage />} />
        <Route path="/pass/:registrationId" element={<QrPassPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}