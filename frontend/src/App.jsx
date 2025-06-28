// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Dashboards
import AdminDashboard from "./pages/Dashboards/AdminDashboard";
import DoctorDashboard from "./pages/Dashboards/DoctorDashboard";
import CustomerDashboard from "./pages/Dashboards/CustomerDashboard";

// Extra Pages (optional)
// e.g., Find Doctors

const App = () => {
  return (
    <BrowserRouter>
    
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};


export default App;

