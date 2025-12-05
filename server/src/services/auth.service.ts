import { User, Role } from '@prisma/client';
import { hashPassword, comparePassword, generateTokens } from '../utils/auth';
import { prisma } from '../lib/prisma';
import { uploadService } from './uploadService';

export class AuthService {
    async register(data: any) {
        const { email, password, name, phone, role, businessName, address, vehicleType, storefrontImage } = data;

        // Block admin registration
        if (role === 'ADMIN') {
            throw new Error('Admin registration is not allowed');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await hashPassword(password);

        // Upload storefront image if provided
        let storefrontUrl: string | undefined;
        if (role === 'RESTAURANT' && storefrontImage) {
            try {
                storefrontUrl = await uploadService.uploadImage(storefrontImage, 'restaurants/storefronts');
            } catch (error: any) {
                throw new Error(`Failed to upload storefront image: ${error.message}`);
            }
        }

        // Create user with role-specific profiles in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    role: (role as Role) || Role.CUSTOMER,
                    emailVerified: true, // Skip email verification for now
                },
            });

            // Create role-specific profile
            if (role === 'RESTAURANT' && businessName && address) {
                // Create both Restaurant (for existing functionality) and RestaurantProfile (for new features)
                const restaurant = await tx.restaurant.create({
                    data: {
                        ownerId: user.id,
                        name: businessName,
                        address,
                        approved: false, // Pending approval
                    },
                });

                await tx.restaurantProfile.create({
                    data: {
                        userId: user.id,
                        businessName,
                        address,
                        cuisine: [],
                        deliveryOptions: [],
                        storefrontImage: storefrontUrl,
                        status: 'PENDING', // Pending approval
                    },
                });

                await tx.adminNotification.create({
                    data: {
                        type: 'restaurant_signup',
                        title: 'New restaurant registration',
                        message: `${businessName} submitted a new application`,
                        restaurantId: restaurant.id,
                        metadata: {
                            ownerName: name,
                            ownerEmail: email,
                        },
                    },
                });
            }

            if (role === 'RIDER') {
                // Upload rider documents if provided
                let profilePhotoUrl: string | undefined;
                let drivingLicenseUrl: string | undefined;
                let vehicleRegistrationUrl: string | undefined;

                if (data.profilePhoto) {
                    try {
                        profilePhotoUrl = await uploadService.uploadImage(data.profilePhoto, 'riders/profiles');
                    } catch (error: any) {
                        throw new Error(`Failed to upload profile photo: ${error.message}`);
                    }
                }

                if (data.drivingLicense) {
                    try {
                        drivingLicenseUrl = await uploadService.uploadImage(data.drivingLicense, 'riders/licenses');
                    } catch (error: any) {
                        throw new Error(`Failed to upload driving license: ${error.message}`);
                    }
                }

                if (data.vehicleRegistration) {
                    try {
                        vehicleRegistrationUrl = await uploadService.uploadImage(data.vehicleRegistration, 'riders/registrations');
                    } catch (error: any) {
                        throw new Error(`Failed to upload vehicle registration: ${error.message}`);
                    }
                }

                const riderProfile = await tx.riderProfile.create({
                    data: {
                        userId: user.id,
                        vehicleType: vehicleType || 'BIKE',
                        availableRegions: [],
                        status: 'PENDING', // Require admin approval
                    },
                });

                // Upload documents to Document table
                if (profilePhotoUrl) {
                    await tx.document.create({
                        data: {
                            type: 'profile_photo',
                            filename: 'profile.jpg',
                            url: profilePhotoUrl,
                            riderId: riderProfile.id,
                        },
                    });
                }

                if (drivingLicenseUrl) {
                    await tx.document.create({
                        data: {
                            type: 'driving_license',
                            filename: 'license.jpg',
                            url: drivingLicenseUrl,
                            riderId: riderProfile.id,
                        },
                    });
                }

                if (vehicleRegistrationUrl) {
                    await tx.document.create({
                        data: {
                            type: 'vehicle_registration',
                            filename: 'registration.jpg',
                            url: vehicleRegistrationUrl,
                            riderId: riderProfile.id,
                        },
                    });
                }
            }

            return user;
        });

        const tokens = generateTokens(result.id, result.role);
        return { user: result, tokens };
    }

    async login(data: any) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // If the user is a restaurant, ensure it has been approved
        if (user.role === 'RESTAURANT') {
            const restaurant = await prisma.restaurant.findUnique({ where: { ownerId: user.id } });
            if (!restaurant || restaurant.approved !== true) {
                throw new Error('Restaurant account pending admin approval');
            }
        }

        // If the user is a rider, ensure they have been approved
        if (user.role === 'RIDER') {
            const riderProfile = await prisma.riderProfile.findUnique({ where: { userId: user.id } });
            if (!riderProfile) {
                throw new Error('Rider profile not found');
            }
            if (riderProfile.status === 'PENDING') {
                throw new Error('Rider account pending admin approval');
            }
            if (riderProfile.status === 'REJECTED') {
                throw new Error('Rider account has been rejected');
            }
            if (riderProfile.status === 'SUSPENDED') {
                throw new Error('Rider account has been suspended');
            }
        }

        const tokens = generateTokens(user.id, user.role);
        return { user, tokens };
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await comparePassword(currentPassword, user.password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }
}
