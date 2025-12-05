import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    restaurantId: string;
    restaurantName: string;
    deliveryFee: number;
    distance: string;
}

export interface Restaurant {
    id: string;
    name: string;
    image?: string;
    deliveryFee: number;
    distance: string;
}

interface CartState {
    items: CartItem[];

    // Actions
    addItem: (item: Omit<CartItem, "restaurantId" | "restaurantName" | "deliveryFee" | "distance">, restaurant: Restaurant) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    clearRestaurantItems: (restaurantId: string) => void;

    // Computed
    totalItems: () => number;
    subtotal: () => number;
    totalDeliveryFee: () => number;
    total: () => number;
    getRestaurants: () => Restaurant[];
    getItemsByRestaurant: () => Map<string, { restaurant: Restaurant; items: CartItem[] }>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item, restaurant: Restaurant) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === item.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === item.id
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                        };
                    }
                    return {
                        items: [
                            ...state.items,
                            {
                                ...item,
                                restaurantId: restaurant.id,
                                restaurantName: restaurant.name,
                                deliveryFee: restaurant.deliveryFee,
                                distance: restaurant.distance,
                            },
                        ],
                    };
                });
            },

            removeItem: (itemId: string) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== itemId),
                }));
            },

            updateQuantity: (itemId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.id === itemId ? { ...i, quantity } : i
                    ),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            clearRestaurantItems: (restaurantId: string) => {
                set((state) => ({
                    items: state.items.filter((i) => i.restaurantId !== restaurantId),
                }));
            },

            totalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            subtotal: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },

            totalDeliveryFee: () => {
                // Get unique restaurants and sum their delivery fees
                const restaurants = get().getRestaurants();
                return restaurants.reduce((sum, r) => sum + r.deliveryFee, 0);
            },

            total: () => {
                return get().subtotal() + get().totalDeliveryFee();
            },

            getRestaurants: () => {
                const items = get().items;
                const restaurantMap = new Map<string, Restaurant>();
                
                items.forEach((item) => {
                    if (!restaurantMap.has(item.restaurantId)) {
                        restaurantMap.set(item.restaurantId, {
                            id: item.restaurantId,
                            name: item.restaurantName,
                            deliveryFee: item.deliveryFee,
                            distance: item.distance,
                        });
                    }
                });
                
                return Array.from(restaurantMap.values());
            },

            getItemsByRestaurant: () => {
                const items = get().items;
                const grouped = new Map<string, { restaurant: Restaurant; items: CartItem[] }>();
                
                items.forEach((item) => {
                    if (!grouped.has(item.restaurantId)) {
                        grouped.set(item.restaurantId, {
                            restaurant: {
                                id: item.restaurantId,
                                name: item.restaurantName,
                                deliveryFee: item.deliveryFee,
                                distance: item.distance,
                            },
                            items: [],
                        });
                    }
                    grouped.get(item.restaurantId)!.items.push(item);
                });
                
                return grouped;
            },
        }),
        {
            name: "cart-storage",
        }
    )
);
