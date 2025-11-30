import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useRestaurantStore } from "../store/restaurantStore";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export function useRestaurantSocket(restaurantId: string | undefined) {
    const pushAlert = useRestaurantStore((state) => state.pushAlert);
    const refreshOrders = useRestaurantStore((state) => state.refreshOrders);

    useEffect(() => {
        // Socket.IO connection disabled - using REST API polling instead
        // TODO: Implement Socket.IO server for real-time features
        if (!restaurantId) return;
        
        // Uncomment when Socket.IO server is ready:
        // const socket: Socket = io(SOCKET_URL, {
        //     query: { role: "RESTAURANT", restaurantId },
        // });

        // socket.on("restaurant:new-order", (payload) => {
        //     const alertId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();
        //     pushAlert({
        //         id: payload.id ?? alertId,
        //         title: "New order",
        //         message: `Order ${payload.orderId ?? "#"} just arrived`,
        //         createdAt: new Date().toISOString(),
        //         type: "NEW_ORDER",
        //     });
        //     refreshOrders();
        // });

        // socket.on("restaurant:status", (payload) => {
        //     const alertId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();
        //     pushAlert({
        //         id: payload.id ?? alertId,
        //         title: payload.title ?? "Status update",
        //         message: payload.message ?? "Order updated",
        //         createdAt: new Date().toISOString(),
        //         type: "SYSTEM",
        //     });
        // });

        // return () => {
        //     socket.disconnect();
        // };
    }, [restaurantId, pushAlert, refreshOrders]);
}
