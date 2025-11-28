import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a verification token for email verification
 * Token expires in 24 hours
 */
export function generateVerificationToken(): { token: string; expiry: Date } {
    const token = uuidv4();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // 24 hours from now

    return { token, expiry };
}

/**
 * Verify a token and mark user as verified
 * Returns the user if successful, throws error if invalid/expired
 */
export async function verifyEmailToken(token: string) {
    const user = await prisma.user.findFirst({
        where: {
            verificationToken: token,
            tokenExpiry: {
                gte: new Date(), // Token not expired
            },
        },
    });

    if (!user) {
        throw new Error('Invalid or expired verification token');
    }

    // Mark user as verified and clear token
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verificationToken: null,
            tokenExpiry: null,
        },
    });

    return updatedUser;
}

/**
 * Update user's verification token (for resending)
 */
export async function updateVerificationToken(userId: number) {
    const { token, expiry } = generateVerificationToken();

    await prisma.user.update({
        where: { id: userId },
        data: {
            verificationToken: token,
            tokenExpiry: expiry,
        },
    });

    return token;
}
