import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AdminRestaurantController {
    // Get all restaurants with filters
    async getRestaurants(req: Request, res: Response) {
        try {
            const { page = '1', limit = '10', status, search } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            let where: any = {};

            // Filter by status
            if (status === 'pending') {
                where.approved = false;
            } else if (status === 'active') {
                where.approved = true;
            }

            // Search filter
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                ];
            }

            // Get restaurants with owner info
            const [restaurants, total] = await Promise.all([
                prisma.restaurant.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                restaurantProfile: {
                                    select: {
                                        storefrontImage: true,
                                    },
                                },
                            },
                        },
                        menuItems: true,
                        orders: true,
                        _count: {
                            select: {
                                menuItems: true,
                                orders: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.restaurant.count({ where }),
            ]);

            const formattedRestaurants = restaurants.map(restaurant => ({
                id: restaurant.id,
                ownerId: restaurant.ownerId,
                ownerName: restaurant.owner.name,
                ownerEmail: restaurant.owner.email,
                name: restaurant.name,
                address: restaurant.address,
                lat: restaurant.lat,
                lng: restaurant.lng,
                phone: restaurant.owner.phone,
                storefrontImage: restaurant.owner.restaurantProfile?.storefrontImage,
                approved: restaurant.approved,
                suspended: false, // TODO: Add suspended field to schema
                createdAt: restaurant.createdAt.toISOString(),
                updatedAt: restaurant.updatedAt.toISOString(),
                menuItemsCount: restaurant._count.menuItems,
                ordersCount: restaurant._count.orders,
            }));

            res.json({
                success: true,
                data: {
                    data: formattedRestaurants,
                    total,
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    totalPages: Math.ceil(total / parseInt(limit as string)),
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurants',
                error: error.message,
            });
        }
    }

    // Get single restaurant by ID
    async getRestaurant(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const restaurant = await prisma.restaurant.findUnique({
                where: { id: parseInt(id) },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            restaurantProfile: {
                                select: {
                                    storefrontImage: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            menuItems: true,
                            orders: true,
                        },
                    },
                },
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }

            res.json({
                success: true,
                data: {
                    id: restaurant.id,
                    ownerId: restaurant.ownerId,
                    ownerName: restaurant.owner.name,
                    ownerEmail: restaurant.owner.email,
                    name: restaurant.name,
                    address: restaurant.address,
                    lat: restaurant.lat,
                    lng: restaurant.lng,
                    phone: restaurant.owner.phone,
                    storefrontImage: restaurant.owner.restaurantProfile?.storefrontImage,
                    approved: restaurant.approved,
                    createdAt: restaurant.createdAt.toISOString(),
                    updatedAt: restaurant.updatedAt.toISOString(),
                    menuItemsCount: restaurant._count.menuItems,
                    ordersCount: restaurant._count.orders,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch restaurant',
                error: error.message,
            });
        }
    }

    // Approve or reject restaurant
    async approveRestaurant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { approved, notes } = req.body;

            const restaurant = await prisma.restaurant.update({
                where: { id: parseInt(id) },
                data: {
                    approved: approved === true,
                },
            });

            // TODO: Send email notification to restaurant owner

            res.json({
                success: true,
                data: restaurant,
                message: `Restaurant ${approved ? 'approved' : 'rejected'} successfully`,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to update restaurant status',
                error: error.message,
            });
        }
    }

    // Suspend/unsuspend restaurant
    async suspendRestaurant(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { suspended } = req.body;

            // For now, we'll use the approved field inversely
            // TODO: Add proper suspended field to schema
            const restaurant = await prisma.restaurant.update({
                where: { id: parseInt(id) },
                data: {
                    approved: !suspended,
                },
            });

            res.json({
                success: true,
                data: restaurant,
                message: `Restaurant ${suspended ? 'suspended' : 'reactivated'} successfully`,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to suspend restaurant',
                error: error.message,
            });
        }
    }
}
