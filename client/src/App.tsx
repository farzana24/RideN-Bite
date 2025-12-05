import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import { AdminApp } from './admin/AdminApp';
import { RestaurantApp } from './restaurant/RestaurantApp';
import { CustomerApp } from './customer/CustomerApp';
import { RiderApp } from './rider/RiderApp';
import { Registration } from './customer/pages/Registration';
import { RiderRegistration } from './rider/pages/RiderRegistration';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/register" element={<Registration />} />
      <Route path="/rider/register" element={<RiderRegistration />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Admin Routes - Requires ADMIN role */}
      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin/*" element={<AdminApp />} />
      </Route>

      {/* Restaurant Routes - Requires RESTAURANT role */}
      <Route element={<ProtectedRoute roles={['RESTAURANT']} />}>
        <Route path="/restaurant/*" element={<RestaurantApp />} />
      </Route>

      {/* Customer Routes - Requires CUSTOMER role */}
      <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
        <Route path="/customer/*" element={<CustomerApp />} />
      </Route>

      {/* Rider Routes - Requires RIDER role */}
      <Route element={<ProtectedRoute roles={['RIDER']} />}>
        <Route path="/rider/*" element={<RiderApp />} />
      </Route>

      {/* Root route - redirect based on user role */}
      <Route path="/" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default App;

