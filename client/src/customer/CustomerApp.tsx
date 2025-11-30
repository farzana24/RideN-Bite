import { Routes, Route } from "react-router-dom";
import { CustomerLayout } from "./layout/CustomerLayout";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { CustomerProfile } from "./pages/CustomerProfile";
import { OrderHistory } from "./pages/OrderHistory";
import { ActiveOrder } from "./pages/ActiveOrder";
import { RestaurantList } from "./pages/RestaurantList";
import { CustomerSettings } from "./pages/CustomerSettings";

export function CustomerApp() {
    return (
        <Routes>
            <Route path="/" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="profile" element={<CustomerProfile />} />
                <Route path="orders" element={<OrderHistory />} />
                <Route path="orders/:orderId" element={<ActiveOrder />} />
                <Route path="restaurants" element={<RestaurantList />} />
                <Route path="settings" element={<CustomerSettings />} />
            </Route>
        </Routes>
    );
}
