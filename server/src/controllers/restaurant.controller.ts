import { Request, Response } from 'express';
import { restaurantService } from '../services/restaurant.service';

class RestaurantController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data = await restaurantService.getRestaurantProfile(userId);

      if (!data || !data.restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const { restaurant, profile } = data;

      // Format response to match frontend expectations
      const openingHours = profile?.openingHours as any;
      
      res.json({
        id: restaurant.id.toString(),
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.owner.phone || '',
        category: profile?.cuisine?.[0] || 'Restaurant',
        openingHours: openingHours?.opening || '10:00',
        closingHours: openingHours?.closing || '23:00',
        licenseNumber: profile?.taxId || '',
        logoUrl: profile?.storefrontImage || null,
        coverPhotoUrl: profile?.storefrontImage || null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data = req.body;

      const updated = await restaurantService.updateRestaurantProfile(userId, data);

      const openingHours = updated.profile?.openingHours as any;

      res.json({
        id: updated.restaurant.id.toString(),
        name: updated.restaurant.name,
        address: updated.restaurant.address,
        phone: data.phone || '',
        category: updated.profile?.cuisine?.[0] || 'Restaurant',
        openingHours: openingHours?.opening || data.openingHours || '10:00',
        closingHours: openingHours?.closing || data.closingHours || '23:00',
        licenseNumber: data.licenseNumber || '',
        logoUrl: updated.logoUrl || updated.profile?.storefrontImage || null,
        coverPhotoUrl: updated.coverPhotoUrl || null,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const data = await restaurantService.getStats(restaurant.id);
      
      // Return basic stats - chart data is fetched separately
      res.json({
        totalOrdersToday: data.totalOrdersToday,
        activeOrders: data.activeOrders,
        earningsToday: data.earningsToday,
        pendingMenuItems: data.pendingMenuItems,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  async getMenu(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const menu = await restaurantService.getMenu(restaurant.id);
      res.json(menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ error: 'Failed to fetch menu' });
    }
  }

  async createMenuItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const item = await restaurantService.createMenuItem(restaurant.id, req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }

  async updateMenuItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const itemId = parseInt(req.params.id);
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const item = await restaurantService.updateMenuItem(itemId, restaurant.id, req.body);
      res.json(item);
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ error: 'Failed to update menu item' });
    }
  }

  async deleteMenuItems(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { ids } = req.body;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const itemIds = ids.map((id: string) => parseInt(id));
      await restaurantService.deleteMenuItems(itemIds, restaurant.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting menu items:', error);
      res.status(500).json({ error: 'Failed to delete menu items' });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const orders = await restaurantService.getOrders(restaurant.id);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const orderId = parseInt(req.params.id.replace('ORD-', ''));
      const { status } = req.body;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const order = await restaurantService.updateOrderStatus(orderId, restaurant.id, status);
      res.json(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }

  async getEarnings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const earnings = await restaurantService.getEarnings(restaurant.id);
      res.json(earnings);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      res.status(500).json({ error: 'Failed to fetch earnings' });
    }
  }

  async requestPayout(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      await restaurantService.requestPayout(restaurant.id, req.body);
      res.json({ success: true, message: 'Payout request submitted' });
    } catch (error) {
      console.error('Error requesting payout:', error);
      res.status(500).json({ error: 'Failed to request payout' });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const analytics = await restaurantService.getAnalytics(restaurant.id);
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      // For now, return empty array - can be extended with notifications
      res.json([]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  async getGeneralSettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const settings = await restaurantService.getSettings(restaurant.id);
      res.json({
        notification: {
          emailAlerts: settings.emailAlerts,
          smsAlerts: settings.smsAlerts,
          pushAlerts: settings.pushAlerts,
        },
        autoAcceptOrders: settings.autoAcceptOrders,
        maxCookingLoad: settings.maxCookingLoad,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  async updateGeneralSettings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const restaurant = await restaurantService.getRestaurantByOwnerId(userId);

      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      const { notification, autoAcceptOrders, maxCookingLoad } = req.body;

      await restaurantService.updateSettings(restaurant.id, {
        emailAlerts: notification?.emailAlerts,
        smsAlerts: notification?.smsAlerts,
        pushAlerts: notification?.pushAlerts,
        autoAcceptOrders,
        maxCookingLoad,
      });

      res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }
}

export const restaurantController = new RestaurantController();
