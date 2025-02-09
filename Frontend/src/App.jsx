import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './Components/Layout';
import Home from './Pages/Home';
import PublicEvent from './Pages/PublicEvent';
import About from './Pages/About';
import Contact from './Pages/Contact';
import LoginSignup from './Pages/LoginSignup';
import Userprofile from './Pages/Userprofile';
import Usersettings from './Pages/UserSettings';
import PrivateRoute from './Components/PrivateRoute';
import Dashboard from './Components/Dashboard';
import { organizerDashboardConfig, adminDashboardConfig, userDashboardConfig } from './config/dashboardConfig';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/event" element={<PublicEvent />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loginsignup" element={<LoginSignup />} />
          <Route path="/profile" element={<Userprofile />} />
          <Route path="/settings" element={<Usersettings />} />

          {/* Protected Routes */}
<Route 
  path="/admindb/*" 
  element={
    <PrivateRoute 
      element={Dashboard}
      requiredRole="Admin"
      config={adminDashboardConfig}
    />
  }
/>
<Route 
  path="/orgdb/*" 
  element={
    <PrivateRoute 
      element={Dashboard}
      requiredRole="Organizer"
      config={organizerDashboardConfig}
    />
  }
/>
<Route 
  path="/userdb/*" 
  element={
    <PrivateRoute 
      element={Dashboard}
      requiredRole="User"
      config={userDashboardConfig}
    />
  }
/>

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;