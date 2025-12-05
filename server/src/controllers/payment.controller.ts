import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import * as customerService from "../services/customer.service";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export async function initiatePayment(req: Request, res: Response) {
    try {
        const userId = (req as any).user.userId;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // Get order details
        const order = await customerService.getOrderById(orderId, userId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Get user profile
        const profile = await customerService.getProfile(userId);
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize SSLCommerz payment
        const result = await paymentService.initializePayment({
            orderId: order.id,
            amount: order.totalCents,
            customerName: profile.name,
            customerEmail: profile.email,
            customerPhone: profile.phone || "",
            customerAddress: order.deliveryAddress || "",
            productName: `Order #${order.id} - ${order.restaurant.name}`,
        });

        if (result.status === "SUCCESS" && result.GatewayPageURL) {
            res.json({
                success: true,
                paymentUrl: result.GatewayPageURL,
                sessionKey: result.sessionkey,
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.desc || "Failed to initialize payment",
            });
        }
    } catch (error: any) {
        console.error("Initiate payment error:", error);
        res.status(500).json({ message: error.message || "Failed to initiate payment" });
    }
}

export async function handleSuccess(req: Request, res: Response) {
    try {
        const result = await paymentService.handlePaymentSuccess(req.body);
        // Redirect to client success page
        res.redirect(`${CLIENT_URL}/customer/orders/${result.orderId}?payment=success`);
    } catch (error: any) {
        console.error("Payment success error:", error);
        res.redirect(`${CLIENT_URL}/customer/checkout?payment=failed&error=${encodeURIComponent(error.message)}`);
    }
}

export async function handleFail(req: Request, res: Response) {
    try {
        const result = await paymentService.handlePaymentFail(req.body);
        res.redirect(`${CLIENT_URL}/customer/checkout?payment=failed&orderId=${result.orderId}`);
    } catch (error: any) {
        console.error("Payment fail error:", error);
        res.redirect(`${CLIENT_URL}/customer/checkout?payment=failed`);
    }
}

export async function handleCancel(req: Request, res: Response) {
    try {
        const result = await paymentService.handlePaymentCancel(req.body);
        res.redirect(`${CLIENT_URL}/customer/checkout?payment=cancelled&orderId=${result.orderId}`);
    } catch (error: any) {
        console.error("Payment cancel error:", error);
        res.redirect(`${CLIENT_URL}/customer/checkout?payment=cancelled`);
    }
}

export async function handleIPN(req: Request, res: Response) {
    try {
        await paymentService.handleIPN(req.body);
        res.json({ received: true });
    } catch (error: any) {
        console.error("IPN error:", error);
        res.status(500).json({ error: "IPN processing failed" });
    }
}

export async function refundPayment(req: Request, res: Response) {
    try {
        const { orderId, amount } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        const result = await paymentService.refundPayment(orderId, amount);
        res.json(result);
    } catch (error: any) {
        console.error("Refund error:", error);
        res.status(400).json({ message: error.message || "Refund failed" });
    }
}
