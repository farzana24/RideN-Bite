import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { RestaurantsManagement } from "./pages/RestaurantsManagement";
import { OrdersManagement } from "./pages/OrdersManagement";
import { UsersManagement } from "./pages/UsersManagement";
import { RidersTracking } from "./pages/RidersTracking";
import { RiderApprovals } from "./pages/RiderApprovals";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

export function AdminApp() {
    return (
        <AdminLayout>
            <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="/restaurants" element={<RestaurantsManagement />} />
                <Route path="/orders" element={<OrdersManagement />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/riders" element={<RidersTracking />} />
                <Route path="/riders/approvals" element={<RiderApprovals />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </AdminLayout>
    );
}
