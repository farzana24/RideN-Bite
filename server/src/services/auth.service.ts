import { User, Role } from '@prisma/client';
import { hashPassword, comparePassword, generateTokens } from '../utils/auth';
import { prisma } from '../lib/prisma';

export class AuthService {
    async register(data: any) {
        const { email, password, name, phone, role, businessName, address, vehicleType } = data;

        // Block admin registration
        if (role === 'ADMIN') {
            throw new Error('Admin registration is not allowed');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await hashPassword(password);

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
                await tx.restaurantProfile.create({
                    data: {
                        userId: user.id,
                        businessName,
                        address,
                        cuisine: [],
                        deliveryOptions: [],
                        status: 'ACTIVE', // Auto-approve for now
                    },
                });
            }

            if (role === 'RIDER') {
                await tx.riderProfile.create({
                    data: {
                        userId: user.id,
                        vehicleType: vehicleType || 'BIKE',
                        availableRegions: [],
                        status: 'ACTIVE', // Auto-approve for now
                    },
                });
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

        const tokens = generateTokens(user.id, user.role);
        return { user, tokens };
    }
}
