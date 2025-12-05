import { Router } from 'express';
import { restaurantController } from '../controllers/restaurant.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication and RESTAURANT role
router.use(authenticate);
router.use(requireRole(['RESTAURANT']));

// Profile & Stats
router.get('/me', (req, res) => restaurantController.getProfile(req, res));
router.patch('/profile', (req, res) => restaurantController.updateProfile(req, res));
router.get('/stats', (req, res) => restaurantController.getStats(req, res));

// Menu Management
router.get('/menu', (req, res) => restaurantController.getMenu(req, res));
router.post('/menu', (req, res) => restaurantController.createMenuItem(req, res));
router.patch('/menu/:id', (req, res) => restaurantController.updateMenuItem(req, res));
router.delete('/menu', (req, res) => restaurantController.deleteMenuItems(req, res));

// Orders Management
router.get('/orders', (req, res) => restaurantController.getOrders(req, res));
router.patch('/orders/:id', (req, res) => restaurantController.updateOrderStatus(req, res));

// Earnings & Payouts
router.get('/earnings', (req, res) => restaurantController.getEarnings(req, res));
router.post('/payout', (req, res) => restaurantController.requestPayout(req, res));

// Analytics
router.get('/analytics', (req, res) => restaurantController.getAnalytics(req, res));

// Alerts/Notifications
router.get('/alerts', (req, res) => restaurantController.getAlerts(req, res));

// Settings
router.get('/settings/general', (req, res) => restaurantController.getGeneralSettings(req, res));
router.patch('/settings/general', (req, res) => restaurantController.updateGeneralSettings(req, res));

// Account
router.delete('/account', (req, res) => restaurantController.deleteAccount(req, res));

export default router;
