
import {HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Nav from "./pages/Nav";
import AdminDash from "./pages/AdminDash";
import DashBoard from "./pages/DashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerDashboard from "./customer/CustomerDashboard ";
import PartnerDashboard from "./partner/PartnerDashboard";
import RestaurantDashboard from "./restaurant/RestaurantDashboard";
import ProfileView from "./profile/ProfileView";
import ProfileEdit from "./profile/ProfileEdit";
// Signin Component

// App Component
export default function App() {


  return (
 <Router>
 <Nav/>
      <Routes>
        <Route
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={["customer"]}>
        <CustomerDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/partner-dashboard"
    element={
      <ProtectedRoute allowedRoles={["delivery_partner"]}>
        <PartnerDashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/restaurant-dashboard"
    element={
      <ProtectedRoute allowedRoles={["restaurant_owner"]}>
        <RestaurantDashboard />
      </ProtectedRoute>
    }
  />
        <Route path="/" element={<Home/> } /> 
        <Route path="/login" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/admin-dashboard" element={<AdminDash />} />
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
 </Router> 
  );
}
 



