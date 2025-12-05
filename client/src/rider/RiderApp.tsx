import { Routes, Route } from "react-router-dom";
import { RiderLayout } from "./layout/RiderLayout";
import { RiderDashboard } from "./pages/RiderDashboard";
import { RiderProfile } from "./pages/RiderProfile";
import { ActiveDeliveries } from "./pages/ActiveDeliveries";
import { DeliveryHistory } from "./pages/DeliveryHistory";
import { Earnings } from "./pages/Earnings";
import { RiderSettings } from "./pages/RiderSettings";
import { CurrentDelivery } from "./pages/CurrentDelivery";

export function RiderApp() {
    return (
        <Routes>
            <Route path="/" element={<RiderLayout />}>
                <Route index element={<RiderDashboard />} />
                <Route path="deliveries" element={<ActiveDeliveries />} />
                <Route path="deliveries/:deliveryId" element={<CurrentDelivery />} />
                <Route path="history" element={<DeliveryHistory />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="profile" element={<RiderProfile />} />
                <Route path="settings" element={<RiderSettings />} />
            </Route>
        </Routes>
    );
}
