import { Outlet } from "react-router-dom";
import { RiderSidebar } from "./RiderSidebar";
import { RiderTopbar } from "./RiderTopbar";

export function RiderLayout() {
    return (
        <div className="flex h-screen bg-slate-50">
            <RiderSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <RiderTopbar />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
