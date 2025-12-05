import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface UserSocket {
    socket: Socket;
    userId: number;
    role: string;
}

class SocketService {
    private io: Server | null = null;
    private userSockets: Map<number, Socket[]> = new Map();

    initialize(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.use(this.authenticate.bind(this));
        this.io.on('connection', this.handleConnection.bind(this));

        console.log('Socket.IO initialized');
    }

    private authenticate(socket: Socket, next: (err?: Error) => void) {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
                userId: number;
                role: string;
            };
            
            (socket as any).userId = decoded.userId;
            (socket as any).role = decoded.role;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    }

    private handleConnection(socket: Socket) {
        const userId = (socket as any).userId;
        const role = (socket as any).role;

        console.log(`User ${userId} (${role}) connected via WebSocket`);

        // Store socket for this user (support multiple connections per user)
        const existingSockets = this.userSockets.get(userId) || [];
        existingSockets.push(socket);
        this.userSockets.set(userId, existingSockets);

        // Join user-specific room for targeted notifications
        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
            const sockets = this.userSockets.get(userId) || [];
            const index = sockets.indexOf(socket);
            if (index > -1) {
                sockets.splice(index, 1);
            }
            if (sockets.length === 0) {
                this.userSockets.delete(userId);
            } else {
                this.userSockets.set(userId, sockets);
            }
        });

        // Handle acknowledgment of notification receipt
        socket.on('notification:ack', (notificationId: string) => {
            console.log(`User ${userId} acknowledged notification ${notificationId}`);
        });
    }

    // Send notification to a specific user
    sendToUser(userId: number, event: string, data: any) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
            console.log(`Sent ${event} to user ${userId}:`, data);
        }
    }

    // Send notification to all users with a specific role
    sendToRole(role: string, event: string, data: any) {
        if (this.io) {
            this.io.to(`role:${role}`).emit(event, data);
        }
    }

    // Send order status update notification to customer
    sendOrderNotification(userId: number, notification: {
        orderId: number;
        restaurantName: string;
        status: string;
        message: string;
    }) {
        this.sendToUser(userId, 'order:statusUpdate', {
            id: `notif-${Date.now()}-${notification.orderId}`,
            orderId: `ORD-${notification.orderId}`,
            restaurantName: notification.restaurantName,
            status: notification.status,
            message: notification.message,
            timestamp: new Date().toISOString(),
            isRead: false,
        });
    }

    // Check if a user is currently connected
    isUserOnline(userId: number): boolean {
        return this.userSockets.has(userId) && (this.userSockets.get(userId)?.length || 0) > 0;
    }

    getIO(): Server | null {
        return this.io;
    }
}

export const socketService = new SocketService();
