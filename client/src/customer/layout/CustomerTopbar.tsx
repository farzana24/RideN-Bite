import { Bell, ShoppingCart, User, ChevronDown, X, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCartStore } from "../store/cartStore";
import { useNotificationStore, getStatusColor } from "../store/notificationStore";
import { Badge } from "../../admin/components/ui/badge";

export function CustomerTopbar() {
    const [showCart, setShowCart] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const cartRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Cart store
    const {
        items: cartItems,
        totalItems,
        total,
        updateQuantity,
        removeItem,
        getItemsByRestaurant,
    } = useCartStore();

    const itemsByRestaurant = getItemsByRestaurant();

    // Notification store
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        connectSocket,
        disconnectSocket,
    } = useNotificationStore();

    // Get auth token for socket connection
    const token = localStorage.getItem("token");

    // Connect to WebSocket for real-time notifications
    useEffect(() => {
        if (token) {
            connectSocket(token);
        }
        return () => disconnectSocket();
    }, [token, connectSocket, disconnectSocket]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setShowCart(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
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
                {/* Cart Dropdown */}
                <div className="relative" ref={cartRef}>
                    <button
                        onClick={() => {
                            setShowCart(!showCart);
                            setShowNotifications(false);
                            setShowProfile(false);
                        }}
                        className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {totalItems() > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs text-white">
                                {totalItems()}
                            </span>
                        )}
                    </button>

                    {showCart && (
                        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50">
                            <div className="flex items-center justify-between border-b border-slate-200 p-3">
                                <h3 className="font-semibold">Your Cart</h3>
                                <button onClick={() => setShowCart(false)}>
                                    <X className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="p-6 text-center">
                                    <ShoppingCart className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">Your cart is empty</p>
                                </div>
                            ) : (
                                <>
                                    <div className="max-h-64 overflow-y-auto">
                                        {Array.from(itemsByRestaurant.entries()).map(([restaurantId, { restaurant, items }]) => (
                                            <div key={restaurantId}>
                                                <div className="px-3 py-2 bg-slate-50 text-xs font-medium text-slate-700 dark:bg-slate-900 border-b border-slate-100">
                                                    {restaurant.name}
                                                    <span className="text-slate-400 ml-1">• ৳{restaurant.deliveryFee} delivery</span>
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 p-3">
                                                            {item.image && (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                                <p className="text-xs text-slate-500">৳{item.price} × {item.quantity}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="h-6 w-6 rounded border border-slate-200 text-xs hover:bg-slate-100"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="h-6 w-6 rounded border border-slate-200 text-xs hover:bg-slate-100"
                                                                >
                                                                    +
                                                                </button>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="ml-1 p-1 text-red-500 hover:bg-red-50 rounded"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t border-slate-200 p-3 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Total</span>
                                            <span className="font-bold text-orange-600">৳{total()}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowCart(false);
                                                navigate("/customer/cart");
                                            }}
                                            className="w-full rounded-md bg-orange-600 py-2 text-sm font-medium text-white hover:bg-orange-700"
                                        >
                                            Go to Cart
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowCart(false);
                            setShowProfile(false);
                        }}
                        className="relative rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount() > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                                {unreadCount()}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950 z-50">
                            <div className="flex items-center justify-between border-b border-slate-200 p-3">
                                <h3 className="font-semibold">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount() > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-orange-600 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)}>
                                        <X className="h-4 w-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-6 text-center">
                                    <Bell className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">No notifications</p>
                                </div>
                            ) : (
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => {
                                                markAsRead(notification.id);
                                                navigate(`/customer/orders/${notification.orderId}`);
                                                setShowNotifications(false);
                                            }}
                                            className={`p-3 cursor-pointer hover:bg-slate-50 ${
                                                !notification.isRead ? "bg-orange-50" : ""
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">
                                                        {notification.restaurantName}
                                                    </p>
                                                    <p className="text-sm text-slate-600 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={`text-xs ${getStatusColor(notification.status)}`}>
                                                            {notification.status.replace(/_/g, " ")}
                                                        </Badge>
                                                        <span className="text-xs text-slate-400">
                                                            {formatTime(notification.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 rounded-full bg-orange-600 flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => {
                            setShowProfile(!showProfile);
                            setShowCart(false);
                            setShowNotifications(false);
                        }}
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
