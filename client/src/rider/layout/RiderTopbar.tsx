import { useState } from "react";
import { Bell, MapPin, ChevronDown, Settings, LogOut } from "lucide-react";
import { Badge } from "../../admin/components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function RiderTopbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            {/* Left side - Location */}
            <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-slate-600">Current Location:</span>
                <span className="font-medium text-slate-900">Dhanmondi, Dhaka</span>
            </div>

            {/* Right side - Status & Notifications */}
            <div className="flex items-center gap-4">
                {/* Online Status Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Status:</span>
                    <Badge className="bg-green-500">Online</Badge>
                </div>

                {/* Notifications */}
                <button className="relative rounded-full p-2 hover:bg-slate-100">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        3
                    </span>
                </button>

                {/* Profile with Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                            {user?.name?.charAt(0) || "R"}
                        </div>
                        <div className="text-sm text-left">
                            <p className="font-medium text-slate-900">{user?.name || "Rider"}</p>
                            <p className="text-slate-500">Rider</p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setDropdownOpen(false)}
                            />
                            {/* Menu */}
                            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg z-20">
                                <button
                                    onClick={() => {
                                        setDropdownOpen(false);
                                        navigate("/rider/settings");
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
