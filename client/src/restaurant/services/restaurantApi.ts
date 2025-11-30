import { client } from "../../api/client";
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

const base = "/restaurant";

export const restaurantApi = {
    getMe: async () => {
        const { data } = await client.get<RestaurantProfile>(`${base}/me`);
        return data;
    },
    getStats: async () => {
        const { data } = await client.get<DashboardStats>(`${base}/stats`);
        return data;
    },
    getMenu: async () => {
        const { data } = await client.get<MenuItem[]>(`${base}/menu`);
        return data;
    },
    createMenuItem: async (payload: MenuFormValues) => {
        const { data } = await client.post<MenuItem>(`${base}/menu`, payload);
        return data;
    },
    updateMenuItem: async (id: string, payload: Partial<MenuFormValues>) => {
        const { data } = await client.patch<MenuItem>(`${base}/menu/${id}`, payload);
        return data;
    },
    deleteMenuItems: async (ids: string[]) => {
        await client.delete(`${base}/menu`, { data: { ids } });
        return ids;
    },
    getOrders: async () => {
        const { data } = await client.get<RestaurantOrder[]>(`${base}/orders`);
        return data;
    },
    updateOrderStatus: async (id: string, status: RestaurantOrder["status"]) => {
        const { data } = await client.patch<RestaurantOrder>(`${base}/orders/${id}`, { status });
        return data;
    },
    getEarnings: async () => {
        const { data } = await client.get<{
            summary: EarningsSummary;
            rows: EarningsRow[];
        }>(`${base}/earnings`);
        return data;
    },
    requestPayout: async (payload: PayoutRequestValues) => {
        await client.post(`${base}/payout`, payload);
    },
    updateProfile: async (payload: ProfileFormValues) => {
        const { data } = await client.patch<RestaurantProfile>(`${base}/profile`, payload);
        return data;
    },
    getAnalytics: async () => {
        const { data } = await client.get<AnalyticsSnapshot>(`${base}/analytics`);
        return data;
    },
    getAlerts: async () => {
        const { data } = await client.get<AlertPayload[]>(`${base}/alerts`);
        return data;
    },
    getGeneralSettings: async () => {
        const { data } = await client.get<GeneralSettingsValues>(`${base}/settings/general`);
        return data;
    },
    updateGeneralSettings: async (payload: GeneralSettingsValues) => {
        await client.patch(`${base}/settings/general`, payload);
    },
};
