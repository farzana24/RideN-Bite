import { LayoutDashboard, ChefHat, ClipboardList, Wallet, Building2, LineChart, Settings, LogOut } from "lucide-react";

export const restaurantNav = [
    { label: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
    { label: "Menu Management", href: "/restaurant/menu", icon: ChefHat },
    { label: "Orders", href: "/restaurant/orders", icon: ClipboardList },
    { label: "Earnings", href: "/restaurant/earnings", icon: Wallet },
    // { label: "Analytics", href: "/restaurant/analytics", icon: LineChart },
    { label: "Restaurant Profile", href: "/restaurant/profile", icon: Building2 },
    { label: "Settings", href: "/restaurant/settings", icon: Settings },
];

export const navFooter = [{ label: "Logout", href: "/logout", icon: LogOut }];
