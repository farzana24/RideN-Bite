import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { restaurantNav, navFooter } from "../constants/navigation";
import { Button } from "../../admin/components/ui/button";
import { cn } from "../../admin/utils/helpers";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
    const location = useLocation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const closeOnMobile = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <aside
            className={cn(
                "fixed inset-y-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white p-6 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
                isCollapsed ? "lg:w-16 lg:px-3" : "lg:w-64",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
        >
            <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800">
                <div
                    className={cn(
                        "flex flex-1 items-center",
                        isCollapsed ? "justify-center gap-2" : "justify-between gap-3"
                    )}
                >
                    <Link to="/restaurant" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-base font-semibold text-amber-600">
                            RB
                        </div>
                        {!isCollapsed && (
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-[0.4em] text-amber-500">RideN'Bite</p>
                                <p className="text-xl mb-4 pb-4 font-semibold text-slate-900 dark:text-white">Kitchen Console</p>
                            </div>
                        )}
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden lg:inline-flex"
                        onClick={onToggleCollapse}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
                {restaurantNav.map((item) => {
                    const currentPath = location.pathname.replace(/\/$/, "") || "/";
                    const targetPath = item.href.replace(/\/$/, "");
                    const isDashboard = targetPath === "/restaurant";
                    const active = isDashboard
                        ? currentPath === targetPath
                        : currentPath.startsWith(targetPath);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                                isCollapsed ? "justify-center" : "px-3",
                                active
                                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                            )}
                            onClick={closeOnMobile}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
                            {!isCollapsed && item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-6 space-y-2 border-t border-slate-200 pt-6 dark:border-slate-800">
                {navFooter.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            className={cn(
                                "flex w-full items-center rounded-md py-2 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300",
                                isCollapsed ? "justify-center" : "px-3"
                            )}
                            onClick={() => {
                                handleLogout();
                                closeOnMobile();
                            }}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
                            {!isCollapsed && item.label}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
