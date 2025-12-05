import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

class SocketService {
    public socket: Socket | null = null;
    private pendingListeners: Map<string, ((data: any) => void)[]> = new Map();

    connect(token: string) {
        if (this.socket?.connected) return;

        // Disconnect existing socket if any
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
        });

        // Register any pending listeners
        this.pendingListeners.forEach((callbacks, event) => {
            callbacks.forEach(callback => {
                this.socket?.on(event, callback);
            });
        });
        this.pendingListeners.clear();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.pendingListeners.clear();
    }

    emit(event: string, data: any) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        } else {
            // Store listener to register when socket connects
            const listeners = this.pendingListeners.get(event) || [];
            listeners.push(callback);
            this.pendingListeners.set(event, listeners);
        }
    }

    off(event: string, callback?: (data: any) => void) {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
            } else {
                this.socket.off(event);
            }
        }
        // Also remove from pending listeners
        if (!callback) {
            this.pendingListeners.delete(event);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const socketService = new SocketService();
