import { Outlet } from "react-router-dom";
import { CustomerSidebar } from "./CustomerSidebar";
import { CustomerTopbar } from "./CustomerTopbar";

export function CustomerLayout() {
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
            <CustomerSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <CustomerTopbar />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
