import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";

// ==================== RESTAURANTS ====================

export async function getRestaurants(params: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
    lat?: number;
    lng?: number;
}) {
    const { search, category, page = 1, limit = 20, lat, lng } = params;
    const skip = (page - 1) * limit;

    const where: any = {
        owner: {
            restaurantProfile: {
                status: 'ACTIVE',
            },
        },
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
        ];
    }

    if (category) {
        where.menuItems = {
            some: {
                category: { equals: category, mode: "insensitive" },
            },
        };
    }

    const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
            where,
            skip,
            take: limit,
            include: {
                menuItems: {
                    where: { available: true },
                    take: 5,
                    orderBy: { rating: "desc" },
                },
                _count: {
                    select: { orders: true, reviews: true },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.restaurant.count({ where }),
    ]);

    // Calculate average rating for each restaurant
    const restaurantsWithRating = await Promise.all(
        restaurants.map(async (restaurant) => {
            const avgRating = await prisma.review.aggregate({
                where: { restaurantId: restaurant.id },
                _avg: { rating: true },
            });

            return {
                ...restaurant,
                avgRating: avgRating._avg.rating || 0,
                totalReviews: restaurant._count.reviews,
            };
        })
    );

    return {
        restaurants: restaurantsWithRating,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getRestaurantById(id: number, userId?: number) {
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id,
            owner: {
                restaurantProfile: {
                    status: 'ACTIVE',
                },
            },
        },
        include: {
            menuItems: {
                where: { available: true },
                orderBy: [{ category: "asc" }, { rating: "desc" }],
            },
            reviews: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            _count: {
                select: { orders: true, reviews: true },
            },
        },
    });

    if (!restaurant) {
        return null;
    }

    // Get average rating
    const avgRating = await prisma.review.aggregate({
        where: { restaurantId: id },
        _avg: { rating: true },
    });

    // Check if user has favorited this restaurant
    let isFavorite = false;
    if (userId) {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_restaurantId: { userId, restaurantId: id },
            },
        });
        isFavorite = !!favorite;
    }

    // Group menu items by category
    const menuByCategory: Record<string, typeof restaurant.menuItems> = {};
    for (const item of restaurant.menuItems) {
        const category = item.category || "Other";
        if (!menuByCategory[category]) {
            menuByCategory[category] = [];
        }
        menuByCategory[category].push(item);
    }

    return {
        ...restaurant,
        avgRating: avgRating._avg.rating || 0,
        totalReviews: restaurant._count.reviews,
        isFavorite,
        menuByCategory,
    };
}

export async function getPopularDishes(limit: number = 10) {
    const dishes = await prisma.menuItem.findMany({
        where: {
            available: true,
            restaurant: {
                owner: {
                    restaurantProfile: {
                        status: 'ACTIVE',
                    },
                },
            },
        },
        include: {
            restaurant: {
                select: { id: true, name: true, address: true },
            },
        },
        orderBy: { rating: "desc" },
        take: limit,
    });

    return dishes;
}

// ==================== ORDERS ====================

interface CreateOrderInput {
    userId: number;
    restaurantId: number;
    items: Array<{
        menuItemId: number;
        quantity: number;
    }>;
    deliveryAddress: string;
    deliveryLat?: number;
    deliveryLng?: number;
    deliveryFee: number;
    notes?: string;
}

export async function createOrder(input: CreateOrderInput) {
    const { userId, restaurantId, items, deliveryAddress, deliveryLat, deliveryLng, deliveryFee, notes } = input;

    // Validate restaurant exists and is approved
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id: restaurantId,
            owner: {
                restaurantProfile: {
                    status: 'ACTIVE',
                },
            },
        },
    });

    if (!restaurant) {
        throw new Error("Restaurant not found or not available");
    }

    // Get menu items with prices
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
        where: {
            id: { in: menuItemIds },
            restaurantId,
            available: true,
        },
    });

    if (menuItems.length !== items.length) {
        throw new Error("Some items are not available");
    }

    // Calculate total
    const itemsWithPrice = items.map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId)!;
        return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            priceCents: menuItem.priceCents,
        };
    });

    const subtotal = itemsWithPrice.reduce(
        (sum, item) => sum + item.priceCents * item.quantity,
        0
    );
    const totalCents = subtotal + deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
        data: {
            userId,
            restaurantId,
            totalCents,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            deliveryFee,
            notes,
            status: OrderStatus.PENDING,
            items: {
                create: itemsWithPrice,
            },
            payment: {
                create: {
                    amountCents: totalCents,
                    status: "PENDING",
                },
            },
        },
        include: {
            items: {
                include: {
                    menuItem: true,
                },
            },
            restaurant: {
                select: { id: true, name: true, address: true },
            },
            payment: true,
        },
    });

    return order;
}

export async function getOrders(userId: number, status?: OrderStatus) {
    const where: any = { userId };
    if (status) {
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            restaurant: {
                select: { id: true, name: true, address: true },
            },
            items: {
                include: {
                    menuItem: {
                        select: { id: true, name: true, imageUrl: true },
                    },
                },
            },
            rider: {
                include: {
                    user: {
                        select: { name: true, phone: true },
                    },
                },
            },
            payment: true,
            review: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return orders;
}

export async function getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
            restaurant: {
                select: { id: true, name: true, address: true, lat: true, lng: true },
            },
            items: {
                include: {
                    menuItem: true,
                },
            },
            rider: {
                include: {
                    user: {
                        select: { name: true, phone: true },
                    },
                },
            },
            payment: true,
            review: true,
        },
    });

    return order;
}

