import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(['CUSTOMER', 'RESTAURANT', 'RIDER']).default('CUSTOMER'),
    // Restaurant-specific
    businessName: z.string().optional(),
    address: z.string().optional(),
    storefrontImage: z.string().optional(), // Base64 encoded image
    // Rider-specific
    vehicleType: z.enum(['BIKE', 'CAR', 'BICYCLE', 'SCOOTER']).optional(),
    nidPassport: z.string().optional(),
    profilePhoto: z.string().optional(),
    drivingLicense: z.string().optional(),
    vehicleRegistration: z.string().optional(),
}).refine((data) => {
    // Phone is required for restaurant registrations
    if (data.role === 'RESTAURANT' && !data.phone) {
        return false;
    }
    return true;
}, {
    message: 'Phone number is required for restaurant registration',
    path: ['phone'],
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
});

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const data = registerSchema.parse(req.body);
            const result = await authService.register(data);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const data = loginSchema.parse(req.body);
            const result = await authService.login(data);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async changePassword(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const data = changePasswordSchema.parse(req.body);
            await authService.changePassword(userId, data.currentPassword, data.newPassword);
            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
