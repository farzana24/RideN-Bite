import type {
    KPIMetrics,
    OrderData,
    RestaurantData,
    UserData,
    RiderData,
    AnalyticsData,
    PaginatedResponse,
    FilterParams,
    AuditLog,
    AccountStatus,
} from "../types";

// Mock data generators
function generateMockOrders(count: number): OrderData[] {
    const statuses: OrderData["status"][] = [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "ASSIGNED",
        "PICKED_UP",
        "DELIVERED",
        "CANCELLED",
    ];

    const restaurants = [
        "Tasty Bites",
        "Spice House",
        "Pizza Palace",
        "Burger King",
        "Sushi World",
        "Cafe Express",
        "Biryani House",
        "Chicken Delight",
    ];

    const orders: OrderData[] = [];
    for (let i = 0; i < count; i++) {
        const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        orders.push({
            id: 1000 + i,
            userId: Math.floor(Math.random() * 100) + 1,
            userName: `User ${Math.floor(Math.random() * 100) + 1}`,
            restaurantId: Math.floor(Math.random() * 8) + 1,
            restaurantName: restaurants[Math.floor(Math.random() * restaurants.length)],
            riderId: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : null,
            riderName: Math.random() > 0.3 ? `Rider ${Math.floor(Math.random() * 20) + 1}` : null,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            totalCents: Math.floor(Math.random() * 200000) + 50000,
            currency: "BDT",
            createdAt: createdAt.toISOString(),
            updatedAt: new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000).toISOString(),
        });
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function generateMockRestaurants(count: number): RestaurantData[] {
    const restaurants: RestaurantData[] = [];
    const restaurantNames = [
        "Tasty Bites",
        "Spice House",
        "Pizza Palace",
        "Burger King",
        "Sushi World",
        "Cafe Express",
        "Biryani House",
        "Chicken Delight",
        "Noodle Bar",
        "Mediterranean Grill",
    ];
    const storefrontImages = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "https://images.unsplash.com/photo-1432139509613-5c4255815697",
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
    ];

    for (let i = 0; i < count; i++) {
        const statuses: AccountStatus[] = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
        const randomStatus = Math.random();
        const status: AccountStatus = randomStatus > 0.7 ? 'PENDING' : randomStatus > 0.1 ? 'ACTIVE' : randomStatus > 0.05 ? 'SUSPENDED' : 'REJECTED';
        
        restaurants.push({
            id: i + 1,
            ownerId: 100 + i,
            ownerName: `Owner ${i + 1}`,
            ownerEmail: `owner${i + 1}@example.com`,
            phone: `+8801${Math.floor(Math.random() * 900000000 + 100000000)}`,
            name: restaurantNames[i % restaurantNames.length],
            businessName: `${restaurantNames[i % restaurantNames.length]} Ltd`,
            description:
                "Family-owned kitchen bringing fresh flavors from locally sourced ingredients with guaranteed hygiene checks.",
            address: `${Math.floor(Math.random() * 999) + 1} Main St, Dhaka`,
            lat: 23.8 + Math.random() * 0.1,
            lng: 90.4 + Math.random() * 0.1,
            status,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            menuItemsCount: Math.floor(Math.random() * 50) + 10,
            ordersCount: Math.floor(Math.random() * 500),
            rating: 3.5 + Math.random() * 1.5,
            cuisines: ["Bengali", "Fusion", "Fast Food"].slice(0, Math.floor(Math.random() * 3) + 1),
            storefrontImage: storefrontImages[i % storefrontImages.length],
            documents: [
                {
                    id: `trade-${i}`,
                    name: "Trade License",
                    type: "License",
                    url: "https://example.com/docs/trade-license.pdf",
                    verified: Math.random() > 0.2,
                },
                {
                    id: `hygiene-${i}`,
                    name: "Food Safety Certificate",
                    type: "Certification",
                    url: "https://example.com/docs/hygiene-cert.pdf",
                    verified: Math.random() > 0.4,
                },
            ],
        });
    }
    return restaurants;
}

function generateMockUsers(count: number): UserData[] {
    const users: UserData[] = [];
    const roles: UserData["role"][] = ["CUSTOMER", "RESTAURANT", "RIDER", "ADMIN"];

    for (let i = 0; i < count; i++) {
        users.push({
            id: i + 1,
            email: `user${i + 1}@example.com`,
            name: `User ${i + 1}`,
            role: roles[Math.floor(Math.random() * roles.length)],
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            suspended: Math.random() > 0.9,
            ordersCount: Math.floor(Math.random() * 100),
        });
    }
    return users;
}

