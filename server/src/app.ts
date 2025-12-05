import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pino } from 'pino';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import restaurantRoutes from './routes/restaurant.routes';
import customerRoutes from './routes/customer.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();
const logger = pino();

app.use(helmet());
app.use(cors());
// Increase payload limit for image uploads (base64 encoded images can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'RideNBite API is running' });
});

export { app, logger };
