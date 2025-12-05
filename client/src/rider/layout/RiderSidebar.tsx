import { NavLink, useNavigate } from "react-router-dom";
import { Home, Package, History, DollarSign, User, Settings, LogOut, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { to: "/rider", label: "Dashboard", icon: Home, exact: true },
    { to: "/rider/deliveries", label: "Active Deliveries", icon: Package },
    { to: "/rider/history", label: "Delivery History", icon: History },
    { to: "/rider/earnings", label: "Earnings", icon: DollarSign },
    { to: "/rider/profile", label: "Profile", icon: User },
    { to: "/rider/settings", label: "Settings", icon: Settings },
];

export function RiderSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } bg-slate-900 text-white transition-all duration-300 flex flex-col`}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && <span className="text-xl font-bold text-green-500">RideN'Bite</span>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg p-2 hover:bg-slate-800 transition-colors"
                >
                    <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-green-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`
                            }
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="border-t border-slate-800 p-3">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-600 hover:text-white"
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
