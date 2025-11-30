import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Store,
    User,
    Settings,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { cn } from "../../admin/utils/helpers";
import { useAuth } from "../../context/AuthContext";

const navItems = [
    { to: "/customer", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/customer/orders", icon: ShoppingBag, label: "My Orders" },
    { to: "/customer/restaurants", icon: Store, label: "Restaurants" },
    { to: "/customer/profile", icon: User, label: "Profile" },
    { to: "/customer/settings", icon: Settings, label: "Settings" },
];

export function CustomerSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                {!collapsed && (
                    <h1 className="text-xl font-bold text-orange-600">RideN'Bite</h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                        ? location.pathname === item.to
                        : location.pathname.startsWith(item.to);

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="border-t border-slate-200 p-2 dark:border-slate-800">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        "text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                    )}
                    title={collapsed ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
