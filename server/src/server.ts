import 'dotenv/config';
import { createServer } from 'http';
import { app, logger } from './app';
import { socketService } from './services/socketService';

const PORT = process.env.PORT || 4000;

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
socketService.initialize(httpServer);

httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info('WebSocket server initialized');
});
