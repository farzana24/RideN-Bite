import { Bell, ShoppingCart, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function CustomerTopbar() {
    const [cartCount] = useState(3);
    const [notificationCount] = useState(2);
    const [showProfile, setShowProfile] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search restaurants or dishes..."
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-800 dark:bg-slate-900"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Cart */}
                <button className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs text-white">
                            {cartCount}
                        </span>
                    )}
                </button>

                {/* Notifications */}
                <button className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                            {notificationCount}
                        </span>
                    )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white">
                            {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium">{user?.name || "User"}</span>
                        <ChevronDown className="h-4 w-4" />
                    </button>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                            <div className="p-2">
                                <button
                                    onClick={() => navigate("/customer/profile")}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    My Profile
                                </button>
                                <button
                                    onClick={() => navigate("/customer/settings")}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Settings
                                </button>
                                <hr className="my-2 border-slate-200 dark:border-slate-800" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
