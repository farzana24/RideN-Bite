export interface KPIMetrics {
    totalOrders24h: number;
    totalOrdersChange: number;
    revenue24h: number;
    revenueChange: number;
    activeDeliveries: number;
    activeDeliveriesChange: number;
    avgDeliveryTime: number;
    avgDeliveryTimeChange: number;
    pendingRestaurants: number;
}

export interface OrderData {
    id: number;
    userId: number;
    userName: string;
    restaurantId: number;
    restaurantName: string;
    riderId: number | null;
    riderName: string | null;
    status: OrderStatus;
    totalCents: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    priceCents: number;
}

export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "ASSIGNED"
    | "PICKED_UP"
    | "DELIVERED"
    | "CANCELLED";

export interface RestaurantData {
    id: number;
    ownerId: number;
    ownerName: string;
    ownerEmail: string;
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
    approved: boolean;
    suspended?: boolean;
    createdAt: string;
    updatedAt: string;
    menuItemsCount?: number;
    ordersCount?: number;
    rating?: number;
}

export interface UserData {
    id: number;
    email: string;
    name: string;
    role: "CUSTOMER" | "RESTAURANT" | "RIDER" | "ADMIN";
    createdAt: string;
    updatedAt: string;
    suspended?: boolean;
    ordersCount?: number;
}

export interface RiderData {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    status: "OFFLINE" | "IDLE" | "BUSY";
    lat: number | null;
    lng: number | null;
    createdAt: string;
    updatedAt: string;
    activeDeliveries?: OrderData[];
}

export interface AnalyticsData {
    period: string;
    revenues: { date: string; amount: number }[];
    deliveryTimes: { date: string; avgMinutes: number }[];
    topDishes: { name: string; orders: number; revenue: number }[];
    orderSources: { source: string; count: number }[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface FilterParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
    from?: string;
    to?: string;
    restaurant?: number;
    rider?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

export interface AuditLog {
    id: number;
    userId: number;
    userName: string;
    action: string;
    entityType: string;
    entityId: number;
    details: string;
    timestamp: string;
}
