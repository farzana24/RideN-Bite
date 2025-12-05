import { create } from "zustand";
import { socketService } from "../../services/socket";

export type OrderStatusType =
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "ASSIGNED"
    | "PICKED_UP"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

export interface OrderNotification {
    id: string;
    orderId: string;
    restaurantName: string;
    status: OrderStatusType;
    message: string;
    timestamp: Date;
    isRead: boolean;
}

interface NotificationState {
    notifications: OrderNotification[];
    isConnected: boolean;

    // Actions
    addNotification: (notification: OrderNotification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    connectSocket: (token: string) => void;
    disconnectSocket: () => void;

    // Computed
    unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    isConnected: false,

    addNotification: (notification: OrderNotification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
        }));
    },

    markAsRead: (id: string) => {
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, isRead: true } : n
            ),
        }));
        // Acknowledge to server
        socketService.emit("notification:ack", id);
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
            })),
        }));
    },

    clearNotifications: () => {
        set({ notifications: [] });
    },

    connectSocket: (token: string) => {
        // Connect to socket server
        socketService.connect(token);

        // Listen for order status updates
        socketService.on("order:statusUpdate", (data: any) => {
            const notification: OrderNotification = {
                id: data.id,
                orderId: data.orderId,
                restaurantName: data.restaurantName,
                status: data.status as OrderStatusType,
                message: data.message,
                timestamp: new Date(data.timestamp),
                isRead: false,
            };
            get().addNotification(notification);
        });

        // Track connection status
        socketService.on("connect", () => {
            set({ isConnected: true });
            console.log("Notification socket connected");
        });

        socketService.on("disconnect", () => {
            set({ isConnected: false });
            console.log("Notification socket disconnected");
        });

        set({ isConnected: true });
    },

    disconnectSocket: () => {
        socketService.off("order:statusUpdate");
        socketService.disconnect();
        set({ isConnected: false });
    },

    unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
    },
}));

export function getStatusMessage(status: OrderStatusType): string {
    switch (status) {
        case "PENDING":
            return "Your order has been placed";
        case "CONFIRMED":
            return "Restaurant confirmed your order";
        case "PREPARING":
            return "Your order is being prepared";
        case "READY":
            return "Your order is ready for pickup";
        case "ASSIGNED":
            return "A rider has been assigned";
        case "PICKED_UP":
        case "OUT_FOR_DELIVERY":
            return "Your order is on the way!";
        case "DELIVERED":
            return "Your order has been delivered";
        case "CANCELLED":
            return "Your order has been cancelled";
        default:
            return "Order status updated";
    }
}

export function getStatusColor(status: OrderStatusType): string {
    switch (status) {
        case "PENDING":
            return "bg-blue-100 text-blue-800";
        case "CONFIRMED":
            return "bg-indigo-100 text-indigo-800";
        case "PREPARING":
            return "bg-yellow-100 text-yellow-800";
        case "READY":
            return "bg-purple-100 text-purple-800";
        case "ASSIGNED":
        case "PICKED_UP":
        case "OUT_FOR_DELIVERY":
            return "bg-orange-100 text-orange-800";
        case "DELIVERED":
            return "bg-green-100 text-green-800";
        case "CANCELLED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}
