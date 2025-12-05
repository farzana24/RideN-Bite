import { client } from '../../api/client';
import type { RestaurantData, PaginatedResponse, AccountStatus } from '../types';

export const restaurantApi = {
    // Get all restaurants with filters
    async getRestaurants(params: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
    } = {}): Promise<PaginatedResponse<RestaurantData>> {
        const response = await client.get('/admin/restaurants', { params });
        return response.data.data;
    },

    // Get single restaurant
    async getRestaurant(id: number): Promise<RestaurantData> {
        const response = await client.get(`/admin/restaurants/${id}`);
        return response.data.data;
    },

    // Approve or reject restaurant
    async approveRestaurant(
        id: number,
        approved: boolean,
        notes: string
    ): Promise<{ success: boolean; data: { id: number; status: AccountStatus } }> {
        const response = await client.put(`/admin/restaurants/${id}/approve`, {
            approved,
            notes,
        });
        return response.data;
    },

    // Suspend or unsuspend restaurant
    async suspendRestaurant(
        id: number,
        suspended: boolean
    ): Promise<{ success: boolean; data: { id: number; status: AccountStatus } }> {
        const response = await client.put(`/admin/restaurants/${id}/suspend`, {
            suspended,
        });
        return response.data;
    },
};