export async function cancelOrder(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    // Can only cancel pending or confirmed orders
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        throw new Error("Order cannot be cancelled at this stage");
    }

    const updated = await prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: {
            restaurant: true,
            items: true,
            payment: true,
        },
    });

    // Update payment status
    await prisma.payment.update({
        where: { orderId },
        data: { status: "CANCELLED" },
    });

    return updated;
}

export async function getActiveOrder(userId: number) {
    const activeStatuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.ASSIGNED,
        OrderStatus.PICKED_UP,
    ];

    const order = await prisma.order.findFirst({
        where: {
            userId,
            status: { in: activeStatuses },
        },
        include: {
            restaurant: {
                select: { id: true, name: true, address: true, lat: true, lng: true },
            },
            items: {
                include: {
                    menuItem: {
                        select: { id: true, name: true },
                    },
                },
            },
            rider: {
                include: {
                    user: {
                        select: { name: true, phone: true },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return order;
}

// ==================== ADDRESSES ====================

export async function getAddresses(userId: number) {
    return prisma.customerAddress.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
}

export async function createAddress(
    userId: number,
    data: {
        label: string;
        street: string;
        city: string;
        area?: string;
        lat?: number;
        lng?: number;
        isDefault?: boolean;
    }
) {
    // If this is the default address, unset other defaults
    if (data.isDefault) {
        await prisma.customerAddress.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
    }

    return prisma.customerAddress.create({
        data: {
            userId,
            ...data,
        },
    });
}

export async function updateAddress(
    addressId: number,
    userId: number,
    data: {
        label?: string;
        street?: string;
        city?: string;
        area?: string;
        lat?: number;
        lng?: number;
        isDefault?: boolean;
    }
) {
    // Verify ownership
    const address = await prisma.customerAddress.findFirst({
        where: { id: addressId, userId },
    });

    if (!address) {
        throw new Error("Address not found");
    }

    // If setting as default, unset others
    if (data.isDefault) {
        await prisma.customerAddress.updateMany({
            where: { userId, id: { not: addressId } },
            data: { isDefault: false },
        });
    }

    return prisma.customerAddress.update({
        where: { id: addressId },
        data,
    });
}

export async function deleteAddress(addressId: number, userId: number) {
    const address = await prisma.customerAddress.findFirst({
        where: { id: addressId, userId },
    });

    if (!address) {
        throw new Error("Address not found");
    }

    return prisma.customerAddress.delete({
        where: { id: addressId },
    });
}

// ==================== FAVORITES ====================

export async function getFavorites(userId: number) {
    const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
            restaurant: {
                include: {
                    _count: { select: { reviews: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Add average ratings
    const favoritesWithRating = await Promise.all(
        favorites.map(async (fav) => {
            const avgRating = await prisma.review.aggregate({
                where: { restaurantId: fav.restaurantId },
                _avg: { rating: true },
            });
            return {
                ...fav,
                restaurant: {
                    ...fav.restaurant,
                    avgRating: avgRating._avg.rating || 0,
                },
            };
        })
    );

    return favoritesWithRating;
}

export async function addFavorite(userId: number, restaurantId: number) {
    // Verify restaurant exists and is active
    const restaurant = await prisma.restaurant.findFirst({
        where: {
            id: restaurantId,
            owner: {
                restaurantProfile: {
                    status: 'ACTIVE',
                },
            },
        },
    });

    if (!restaurant) {
        throw new Error("Restaurant not found");
    }

    return prisma.favorite.upsert({
        where: {
            userId_restaurantId: { userId, restaurantId },
        },
        create: { userId, restaurantId },
        update: {},
        include: {
            restaurant: true,
        },
    });
}

export async function removeFavorite(userId: number, restaurantId: number) {
    return prisma.favorite.delete({
        where: {
            userId_restaurantId: { userId, restaurantId },
        },
    });
}

// ==================== REVIEWS ====================

export async function createReview(
    userId: number,
    data: {
        orderId: number;
        rating: number;
        comment?: string;
    }
) {
    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
        where: { id: data.orderId, userId, status: OrderStatus.DELIVERED },
    });

    if (!order) {
        throw new Error("Order not found or not delivered yet");
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
        where: { orderId: data.orderId },
    });

    if (existingReview) {
        throw new Error("Review already submitted for this order");
    }

    const review = await prisma.review.create({
        data: {
            userId,
            orderId: data.orderId,
            restaurantId: order.restaurantId,
            rating: data.rating,
            comment: data.comment,
        },
        include: {
            user: {
                select: { id: true, name: true },
            },
        },
    });

    // Update restaurant's average rating in menu items (optional optimization)
    const avgRating = await prisma.review.aggregate({
        where: { restaurantId: order.restaurantId },
        _avg: { rating: true },
    });

    // Could update a denormalized rating field on restaurant here

    return review;
}

export async function getRestaurantReviews(restaurantId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { restaurantId },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({ where: { restaurantId } }),
    ]);

    return {
        reviews,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// ==================== PROFILE ====================

export async function getProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
            addresses: {
                orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            },
            _count: {
                select: { orders: true, favorites: true, reviews: true },
            },
        },
    });

    return user;
}

export async function updateProfile(
    userId: number,
    data: {
        name?: string;
        phone?: string;
    }
) {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
        },
    });
}

export async function deleteAccount(userId: number) {
    // This will cascade delete addresses, favorites, reviews due to onDelete: Cascade
    return prisma.user.delete({
        where: { id: userId },
    });
}
