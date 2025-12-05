import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import * as customerController from "../controllers/customer.controller";

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Restaurants (public - anyone can browse)
router.get("/restaurants", customerController.getRestaurants);
router.get("/restaurants/:id", customerController.getRestaurantById);
router.get("/restaurants/:id/reviews", customerController.getRestaurantReviews);
router.get("/dishes/popular", customerController.getPopularDishes);

// ==================== PROTECTED ROUTES (require auth) ====================

// Orders
router.post("/orders", authenticate, requireRole(["CUSTOMER"]), customerController.createOrder);
router.get("/orders", authenticate, requireRole(["CUSTOMER"]), customerController.getOrders);
router.get("/orders/active", authenticate, requireRole(["CUSTOMER"]), customerController.getActiveOrder);
router.get("/orders/:id", authenticate, requireRole(["CUSTOMER"]), customerController.getOrderById);
router.post("/orders/:id/cancel", authenticate, requireRole(["CUSTOMER"]), customerController.cancelOrder);

// Addresses
router.get("/addresses", authenticate, requireRole(["CUSTOMER"]), customerController.getAddresses);
router.post("/addresses", authenticate, requireRole(["CUSTOMER"]), customerController.createAddress);
router.patch("/addresses/:id", authenticate, requireRole(["CUSTOMER"]), customerController.updateAddress);
router.delete("/addresses/:id", authenticate, requireRole(["CUSTOMER"]), customerController.deleteAddress);

// Favorites
router.get("/favorites", authenticate, requireRole(["CUSTOMER"]), customerController.getFavorites);
router.post("/favorites", authenticate, requireRole(["CUSTOMER"]), customerController.addFavorite);
router.delete("/favorites/:id", authenticate, requireRole(["CUSTOMER"]), customerController.removeFavorite);

// Reviews
router.post("/reviews", authenticate, requireRole(["CUSTOMER"]), customerController.createReview);

// Profile
router.get("/profile", authenticate, requireRole(["CUSTOMER"]), customerController.getProfile);
router.patch("/profile", authenticate, requireRole(["CUSTOMER"]), customerController.updateProfile);
router.delete("/account", authenticate, requireRole(["CUSTOMER"]), customerController.deleteAccount);

export default router;