function generateMockRiders(count: number): RiderData[] {
    const riders: RiderData[] = [];
    const statuses: RiderData["status"][] = ["OFFLINE", "IDLE", "BUSY"];

    for (let i = 0; i < count; i++) {
        riders.push({
            id: i + 1,
            userId: 200 + i,
            userName: `Rider ${i + 1}`,
            userEmail: `rider${i + 1}@example.com`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            lat: 23.8 + Math.random() * 0.1,
            lng: 90.4 + Math.random() * 0.1,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        });
    }
    return riders;
}

// Store mock data
const mockOrders = generateMockOrders(100);
const mockRestaurants = generateMockRestaurants(15);
const mockUsers = generateMockUsers(200);
const mockRiders = generateMockRiders(25);

// Simulated API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
    // KPIs
    async getKPIs(): Promise<KPIMetrics> {
        await delay(300);
        const last24h = Date.now() - 24 * 60 * 60 * 1000;
        const ordersLast24h = mockOrders.filter(
            (o) => new Date(o.createdAt).getTime() > last24h
        );
        const revenueLast24h = ordersLast24h.reduce((sum, o) => sum + o.totalCents, 0);
        const activeDeliveries = mockOrders.filter(
            (o) => o.status === "ASSIGNED" || o.status === "PICKED_UP"
        ).length;

        return {
            totalOrders24h: ordersLast24h.length,
            totalOrdersChange: 12.5,
            revenue24h: revenueLast24h,
            revenueChange: 8.3,
            activeDeliveries,
            activeDeliveriesChange: -5.2,
            avgDeliveryTime: 28,
            avgDeliveryTimeChange: -3.1,
            pendingRestaurants: mockRestaurants.filter((r) => r.status === 'PENDING').length,
        };
    },

    // Orders
    async getOrders(params: FilterParams = {}): Promise<PaginatedResponse<OrderData>> {
        await delay(400);
        const { page = 1, limit = 10, status, search, from, to, restaurant, rider } = params;

        let filtered = [...mockOrders];

        if (status) {
            filtered = filtered.filter((o) => o.status === status);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (o) =>
                    o.userName.toLowerCase().includes(searchLower) ||
                    o.restaurantName.toLowerCase().includes(searchLower) ||
                    o.id.toString().includes(searchLower)
            );
        }
        if (from) {
            filtered = filtered.filter((o) => new Date(o.createdAt) >= new Date(from));
        }
        if (to) {
            filtered = filtered.filter((o) => new Date(o.createdAt) <= new Date(to));
        }
        if (restaurant) {
            filtered = filtered.filter((o) => o.restaurantId === restaurant);
        }
        if (rider) {
            filtered = filtered.filter((o) => o.riderId === rider);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
    },

    async getOrder(id: number): Promise<OrderData | null> {
        await delay(200);
        return mockOrders.find((o) => o.id === id) || null;
    },

    async updateOrderStatus(
        id: number,
        action: "reassign" | "cancel" | "refund",
        payload: any
    ): Promise<{ success: boolean }> {
        await delay(500);
        console.log(`Order ${id} action: ${action}`, payload);
        return { success: true };
    },

    // Restaurants
    async getRestaurants(params: FilterParams = {}): Promise<PaginatedResponse<RestaurantData>> {
        await delay(400);
        const { page = 1, limit = 10, status, search } = params;

        let filtered = [...mockRestaurants];

        if (status === "pending") {
            filtered = filtered.filter((r) => r.status === 'PENDING');
        } else if (status === "active") {
            filtered = filtered.filter((r) => r.status === 'ACTIVE');
        } else if (status === "suspended") {
            filtered = filtered.filter((r) => r.status === 'SUSPENDED');
        } else if (status === "rejected") {
            filtered = filtered.filter((r) => r.status === 'REJECTED');
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(searchLower) ||
                    r.ownerName.toLowerCase().includes(searchLower) ||
                    r.ownerEmail.toLowerCase().includes(searchLower)
            );
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
    },

    async getRestaurant(id: number): Promise<RestaurantData | null> {
        await delay(200);
        return mockRestaurants.find((r) => r.id === id) || null;
    },

    async approveRestaurant(
        id: number,
        approved: boolean,
        notes: string
    ): Promise<{ success: boolean }> {
        await delay(500);
        const restaurant = mockRestaurants.find((r) => r.id === id);
        if (restaurant) {
            restaurant.status = approved ? 'ACTIVE' : 'REJECTED';
        }
        console.log(`Restaurant ${id} approved: ${approved}, notes: ${notes}`);
        return { success: true };
    },

    async suspendRestaurant(id: number, suspended: boolean): Promise<{ success: boolean }> {
        await delay(500);
        const restaurant = mockRestaurants.find((r) => r.id === id);
        if (restaurant) {
            restaurant.status = suspended ? 'SUSPENDED' : 'ACTIVE';
        }
        return { success: true };
    },

    // Users
    async getUsers(params: FilterParams = {}): Promise<PaginatedResponse<UserData>> {
        await delay(400);
        const { page = 1, limit = 10, role, search } = params;

        let filtered = [...mockUsers];

        if (role) {
            filtered = filtered.filter((u) => u.role === role);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (u) =>
                    u.name.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower)
            );
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
    },

    async getUser(id: number): Promise<UserData | null> {
        await delay(200);
        return mockUsers.find((u) => u.id === id) || null;
    },

    async suspendUser(id: number, suspended: boolean): Promise<{ success: boolean }> {
        await delay(500);
        const user = mockUsers.find((u) => u.id === id);
        if (user) {
            user.suspended = suspended;
        }
        return { success: true };
    },

    // Riders
    async getRiders(params: FilterParams = {}): Promise<PaginatedResponse<RiderData>> {
        await delay(400);
        const { page = 1, limit = 10, status } = params;

        let filtered = [...mockRiders];

        if (status) {
            filtered = filtered.filter((r) => r.status === status);
        }

        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
    },

    async getRider(id: number): Promise<RiderData | null> {
        await delay(200);
        const rider = mockRiders.find((r) => r.id === id);
        if (rider && rider.status === "BUSY") {
            const activeOrders = mockOrders
                .filter((o) => o.riderId === rider.id && (o.status === "ASSIGNED" || o.status === "PICKED_UP"))
                .slice(0, 3);
            return { ...rider, activeDeliveries: activeOrders };
        }
        return rider || null;
    },

    // Analytics
    async getAnalytics(params: { metric?: string; period?: string } = {}): Promise<AnalyticsData> {
        await delay(500);
        const period = params.period || "30d";

        // Generate revenue data
        const revenues = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            amount: Math.floor(Math.random() * 500000) + 200000,
        }));

        // Generate delivery time data
        const deliveryTimes = Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            avgMinutes: Math.floor(Math.random() * 20) + 20,
        }));

        // Top dishes
        const topDishes = [
            { name: "Chicken Biryani", orders: 245, revenue: 367500 },
            { name: "Beef Burger", orders: 198, revenue: 297000 },
            { name: "Margherita Pizza", orders: 176, revenue: 352000 },
            { name: "Chicken Tikka", orders: 156, revenue: 234000 },
            { name: "Pad Thai", orders: 134, revenue: 201000 },
        ];

        // Order sources
        const orderSources = [
            { source: "Mobile App", count: 1234 },
            { source: "Website", count: 876 },
            { source: "Phone", count: 234 },
        ];

        return { period, revenues, deliveryTimes, topDishes, orderSources };
    },

    // Audit Logs
    async getAuditLogs(params: FilterParams = {}): Promise<PaginatedResponse<AuditLog>> {
        await delay(400);
        const { page = 1, limit = 20 } = params;

        const mockLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
            id: i + 1,
            userId: Math.floor(Math.random() * 10) + 1,
            userName: `Admin ${Math.floor(Math.random() * 10) + 1}`,
            action: ["APPROVED", "REJECTED", "SUSPENDED", "UPDATED"][Math.floor(Math.random() * 4)],
            entityType: ["RESTAURANT", "USER", "ORDER"][Math.floor(Math.random() * 3)],
            entityId: Math.floor(Math.random() * 100) + 1,
            details: "Action performed successfully",
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }));

        const total = mockLogs.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const data = mockLogs.slice(start, start + limit);

        return { data, total, page, limit, totalPages };
    },
};
