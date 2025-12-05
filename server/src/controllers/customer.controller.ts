import { Request, Response } from "express";
import * as customerService from "../services/customer.service";

// ==================== RESTAURANTS ====================

export async function getRestaurants(req: Request, res: Response) {
    try {
        const { search, category, page, limit, lat, lng } = req.query;
        
        const result = await customerService.getRestaurants({
            search: search as string,
            category: category as string,
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            lat: lat ? parseFloat(lat as string) : undefined,
            lng: lng ? parseFloat(lng as string) : undefined,
        });
        
        res.json(result);
    } catch (error: any) {
        console.error("Get restaurants error:", error);
        res.status(500).json({ message: "Failed to fetch restaurants" });
    }
}

export async function getRestaurantById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;
        
        const restaurant = await customerService.getRestaurantById(
            parseInt(id),
            userId
        );
        
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        
        res.json(restaurant);
    } catch (error: any) {
        console.error("Get restaurant error:", error);
        res.status(500).json({ message: "Failed to fetch restaurant" });
    }
}

export async function getPopularDishes(req: Request, res: Response) {
    try {
        const { limit } = req.query;
        const dishes = await customerService.getPopularDishes(
            limit ? parseInt(limit as string) : 10
        );
        res.json(dishes);
    } catch (error: any) {
        console.error("Get popular dishes error:", error);
        res.status(500).json({ message: "Failed to fetch dishes" });
    }
}

// ==================== ORDERS ====================

export async function createOrder(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { restaurantId, items, deliveryAddress, deliveryLat, deliveryLng, deliveryFee, notes } = req.body;
        
        if (!restaurantId || !items?.length || !deliveryAddress) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const order = await customerService.createOrder({
            userId,
            restaurantId,
            items,
            deliveryAddress,
            deliveryLat,
            deliveryLng,
            deliveryFee: deliveryFee || 0,
            notes,
        });
        
        res.status(201).json(order);
    } catch (error: any) {
        console.error("Create order error:", error);
        res.status(400).json({ message: error.message || "Failed to create order" });
    }
}

export async function getOrders(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { status } = req.query;
        
        const orders = await customerService.getOrders(userId, status as any);
        res.json(orders);
    } catch (error: any) {
        console.error("Get orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
}

export async function getOrderById(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        
        const order = await customerService.getOrderById(parseInt(id), userId);
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        res.json(order);
    } catch (error: any) {
        console.error("Get order error:", error);
        res.status(500).json({ message: "Failed to fetch order" });
    }
}

export async function cancelOrder(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        
        const order = await customerService.cancelOrder(parseInt(id), userId);
        res.json(order);
    } catch (error: any) {
        console.error("Cancel order error:", error);
        res.status(400).json({ message: error.message || "Failed to cancel order" });
    }
}

export async function getActiveOrder(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const order = await customerService.getActiveOrder(userId);
        res.json(order);
    } catch (error: any) {
        console.error("Get active order error:", error);
        res.status(500).json({ message: "Failed to fetch active order" });
    }
}

// ==================== ADDRESSES ====================

export async function getAddresses(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const addresses = await customerService.getAddresses(userId);
        res.json(addresses);
    } catch (error: any) {
        console.error("Get addresses error:", error);
        res.status(500).json({ message: "Failed to fetch addresses" });
    }
}

export async function createAddress(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { label, street, city, area, lat, lng, isDefault } = req.body;
        
        if (!label || !street || !city) {
            return res.status(400).json({ message: "Label, street, and city are required" });
        }
        
        const address = await customerService.createAddress(userId, {
            label,
            street,
            city,
            area,
            lat,
            lng,
            isDefault,
        });
        
        res.status(201).json(address);
    } catch (error: any) {
        console.error("Create address error:", error);
        res.status(400).json({ message: error.message || "Failed to create address" });
    }
}

export async function updateAddress(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        const data = req.body;
        
        const address = await customerService.updateAddress(parseInt(id), userId, data);
        res.json(address);
    } catch (error: any) {
        console.error("Update address error:", error);
        res.status(400).json({ message: error.message || "Failed to update address" });
    }
}

export async function deleteAddress(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        
        await customerService.deleteAddress(parseInt(id), userId);
        res.json({ message: "Address deleted" });
    } catch (error: any) {
        console.error("Delete address error:", error);
        res.status(400).json({ message: error.message || "Failed to delete address" });
    }
}

// ==================== FAVORITES ====================

export async function getFavorites(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const favorites = await customerService.getFavorites(userId);
        res.json(favorites);
    } catch (error: any) {
        console.error("Get favorites error:", error);
        res.status(500).json({ message: "Failed to fetch favorites" });
    }
}

export async function addFavorite(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { restaurantId } = req.body;
        
        if (!restaurantId) {
            return res.status(400).json({ message: "Restaurant ID is required" });
        }
        
        const favorite = await customerService.addFavorite(userId, restaurantId);
        res.status(201).json(favorite);
    } catch (error: any) {
        console.error("Add favorite error:", error);
        res.status(400).json({ message: error.message || "Failed to add favorite" });
    }
}

export async function removeFavorite(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { id } = req.params;
        
        await customerService.removeFavorite(userId, parseInt(id));
        res.json({ message: "Removed from favorites" });
    } catch (error: any) {
        console.error("Remove favorite error:", error);
        res.status(400).json({ message: error.message || "Failed to remove favorite" });
    }
}

// ==================== REVIEWS ====================

export async function createReview(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { orderId, rating, comment } = req.body;
        
        if (!orderId || !rating) {
            return res.status(400).json({ message: "Order ID and rating are required" });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }
        
        const review = await customerService.createReview(userId, {
            orderId,
            rating,
            comment,
        });
        
        res.status(201).json(review);
    } catch (error: any) {
        console.error("Create review error:", error);
        res.status(400).json({ message: error.message || "Failed to create review" });
    }
}

export async function getRestaurantReviews(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;
        
        const result = await customerService.getRestaurantReviews(
            parseInt(id),
            page ? parseInt(page as string) : 1,
            limit ? parseInt(limit as string) : 10
        );
        
        res.json(result);
    } catch (error: any) {
        console.error("Get reviews error:", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
}

// ==================== PROFILE ====================

export async function getProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const profile = await customerService.getProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        
        res.json(profile);
    } catch (error: any) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Failed to fetch profile" });
    }
}

export async function updateProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { name, phone } = req.body;
        
        const profile = await customerService.updateProfile(userId, { name, phone });
        res.json(profile);
    } catch (error: any) {
        console.error("Update profile error:", error);
        res.status(400).json({ message: error.message || "Failed to update profile" });
    }
}

export async function deleteAccount(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        await customerService.deleteAccount(userId);
        res.json({ message: "Account deleted successfully" });
    } catch (error: any) {
        console.error("Delete account error:", error);
        res.status(400).json({ message: error.message || "Failed to delete account" });
    }
}
