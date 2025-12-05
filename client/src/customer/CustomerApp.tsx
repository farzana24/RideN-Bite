import { Routes, Route } from "react-router-dom";
import { CustomerLayout } from "./layout/CustomerLayout";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { CustomerProfile } from "./pages/CustomerProfile";
import { OrderHistory } from "./pages/OrderHistory";
import { ActiveOrder } from "./pages/ActiveOrder";
import { RestaurantList } from "./pages/RestaurantList";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { CartPage } from "./pages/CartPage";
import { Checkout } from "./pages/Checkout";
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
                <Route path="restaurants/:restaurantId" element={<RestaurantDetail />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="settings" element={<CustomerSettings />} />
            </Route>
        </Routes>
    );
}
