import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { uploadService } from './uploadService';
import { socketService } from './socketService';

export class RestaurantService {
  // Get restaurant by owner user ID
  async getRestaurantByOwnerId(ownerId: number) {
    return prisma.restaurant.findUnique({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  // Get restaurant profile with extended info
  async getRestaurantProfile(ownerId: number) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!restaurant) return null;

    // Get restaurant profile if exists
    const profile = await prisma.restaurantProfile.findUnique({
      where: { userId: ownerId },
    });

    return {
      restaurant,
      profile,
    };
  }

  // Update restaurant profile
  async updateRestaurantProfile(ownerId: number, data: any) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId },
    });

    if (!restaurant) throw new Error('Restaurant not found');

    // Handle logo image upload if base64 data is provided
    let logoUrl = data.logoUrl;
    if (logoUrl && logoUrl.startsWith('data:image/')) {
      try {
        logoUrl = await uploadService.uploadImage(logoUrl, 'restaurants/logos');
      } catch (error) {
        console.error('Failed to upload logo image:', error);
        logoUrl = undefined; // Keep existing if upload fails
      }
    }

    // Handle cover photo upload if base64 data is provided
    let coverPhotoUrl = data.coverPhotoUrl;
    if (coverPhotoUrl && coverPhotoUrl.startsWith('data:image/')) {
      try {
        coverPhotoUrl = await uploadService.uploadImage(coverPhotoUrl, 'restaurants/covers');
      } catch (error) {
        console.error('Failed to upload cover photo:', error);
        coverPhotoUrl = undefined; // Keep existing if upload fails
      }
    }

    // Update restaurant basic info
    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: data.name,
        address: data.address,
      },
    });

    // Build profile update data
    const profileUpdateData: any = {
      businessName: data.name,
      address: data.address,
      cuisine: data.category ? [data.category] : undefined,
      openingHours: data.openingHours && data.closingHours 
        ? { opening: data.openingHours, closing: data.closingHours } 
        : undefined,
    };

    // Only update storefrontImage if a new image was uploaded or URL was provided
    if (logoUrl !== undefined) {
      profileUpdateData.storefrontImage = logoUrl || null;
    }

    // Update or create restaurant profile
    const profile = await prisma.restaurantProfile.upsert({
      where: { userId: ownerId },
      create: {
        userId: ownerId,
        businessName: data.name,
        address: data.address,
        cuisine: data.category ? [data.category] : [],
        openingHours: data.openingHours && data.closingHours 
          ? { opening: data.openingHours, closing: data.closingHours } 
          : Prisma.JsonNull,
        deliveryOptions: ['DELIVERY', 'PICKUP'],
        storefrontImage: logoUrl || null,
      },
      update: profileUpdateData,
    });

    return { restaurant: updated, profile, logoUrl, coverPhotoUrl };
  }

  // Dashboard stats
  async getStats(restaurantId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [ordersToday, activeOrders, totalEarningsToday, pendingMenuItems, weeklyOrders, popularDishes, hourlyOrders] = await Promise.all([
      prisma.order.count({
        where: {
          restaurantId,
          createdAt: { gte: today },
        },
      }),
      prisma.order.count({
        where: {
          restaurantId,
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
        },
      }),
      prisma.order.aggregate({
        where: {
          restaurantId,
          createdAt: { gte: today },
          status: { notIn: ['CANCELLED'] },
        },
        _sum: { totalCents: true },
      }),
      prisma.menuItem.count({
        where: {
          restaurantId,
          available: false,
        },
      }),
      // Weekly orders for earnings chart
      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: sevenDaysAgo },
          status: { notIn: ['CANCELLED'] },
        },
        select: {
          createdAt: true,
          totalCents: true,
        },
      }),
      // Popular dishes
      prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            restaurantId,
            createdAt: { gte: sevenDaysAgo },
            status: { notIn: ['CANCELLED'] },
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 4,
      }),
      // Hourly orders for frequency chart
      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: sevenDaysAgo },
          status: { notIn: ['CANCELLED'] },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Calculate weekly earnings by day
    const weeklyEarningsMap = new Map<string, number>();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    weeklyOrders.forEach(order => {
      const dayName = days[order.createdAt.getDay()];
      const currentEarnings = weeklyEarningsMap.get(dayName) || 0;
      weeklyEarningsMap.set(dayName, currentEarnings + order.totalCents);
    });

    const weeklyEarnings = days.map(day => ({
      week: day,
      earnings: Math.round((weeklyEarningsMap.get(day) || 0) / 100),
    }));

    // Get dish names for popular dishes
    const dishIds = popularDishes.map(d => d.menuItemId);
    const dishes = await prisma.menuItem.findMany({
      where: { id: { in: dishIds } },
      select: { id: true, name: true },
    });

    const dishMap = new Map(dishes.map(d => [d.id, d.name]));
    const popularDishesData = popularDishes.map(d => ({
      name: dishMap.get(d.menuItemId) || 'Unknown',
      orders: d._sum.quantity || 0,
    }));

    // Calculate hourly order frequency
    const hourlyMap = new Map<number, number>();
    hourlyOrders.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    const orderFrequency = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: hourlyMap.get(hour) || 0,
    })).filter(item => item.orders > 0);

    return {
      totalOrdersToday: ordersToday,
      activeOrders,
      earningsToday: Math.round((totalEarningsToday._sum.totalCents || 0) / 100),
      pendingMenuItems,
      weeklyEarnings,
      popularDishes: popularDishesData,
      orderFrequency: orderFrequency.length > 0 ? orderFrequency : [
        { hour: '10:00', orders: 0 },
        { hour: '12:00', orders: 0 },
        { hour: '18:00', orders: 0 },
      ],
    };
  }

  // Menu operations
  async getMenu(restaurantId: number) {
    const items = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      category: item.category || 'SPECIAL',
      price: Math.round(item.priceCents / 100),
      cookingTime: item.cookingTime || 15,
      spiceLevel: item.spiceLevel || 'MEDIUM',
      rating: item.rating,
      isAvailable: item.available,
      imageUrl: item.imageUrl || 'https://placehold.co/64',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createMenuItem(restaurantId: number, data: any) {
    // Handle image upload if base64 data is provided
    let imageUrl = data.imageUrl || null;
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      try {
        imageUrl = await uploadService.uploadImage(imageUrl, 'menu-items');
      } catch (error) {
        console.error('Failed to upload menu item image:', error);
        imageUrl = null;
      }
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: data.name,
        description: data.description,
        priceCents: Math.round(data.price * 100),
        category: data.category,
        cookingTime: data.cookingTime,
        spiceLevel: data.spiceLevel,
        rating: 0,
        available: data.isAvailable !== false,
        imageUrl: imageUrl,
        tags: [],
      },
    });

    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      category: item.category || 'SPECIAL',
      price: Math.round(item.priceCents / 100),
      cookingTime: item.cookingTime || 15,
      spiceLevel: item.spiceLevel || 'MEDIUM',
      rating: item.rating,
      isAvailable: item.available,
      imageUrl: item.imageUrl || 'https://placehold.co/64',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateMenuItem(itemId: number, restaurantId: number, data: any) {
    // Verify ownership
    const existing = await prisma.menuItem.findFirst({
      where: { id: itemId, restaurantId },
    });

    if (!existing) throw new Error('Menu item not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.priceCents = Math.round(data.price * 100);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.cookingTime !== undefined) updateData.cookingTime = data.cookingTime;
    if (data.spiceLevel !== undefined) updateData.spiceLevel = data.spiceLevel;
    if (data.isAvailable !== undefined) updateData.available = data.isAvailable;
    
    // Handle image upload if base64 data is provided
    if (data.imageUrl !== undefined) {
      if (data.imageUrl && data.imageUrl.startsWith('data:image/')) {
        try {
          updateData.imageUrl = await uploadService.uploadImage(data.imageUrl, 'menu-items');
        } catch (error) {
          console.error('Failed to upload menu item image:', error);
          // Keep the existing image if upload fails
        }
      } else {
        updateData.imageUrl = data.imageUrl;
      }
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      category: item.category || 'SPECIAL',
      price: Math.round(item.priceCents / 100),
      cookingTime: item.cookingTime || 15,
      spiceLevel: item.spiceLevel || 'MEDIUM',
      rating: item.rating,
      isAvailable: item.available,
      imageUrl: item.imageUrl || 'https://placehold.co/64',
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteMenuItems(itemIds: number[], restaurantId: number) {
    await prisma.menuItem.deleteMany({
      where: {
        id: { in: itemIds },
        restaurantId,
      },
    });
  }

  // Orders operations
  async getOrders(restaurantId: number) {
    const orders = await prisma.order.findMany({
      where: { restaurantId },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
        rider: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return orders.map((order) => {
      // Map database OrderStatus to frontend OrderStatus
      let frontendStatus: string;
      switch (order.status) {
        case 'PENDING':
          frontendStatus = 'PENDING';
          break;
        case 'CONFIRMED':
          frontendStatus = 'ACCEPTED';
          break;
        case 'PREPARING':
          frontendStatus = 'COOKING';
          break;
        case 'READY':
          frontendStatus = 'READY_FOR_PICKUP';
          break;
        case 'DELIVERED':
          frontendStatus = 'COMPLETED';
          break;
        case 'CANCELLED':
          frontendStatus = 'COMPLETED'; // or handle separately
          break;
        default:
          frontendStatus = 'PENDING';
      }

      return {
        id: `ORD-${order.id}`,
        customerName: order.user.name,
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
        })),
        totalPrice: Math.round(order.totalCents / 100),
        paymentStatus: 'PAID', // Simplified for now
        status: frontendStatus,
        deliveryType: 'DELIVERY', // Default
        placedTime: order.createdAt.toISOString(),
        customerNotes: undefined,
        deliveryAddress: undefined,
        riderName: order.rider?.user.name,
        riderPhone: order.rider?.user.phone || undefined,
        riderLocation: order.rider?.lat && order.rider?.lng
          ? { lat: order.rider.lat, lng: order.rider.lng }
          : undefined,
      };
    });
  }

  async updateOrderStatus(orderId: number, restaurantId: number, status: string) {
    // Verify ownership
    const existing = await prisma.order.findFirst({
      where: { id: orderId, restaurantId },
    });

    if (!existing) throw new Error('Order not found');

    // Map frontend status to database status
    let dbStatus: string;
    switch (status) {
      case 'PENDING':
        dbStatus = 'PENDING';
        break;
      case 'ACCEPTED':
        dbStatus = 'CONFIRMED';
        break;
      case 'COOKING':
        dbStatus = 'PREPARING';
        break;
      case 'READY_FOR_PICKUP':
        dbStatus = 'READY';
        break;
      case 'COMPLETED':
        dbStatus = 'DELIVERED';
        break;
      default:
        dbStatus = status;
    }

    // Get restaurant name for notification
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { name: true },
    });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: dbStatus as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
              },
            },
          },
        },
        rider: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Send real-time notification to customer
    const statusMessages: Record<string, string> = {
      PENDING: 'Your order has been placed',
      CONFIRMED: 'Restaurant confirmed your order',
      PREPARING: 'Your order is being prepared',
      READY: 'Your order is ready for pickup',
      ASSIGNED: 'A rider has been assigned',
      PICKED_UP: 'Your order is on the way!',
      DELIVERED: 'Your order has been delivered',
      CANCELLED: 'Your order has been cancelled',
    };

    socketService.sendOrderNotification(order.user.id, {
      orderId: order.id,
      restaurantName: restaurant?.name || 'Restaurant',
      status: dbStatus,
      message: statusMessages[dbStatus] || 'Order status updated',
    });

    return {
      id: `ORD-${order.id}`,
      customerName: order.user.name,
      items: order.items.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
      })),
      totalPrice: Math.round(order.totalCents / 100),
      paymentStatus: 'PAID',
      status,
      deliveryType: 'DELIVERY',
      placedTime: order.createdAt.toISOString(),
      riderName: order.rider?.user.name,
      riderPhone: order.rider?.user.phone || undefined,
      riderLocation: order.rider?.lat && order.rider?.lng
        ? { lat: order.rider.lat, lng: order.rider.lng }
        : undefined,
    };
  }

  // Earnings
  async getEarnings(restaurantId: number) {
    const orders = await prisma.order.findMany({
      where: {
        restaurantId,
        status: { notIn: ['CANCELLED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const platformFee = Math.round(totalEarnings * 0.15);

    const rows = orders.map((order) => {
      const amount = Math.round(order.totalCents / 100);
      const commission = Math.round(amount * 0.15);
      return {
        id: `ORD-${order.id}`,
        amount,
        commission,
        netEarned: amount - commission,
        date: order.createdAt.toISOString(),
      };
    });

    return {
      summary: {
        totalEarnings: Math.round(totalEarnings / 100),
        platformFee: Math.round(platformFee / 100),
        payoutBalance: Math.round((totalEarnings - platformFee) / 100),
        pendingPayouts: 0,
      },
      rows,
    };
  }

  async requestPayout(restaurantId: number, data: any) {
    await prisma.payout.create({
      data: {
        restaurantId,
        amount: Math.round(data.amount * 100),
        method: data.method,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        status: 'PENDING',
      },
    });
  }

  // Analytics
  async getAnalytics(restaurantId: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [orders, menuItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ['CANCELLED'] },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      }),
      prisma.menuItem.findMany({
        where: { restaurantId },
      }),
    ]);

    // Calculate top selling dish
    const dishCounts: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        dishCounts[item.menuItem.name] = (dishCounts[item.menuItem.name] || 0) + item.quantity;
      });
    });

    const topDish = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0];

    // Sales by category
    const categoryCounts: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.menuItem.category || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
    });

    const salesByCategory = Object.entries(categoryCounts).map(([label, value]) => ({
      label,
      value,
    }));

    // Peak ordering hours
    const hourCounts: Record<string, number> = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourCounts[hourKey] = (hourCounts[hourKey] || 0) + 1;
    });

    const peakOrderingHours = Object.entries(hourCounts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));

    // Monthly overview (last 4 months)
    const monthlyData: Record<string, number> = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString('en', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + order.totalCents;
    });

    const monthlyOverview = Object.entries(monthlyData).map(([label, value]) => ({
      label,
      value: Math.round(value / 100),
    }));

    return {
      topSellingDish: topDish?.[0] || 'N/A',
      salesByCategory,
      peakOrderingHours,
      monthlyOverview,
      repeatCustomerRate: 62, // Placeholder
      deliveryTimePerformance: 82, // Placeholder
    };
  }

  // Settings
  async getSettings(restaurantId: number) {
    const settings = await prisma.restaurantSettings.findUnique({
      where: { restaurantId },
    });

    if (!settings) {
      // Create default settings
      return prisma.restaurantSettings.create({
        data: { restaurantId },
      });
    }

    return settings;
  }

  async updateSettings(restaurantId: number, data: any) {
    return prisma.restaurantSettings.upsert({
      where: { restaurantId },
      create: {
        restaurantId,
        emailAlerts: data.emailAlerts,
        smsAlerts: data.smsAlerts,
        pushAlerts: data.pushAlerts,
        autoAcceptOrders: data.autoAcceptOrders,
        maxCookingLoad: data.maxCookingLoad,
      },
      update: {
        emailAlerts: data.emailAlerts,
        smsAlerts: data.smsAlerts,
        pushAlerts: data.pushAlerts,
        autoAcceptOrders: data.autoAcceptOrders,
        maxCookingLoad: data.maxCookingLoad,
      },
    });
  }

  async deleteRestaurantAccount(userId: number) {
    // Get the restaurant first
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: userId },
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Delete in a transaction to ensure all related data is removed
    await prisma.$transaction(async (tx) => {
      // Delete restaurant settings
      await tx.restaurantSettings.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      // Delete menu items
      await tx.menuItem.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      // Delete order items related to orders from this restaurant
      const orders = await tx.order.findMany({
        where: { restaurantId: restaurant.id },
        select: { id: true },
      });
      const orderIds = orders.map((o) => o.id);
      
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { orderId: { in: orderIds } },
        });
      }

      // Delete orders
      await tx.order.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      // Delete admin notifications related to this restaurant
      await tx.adminNotification.deleteMany({
        where: { restaurantId: restaurant.id },
      });

      // Delete restaurant profile
      await tx.restaurantProfile.deleteMany({
        where: { userId },
      });

      // Delete the restaurant
      await tx.restaurant.delete({
        where: { id: restaurant.id },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });
  }
}

export const restaurantService = new RestaurantService();
