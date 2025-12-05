import { z } from "zod";
import type { MenuCategory, SpiceLevel } from "./index";

export const menuItemSchema = z.object({
    name: z.string().min(3),
    description: z.string().min(10),
    category: z.custom<MenuCategory>(),
    price: z.number().positive(),
    cookingTime: z.number().int().positive(),
    spiceLevel: z.custom<SpiceLevel>(),
    imageUrl: z.string().optional().or(z.literal("")).refine(
        (val) => !val || val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://"),
        { message: "Must be a valid URL or uploaded image" }
    ),
    isAvailable: z.boolean().default(true),
});

export const profileSchema = z.object({
    name: z.string().min(4),
    address: z.string().min(10),
    phone: z.string().min(11),
    category: z.string().min(3),
    openingHours: z.string(),
    closingHours: z.string(),
    licenseNumber: z.string().min(6),
    logoUrl: z.string().optional().or(z.literal("")).refine(
        (val) => !val || val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://"),
        { message: "Must be a valid URL or uploaded image" }
    ),
    coverPhotoUrl: z.string().optional().or(z.literal("")).refine(
        (val) => !val || val.startsWith("data:image/") || val.startsWith("http://") || val.startsWith("https://"),
        { message: "Must be a valid URL or uploaded image" }
    ),
});

export const payoutRequestSchema = z.object({
    amount: z.number().positive(),
    method: z.enum(["BANK", "MOBILE_BANKING"]),
    accountName: z.string().min(3),
    accountNumber: z.string().min(4),
});

export const notificationSchema = z.object({
    emailAlerts: z.boolean(),
    smsAlerts: z.boolean(),
    pushAlerts: z.boolean(),
});

export const generalSettingsSchema = z.object({
    notification: notificationSchema,
    autoAcceptOrders: z.boolean(),
    maxCookingLoad: z.number().int().min(1).max(30),
});

export const securitySettingsSchema = z.object({
    hasTwoFactorAuth: z.boolean(),
});

export type MenuFormValues = z.infer<typeof menuItemSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PayoutRequestValues = z.infer<typeof payoutRequestSchema>;
export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
export type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;
