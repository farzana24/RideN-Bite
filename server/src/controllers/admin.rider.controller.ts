import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class AdminRiderController {
    // Get all riders with filters
    async getRiders(req: Request, res: Response) {
        try {
            const { page = '1', limit = '10', status, search } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            let where: any = {};

            // Filter by status
            if (status === 'pending') {
                where.status = 'PENDING';
            } else if (status === 'active') {
                where.status = 'ACTIVE';
            } else if (status === 'suspended') {
                where.status = 'SUSPENDED';
            } else if (status === 'rejected') {
                where.status = 'REJECTED';
            }

            // Search filter
            if (search) {
                where.user = {
                    OR: [
                        { name: { contains: search as string, mode: 'insensitive' } },
                        { email: { contains: search as string, mode: 'insensitive' } },
                        { phone: { contains: search as string, mode: 'insensitive' } },
                    ],
                };
            }

            // Get riders with user info and documents
            const [riders, total] = await Promise.all([
                prisma.riderProfile.findMany({
                    where,
                    skip,
                    take,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                createdAt: true,
                            },
                        },
                        documents: {
                            select: {
                                id: true,
                                type: true,
                                filename: true,
                                url: true,
                                uploadedAt: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                prisma.riderProfile.count({ where }),
            ]);

            const formattedRiders = riders.map(rider => {
                // Find specific document types
                const drivingLicense = rider.documents.find(doc => doc.type === 'driving_license');
                const vehicleRegistration = rider.documents.find(doc => doc.type === 'vehicle_registration');
                const profilePhoto = rider.documents.find(doc => doc.type === 'profile_photo');
                const insurance = rider.documents.find(doc => doc.type === 'insurance');

                return {
                    id: rider.id,
                    userId: rider.userId,
                    name: rider.user.name,
                    email: rider.user.email,
                    phone: rider.user.phone,
                    vehicleType: rider.vehicleType,
                    vehicleNumber: rider.vehicleNumber,
                    status: rider.status,
                    availableRegions: rider.availableRegions,
                    availableHours: rider.availableHours,
                    createdAt: rider.createdAt.toISOString(),
                    updatedAt: rider.updatedAt.toISOString(),
                    submittedAt: rider.user.createdAt.toISOString(),
                    documents: {
                        drivingLicense: drivingLicense ? {
                            url: drivingLicense.url,
                            filename: drivingLicense.filename,
                            uploadedAt: drivingLicense.uploadedAt.toISOString(),
                        } : null,
                        vehicleRegistration: vehicleRegistration ? {
                            url: vehicleRegistration.url,
                            filename: vehicleRegistration.filename,
                            uploadedAt: vehicleRegistration.uploadedAt.toISOString(),
                        } : null,
                        profilePhoto: profilePhoto ? {
                            url: profilePhoto.url,
                            filename: profilePhoto.filename,
                            uploadedAt: profilePhoto.uploadedAt.toISOString(),
                        } : null,
                        insurance: insurance ? {
                            url: insurance.url,
                            filename: insurance.filename,
                            uploadedAt: insurance.uploadedAt.toISOString(),
                        } : null,
                    },
                };
            });

            res.json({
                success: true,
                data: {
                    data: formattedRiders,
                    total,
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    totalPages: Math.ceil(total / parseInt(limit as string)),
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch riders',
                error: error.message,
            });
        }
    }

    // Get single rider by ID
    async getRider(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const rider = await prisma.riderProfile.findUnique({
                where: { id: parseInt(id) },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            createdAt: true,
                        },
                    },
                    documents: {
                        select: {
                            id: true,
                            type: true,
                            filename: true,
                            url: true,
                            uploadedAt: true,
                        },
                    },
                },
            });

            if (!rider) {
                return res.status(404).json({
                    success: false,
                    message: 'Rider not found',
                });
            }

            // Find specific document types
            const drivingLicense = rider.documents.find(doc => doc.type === 'driving_license');
            const vehicleRegistration = rider.documents.find(doc => doc.type === 'vehicle_registration');
            const profilePhoto = rider.documents.find(doc => doc.type === 'profile_photo');
            const insurance = rider.documents.find(doc => doc.type === 'insurance');

            res.json({
                success: true,
                data: {
                    id: rider.id,
                    userId: rider.userId,
                    name: rider.user.name,
                    email: rider.user.email,
                    phone: rider.user.phone,
                    vehicleType: rider.vehicleType,
                    vehicleNumber: rider.vehicleNumber,
                    status: rider.status,
                    availableRegions: rider.availableRegions,
                    availableHours: rider.availableHours,
                    createdAt: rider.createdAt.toISOString(),
                    updatedAt: rider.updatedAt.toISOString(),
                    submittedAt: rider.user.createdAt.toISOString(),
                    documents: {
                        drivingLicense: drivingLicense ? {
                            url: drivingLicense.url,
                            filename: drivingLicense.filename,
                            uploadedAt: drivingLicense.uploadedAt.toISOString(),
                        } : null,
                        vehicleRegistration: vehicleRegistration ? {
                            url: vehicleRegistration.url,
                            filename: vehicleRegistration.filename,
                            uploadedAt: vehicleRegistration.uploadedAt.toISOString(),
                        } : null,
                        profilePhoto: profilePhoto ? {
                            url: profilePhoto.url,
                            filename: profilePhoto.filename,
                            uploadedAt: profilePhoto.uploadedAt.toISOString(),
                        } : null,
                        insurance: insurance ? {
                            url: insurance.url,
                            filename: insurance.filename,
                            uploadedAt: insurance.uploadedAt.toISOString(),
                        } : null,
                    },
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch rider',
                error: error.message,
            });
        }
    }

    // Approve rider
    async approveRider(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const rider = await prisma.riderProfile.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'ACTIVE',
                    updatedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // TODO: Send email notification to rider

            res.json({
                success: true,
                data: rider,
                message: 'Rider approved successfully',
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to approve rider',
                error: error.message,
            });
        }
    }

    // Reject rider
    async rejectRider(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const rider = await prisma.riderProfile.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    updatedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // TODO: Send email notification to rider with rejection reason

            res.json({
                success: true,
                data: rider,
                message: 'Rider rejected successfully',
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to reject rider',
                error: error.message,
            });
        }
    }

    // Suspend/unsuspend rider
    async suspendRider(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { suspended, reason } = req.body;

            const rider = await prisma.riderProfile.update({
                where: { id: parseInt(id) },
                data: {
                    status: suspended ? 'SUSPENDED' : 'ACTIVE',
                    updatedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // TODO: Send email notification to rider

            res.json({
                success: true,
                data: rider,
                message: `Rider ${suspended ? 'suspended' : 'reactivated'} successfully`,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to update rider status',
                error: error.message,
            });
        }
    }

    // Get rider statistics
    async getRiderStats(req: Request, res: Response) {
        try {
            const [pending, active, suspended, rejected, approvedToday, rejectedToday] = await Promise.all([
                prisma.riderProfile.count({ where: { status: 'PENDING' } }),
                prisma.riderProfile.count({ where: { status: 'ACTIVE' } }),
                prisma.riderProfile.count({ where: { status: 'SUSPENDED' } }),
                prisma.riderProfile.count({ where: { status: 'REJECTED' } }),
                prisma.riderProfile.count({
                    where: {
                        status: 'ACTIVE',
                        updatedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                prisma.riderProfile.count({
                    where: {
                        status: 'REJECTED',
                        updatedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
            ]);

            res.json({
                success: true,
                data: {
                    pending,
                    active,
                    suspended,
                    rejected,
                    approvedToday,
                    rejectedToday,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch rider statistics',
                error: error.message,
            });
        }
    }
}
