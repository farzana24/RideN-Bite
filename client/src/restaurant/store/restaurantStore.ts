import { create } from "zustand";
import { restaurantApi } from "../services/restaurantApi";
import type {
    AlertPayload,
    AnalyticsSnapshot,
    DashboardStats,
    EarningsRow,
    EarningsSummary,
    MenuItem,
    RestaurantOrder,
    RestaurantProfile,
} from "../types";
import type { GeneralSettingsValues, MenuFormValues, PayoutRequestValues, ProfileFormValues } from "../types/schemas";
import {
    fallbackAlerts,
    fallbackAnalytics,
    fallbackEarningsRows,
    fallbackEarningsSummary,
    fallbackMenu,
    fallbackOrders,
    fallbackProfile,
    fallbackStats,
    fallbackWeeklyEarnings,
    fallbackPopularDishes,
    fallbackOrderFrequency,
} from "../data/dummy";
import { toast } from "../../admin/components/ui/use-toast";

interface RestaurantState {
    loading: boolean;
    stats: DashboardStats;
    menu: MenuItem[];
    orders: RestaurantOrder[];
    profile: RestaurantProfile;
    earnings: EarningsSummary;
    earningsRows: EarningsRow[];
    analytics: AnalyticsSnapshot;
    alerts: AlertPayload[];
    weeklyEarnings: typeof fallbackWeeklyEarnings;
    popularDishes: typeof fallbackPopularDishes;
    orderFrequency: typeof fallbackOrderFrequency;
    fetchAll: () => Promise<void>;
    refreshOrders: () => Promise<void>;
    refreshMenu: () => Promise<void>;
    addMenuItem: (payload: MenuFormValues) => Promise<void>;
    updateMenuItem: (id: string, payload: Partial<MenuFormValues>) => Promise<void>;
    deleteMenuItems: (ids: string[]) => Promise<void>;
    updateOrderStatus: (id: string, status: RestaurantOrder["status"]) => Promise<void>;
    requestPayout: (payload: PayoutRequestValues) => Promise<void>;
    updateProfile: (payload: ProfileFormValues) => Promise<void>;
    updateGeneralSettings: (payload: GeneralSettingsValues) => Promise<void>;
    pushAlert: (payload: AlertPayload) => void;
}

const withErrorToast = async <T>(fn: () => Promise<T>, message: string) => {
    try {
        return await fn();
    } catch (error) {
        toast({
            title: "Action failed",
            description: message,
            variant: "destructive",
        });
        console.error(error);
    }
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
    loading: false,
    stats: fallbackStats,
    menu: fallbackMenu,
    orders: fallbackOrders,
    profile: fallbackProfile,
    earnings: fallbackEarningsSummary,
    earningsRows: fallbackEarningsRows,
    analytics: fallbackAnalytics,
    alerts: fallbackAlerts,
    weeklyEarnings: fallbackWeeklyEarnings,
    popularDishes: fallbackPopularDishes,
    orderFrequency: fallbackOrderFrequency,
    async fetchAll() {
        set({ loading: true });
        try {
            const [profile, stats, menu, orders, earningsRes, analytics, alerts] = await Promise.all([
                restaurantApi.getMe(),
                restaurantApi.getStats(),
                restaurantApi.getMenu(),
                restaurantApi.getOrders(),
                restaurantApi.getEarnings(),
                restaurantApi.getAnalytics(),
                restaurantApi.getAlerts(),
            ]);
            
            // Extract chart data from analytics if available
            const weeklyEarnings = analytics.monthlyOverview?.slice(0, 7).map((item, i) => ({
                week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] || item.label,
                earnings: item.value,
            })) || fallbackWeeklyEarnings;

            const popularDishes = analytics.salesByCategory?.slice(0, 4).map(item => ({
                name: item.label,
                orders: item.value,
            })) || fallbackPopularDishes;

            const orderFrequency = analytics.peakOrderingHours || fallbackOrderFrequency;

            set({
                profile,
                stats,
                menu,
                orders,
                earnings: earningsRes.summary,
                earningsRows: earningsRes.rows,
                analytics,
                alerts,
                weeklyEarnings,
                popularDishes,
                orderFrequency,
            });
        } catch (error) {
            console.error("Error fetching restaurant data:", error);
            if (error instanceof Error) {
                console.error("Error message:", error.message);
            }
            toast({
                title: "Failed to load data",
                description: "Using fallback data. Please check your connection and login status.",
                variant: "destructive",
            });
        } finally {
            set({ loading: false });
        }
    },
    async refreshOrders() {
        const orders = await withErrorToast(() => restaurantApi.getOrders(), "Unable to refresh orders");
        if (orders) set({ orders });
    },
    async refreshMenu() {
        const menu = await withErrorToast(() => restaurantApi.getMenu(), "Unable to refresh menu");
        if (menu) set({ menu });
    },
    async addMenuItem(payload) {
        const created = await withErrorToast(() => restaurantApi.createMenuItem(payload), "Could not create menu item");
        if (created) {
            set((state) => ({
                menu: [created, ...state.menu],
            }));
            toast({ title: "Dish added", description: `${payload.name} is live on RideN'Bite` });
        }
    },
    async updateMenuItem(id, payload) {
        const updated = await withErrorToast(
            () => restaurantApi.updateMenuItem(id, payload),
            "Could not update dish"
        );
        if (updated)
            set((state) => ({
                menu: state.menu.map((item) => (item.id === id ? updated : item)),
            }));
    },
    async deleteMenuItems(ids) {
        const removed = await withErrorToast(() => restaurantApi.deleteMenuItems(ids), "Unable to delete dishes");
        if (removed) {
            set((state) => ({
                menu: state.menu.filter((item) => !ids.includes(item.id)),
            }));
            toast({ title: "Menu updated", description: `${ids.length} dishes removed` });
        }
    },
    async updateOrderStatus(id, status) {
        const updated = await withErrorToast(
            () => restaurantApi.updateOrderStatus(id, status),
            "Failed to update order"
        );
        if (updated)
            set((state) => ({
                orders: state.orders.map((order) => (order.id === id ? updated : order)),
            }));
    },
    async requestPayout(payload) {
        try {
            await restaurantApi.requestPayout(payload);
            toast({ title: "Payout requested", description: `৳${payload.amount} will arrive within 24h` });
        } catch (error) {
            toast({ title: "Payout failed", description: "Please retry in a moment", variant: "destructive" });
            console.error(error);
        }
    },
    async updateProfile(payload) {
        const updated = await withErrorToast(
            () => restaurantApi.updateProfile(payload),
            "Profile update failed"
        );
        if (updated) set({ profile: updated });
    },
    async updateGeneralSettings(payload) {
        try {
            await restaurantApi.updateGeneralSettings(payload);
            toast({ title: "Settings saved", description: "Restaurant preferences updated" });
        } catch (error) {
            toast({ title: "Settings update failed", description: "Try again shortly", variant: "destructive" });
            console.error(error);
        }
    },
    pushAlert(payload) {
        set((state) => ({ alerts: [payload, ...state.alerts].slice(0, 5) }));
    },
}));
