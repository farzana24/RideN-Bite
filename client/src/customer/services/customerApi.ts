import { client } from "../../api/client";

// ==================== TYPES ====================

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    rating?: number;
    totalReviews?: number;
    status?: string;
    storefrontImage?: string;
    cuisine?: string;
    description?: string;
    phone?: string;
    menuItems?: MenuItem[];
    isFavorite?: boolean;
}

export interface MenuItem {
    id: string;
    restaurantId: string;
    name: string;
    description?: string;
    priceCents: number;
    currency?: string;
    available: boolean;
    tags?: string[];
    category?: string;
    cookingTime?: number;
    spiceLevel?: string;
    rating?: number;
    image?: string;
    restaurant?: {
        id: string;
        name: string;
        address: string;
    };
}

export interface Order {
    id: string;
    userId: string;
    restaurantId: string;
    riderId?: string;
    status: OrderStatus;
    totalCents: number;
    deliveryAddress?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    deliveryFee: number;
    notes?: string;
    paymentStatus?: string;
    createdAt: string;
    updatedAt: string;
    restaurant?: {
        id: string;
        name: string;
        address: string;
        lat?: number;
        lng?: number;
        storefrontImage?: string;
        phone?: string;
    };
    items?: OrderItem[];
    rider?: {
        id: string;
        lat?: number;
        lng?: number;
        user: {
            name: string;
            phone?: string;
        };
    };
    payment?: Payment;
    review?: Review;
}

export interface OrderItem {
    id: string;
    orderId: string;
    menuItemId: string;
    name: string;
    quantity: number;
    priceCents: number;
    menuItem?: MenuItem;
}

export interface Payment {
    id: string;
    orderId: string;
    transactionId?: string;
    amountCents: number;
    status: string;
    createdAt: string;
}

export interface Address {
    id: string;
    userId: string;
    label: string;
    street: string;
    city: string;
    area?: string;
    lat?: number;
    lng?: number;
    isDefault: boolean;
    createdAt: string;
}

export interface Favorite {
    id: string;
    userId: string;
    restaurantId?: string;
    menuItemId?: string;
    createdAt: string;
    restaurant?: Restaurant;
}

export interface Review {
    id: string;
    userId: string;
    orderId: string;
    restaurantId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    user?: {
        id: string;
        name: string;
    };
}

export interface CustomerProfile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: string;
    addresses: Address[];
    _count: {
        orders: number;
        favorites: number;
        reviews: number;
    };
}

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "ASSIGNED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "CANCELLED";

// ==================== API SERVICE ====================

export const customerApi = {
    // Restaurants
    async getRestaurants(params?: {
        search?: string;
        cuisine?: string;
        page?: number;
        limit?: number;
        lat?: number;
        lng?: number;
    }): Promise<{ restaurants: Restaurant[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
        const response = await client.get("/customer/restaurants", { params });
        return response.data;
    },

    async getRestaurantById(id: string): Promise<Restaurant> {
        const response = await client.get(`/customer/restaurants/${id}`);
        return response.data;
    },

    async getPopularDishes(limit?: number): Promise<MenuItem[]> {
        const response = await client.get("/customer/dishes/popular", {
            params: { limit },
        });
        return response.data;
    },

    // Orders
    async createOrder(data: {
        restaurantId: string;
        items: Array<{
            menuItemId: string;
            quantity: number;
        }>;
        deliveryAddress: string;
        deliveryLat?: number;
        deliveryLng?: number;
        deliveryFee: number;
        notes?: string;
    }): Promise<Order> {
        const response = await client.post("/customer/orders", data);
        return response.data;
    },

    async getOrders(status?: OrderStatus): Promise<Order[]> {
        const response = await client.get("/customer/orders", {
            params: { status },
        });
        return response.data;
    },

    async getOrderById(id: string): Promise<Order> {
        const response = await client.get(`/customer/orders/${id}`);
        return response.data;
    },

    async getActiveOrder(): Promise<Order | null> {
        const response = await client.get("/customer/orders/active");
        return response.data;
    },

    async cancelOrder(id: string): Promise<Order> {
        const response = await client.post(`/customer/orders/${id}/cancel`);
        return response.data;
    },

    // Addresses
    async getAddresses(): Promise<Address[]> {
        const response = await client.get("/customer/addresses");
        return response.data;
    },

    async createAddress(data: {
        label: string;
        street: string;
        city: string;
        area?: string;
        lat?: number;
        lng?: number;
        isDefault?: boolean;
    }): Promise<Address> {
        const response = await client.post("/customer/addresses", data);
        return response.data;
    },

    async updateAddress(
        id: string,
        data: Partial<{
            label: string;
            street: string;
            city: string;
            area?: string;
            lat?: number;
            lng?: number;
            isDefault?: boolean;
        }>
    ): Promise<Address> {
        const response = await client.patch(`/customer/addresses/${id}`, data);
        return response.data;
    },

    async deleteAddress(id: string): Promise<void> {
        await client.delete(`/customer/addresses/${id}`);
    },

    // Favorites
    async getFavorites(): Promise<Favorite[]> {
        const response = await client.get("/customer/favorites");
        return response.data;
    },

    async addFavorite(data: { restaurantId?: string; menuItemId?: string }): Promise<Favorite> {
        const response = await client.post("/customer/favorites", data);
        return response.data;
    },

    async removeFavorite(id: string): Promise<void> {
        await client.delete(`/customer/favorites/${id}`);
    },

    // Reviews
    async submitReview(data: {
        orderId: string;
        restaurantId: string;
        rating: number;
        comment?: string;
    }): Promise<Review> {
        const response = await client.post("/customer/reviews", data);
        return response.data;
    },

    async getRestaurantReviews(
        restaurantId: string,
        page?: number,
        limit?: number
    ): Promise<{
        reviews: Review[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const response = await client.get(`/customer/restaurants/${restaurantId}/reviews`, {
            params: { page, limit },
        });
        return response.data;
    },

    // Profile
    async getProfile(): Promise<CustomerProfile> {
        const response = await client.get("/customer/profile");
        return response.data;
    },

    async updateProfile(data: { name?: string; phone?: string }): Promise<CustomerProfile> {
        const response = await client.patch("/customer/profile", data);
        return response.data;
    },

    async deleteAccount(): Promise<void> {
        await client.delete("/customer/account");
    },

    // Payment
    async initiatePayment(orderId: string): Promise<{
        success: boolean;
        paymentUrl?: string;
        sessionKey?: string;
        message?: string;
    }> {
        const response = await client.post("/payment/initiate", { orderId });
        return response.data;
    },
};

// ==================== HELPER FUNCTIONS ====================

export function formatPrice(priceCents: number): string {
    return `৳${(priceCents / 100).toFixed(0)}`;
}

export function getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        PREPARING: "Preparing",
        READY: "Ready for Pickup",
        ASSIGNED: "Rider Assigned",
        PICKED_UP: "Picked Up",
        IN_TRANSIT: "On the Way",
        DELIVERED: "Delivered",
        CANCELLED: "Cancelled",
    };
    return labels[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-blue-100 text-blue-800",
        PREPARING: "bg-orange-100 text-orange-800",
        READY: "bg-purple-100 text-purple-800",
        ASSIGNED: "bg-indigo-100 text-indigo-800",
        PICKED_UP: "bg-cyan-100 text-cyan-800",
        IN_TRANSIT: "bg-cyan-100 text-cyan-800",
        DELIVERED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
}
