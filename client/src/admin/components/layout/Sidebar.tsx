import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Store,
    ShoppingCart,
    Users,
    Bike,
    BarChart3,
    Settings,
    Menu,
    X,
    ChevronRight,
    UserCheck,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import { getRiderStats } from "../../services/riderApi";

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const location = useLocation();

    useEffect(() => {
        // Fetch pending riders count
        const fetchPendingCount = async () => {
            try {
                const response = await getRiderStats();
                setPendingCount(response.data.pending);
            } catch (error) {
                console.error('Failed to fetch rider stats:', error);
            }
        };
        fetchPendingCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchPendingCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { to: "/admin/restaurants", icon: Store, label: "Restaurants" },
        { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
        { to: "/admin/users", icon: Users, label: "Users" },
        { 
            to: "/admin/riders", 
            icon: Bike, 
            label: "Riders",
            submenu: [
                { to: "/admin/riders", label: "All Riders", exact: true },
                { to: "/admin/riders/approvals", label: "Approvals", badge: pendingCount },
            ]
        },
        // { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        { to: "/admin/settings", icon: Settings, label: "Settings" },
    ];

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
                    <h1 className="text-xl font-bold">RideN'Bite Admin</h1>
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
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isActive = item.exact
                        ? location.pathname === item.to
                        : location.pathname.startsWith(item.to);
                    const [isExpanded, setIsExpanded] = useState(isActive);

                    if (hasSubmenu) {
                        return (
                            <div key={item.to}>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                                    )}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <ChevronRight 
                                                className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    isExpanded && "rotate-90"
                                                )} 
                                            />
                                        </>
                                    )}
                                </button>
                                {!collapsed && isExpanded && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {item.submenu.map((subItem: any) => {
                                            const isSubActive = subItem.exact
                                                ? location.pathname === subItem.to
                                                : location.pathname.startsWith(subItem.to);
                                            
                                            return (
                                                <NavLink
                                                    key={subItem.to}
                                                    to={subItem.to}
                                                    className={cn(
                                                        "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                                                        isSubActive
                                                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <span>{subItem.label}</span>
                                                    {subItem.badge && (
                                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
                                                            {subItem.badge}
                                                        </span>
                                                    )}
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
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
        </aside>
    );
}
