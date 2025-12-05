import { Router } from 'express';
import { AdminRestaurantController } from '../controllers/admin.restaurant.controller';
import { AdminRiderController } from '../controllers/admin.rider.controller';
import { AdminNotificationController } from '../controllers/admin.notification.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const restaurantController = new AdminRestaurantController();
const riderController = new AdminRiderController();
const notificationController = new AdminNotificationController();

// All routes require ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

// Restaurant routes
// GET /api/admin/restaurants - Get all restaurants with pagination and filters
router.get('/restaurants', (req, res) => restaurantController.getRestaurants(req, res));

// GET /api/admin/restaurants/:id - Get single restaurant
router.get('/restaurants/:id', (req, res) => restaurantController.getRestaurant(req, res));

// PUT /api/admin/restaurants/:id/approve - Approve or reject restaurant
router.put('/restaurants/:id/approve', (req, res) => restaurantController.approveRestaurant(req, res));

// PUT /api/admin/restaurants/:id/suspend - Suspend or unsuspend restaurant
router.put('/restaurants/:id/suspend', (req, res) => restaurantController.suspendRestaurant(req, res));

// Rider routes
// GET /api/admin/riders - Get all riders with pagination and filters
router.get('/riders', (req, res) => riderController.getRiders(req, res));

// GET /api/admin/riders/stats - Get rider statistics
router.get('/riders/stats', (req, res) => riderController.getRiderStats(req, res));

// GET /api/admin/riders/:id - Get single rider
router.get('/riders/:id', (req, res) => riderController.getRider(req, res));

// PUT /api/admin/riders/:id/approve - Approve rider
router.put('/riders/:id/approve', (req, res) => riderController.approveRider(req, res));

// PUT /api/admin/riders/:id/reject - Reject rider
router.put('/riders/:id/reject', (req, res) => riderController.rejectRider(req, res));

// PUT /api/admin/riders/:id/suspend - Suspend or unsuspend rider
router.put('/riders/:id/suspend', (req, res) => riderController.suspendRider(req, res));

// Notifications
router.get('/notifications', (req, res) => notificationController.list(req, res));
router.post('/notifications/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.post('/notifications/read-all', (req, res) => notificationController.markAllAsRead(req, res));

export default router;
