import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AccountStatus } from '@prisma/client';

export class AdminRestaurantController {
    // Get all restaurants with filters
    async getRestaurants(req: Request, res: Response) {
        try {
            const { page = '1', limit = '10', status, search } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            let where: any = {};

            // Filter by status via RestaurantProfile
            if (status === 'pending') {
                where.owner = { restaurantProfile: { status: AccountStatus.PENDING } };
            } else if (status === 'active') {
                where.owner = { restaurantProfile: { status: AccountStatus.ACTIVE } };
            } else if (status === 'suspended') {
                where.owner = { restaurantProfile: { status: AccountStatus.SUSPENDED } };
            } else if (status === 'rejected') {
                where.owner = { restaurantProfile: { status: AccountStatus.REJECTED } };
            }

            // Search filter
            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { owner: { email: { contains: search as string, mode: 'insensitive' } } },
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
                                        status: true,
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

            const formattedRestaurants = restaurants.map(restaurant => {
                const profileStatus = restaurant.owner.restaurantProfile?.status;
                return {
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
                    status: profileStatus || AccountStatus.PENDING,
                    createdAt: restaurant.createdAt.toISOString(),
                    updatedAt: restaurant.updatedAt.toISOString(),
                    menuItemsCount: restaurant._count.menuItems,
                    ordersCount: restaurant._count.orders,
                };
            });

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
                                    status: true,
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
                    status: restaurant.owner.restaurantProfile?.status || AccountStatus.PENDING,
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

            // Get the restaurant to find the owner
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: parseInt(id) },
                select: { ownerId: true, name: true },
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }

            // Update the RestaurantProfile status
            const newStatus = approved ? AccountStatus.ACTIVE : AccountStatus.REJECTED;
            await prisma.restaurantProfile.update({
                where: { userId: restaurant.ownerId },
                data: { status: newStatus },
            });

            // TODO: Send email notification to restaurant owner

            res.json({
                success: true,
                data: { id: parseInt(id), status: newStatus },
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

            // Get the restaurant to find the owner
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: parseInt(id) },
                select: { ownerId: true },
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }

            // Update RestaurantProfile status
            const newStatus = suspended ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;
            await prisma.restaurantProfile.update({
                where: { userId: restaurant.ownerId },
                data: { status: newStatus },
            });

            res.json({
                success: true,
                data: { id: parseInt(id), status: newStatus },
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
