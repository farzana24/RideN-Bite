import axios from "axios";
import { prisma } from "../lib/prisma";

// SSLCommerz Configuration
const SSLCOMMERZ_STORE_ID = process.env.SSLCOMMERZ_STORE_ID || "your_store_id";
const SSLCOMMERZ_STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || "your_store_password";
const SSLCOMMERZ_IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX === "true";

const SSLCOMMERZ_BASE_URL = SSLCOMMERZ_IS_SANDBOX
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

export interface PaymentInitData {
    orderId: number;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    productName: string;
}

export interface SSLCommerzResponse {
    status: string;
    GatewayPageURL?: string;
    sessionkey?: string;
    faession?: string;
    desc?: string;
}

export async function initializePayment(data: PaymentInitData): Promise<SSLCommerzResponse> {
    const transactionId = `TXN_${data.orderId}_${Date.now()}`;

    const postData = {
        store_id: SSLCOMMERZ_STORE_ID,
        store_passwd: SSLCOMMERZ_STORE_PASSWORD,
        total_amount: data.amount / 100, // Convert cents to BDT
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${SERVER_URL}/api/payment/success`,
        fail_url: `${SERVER_URL}/api/payment/fail`,
        cancel_url: `${SERVER_URL}/api/payment/cancel`,
        ipn_url: `${SERVER_URL}/api/payment/ipn`,
        cus_name: data.customerName,
        cus_email: data.customerEmail,
        cus_phone: data.customerPhone,
        cus_add1: data.customerAddress,
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: data.productName,
        product_category: "Food",
        product_profile: "general",
        value_a: data.orderId.toString(), // Custom value to pass order ID
    };

    try {
        const response = await axios.post(
            `${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`,
            new URLSearchParams(postData as any).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (response.data.status === "SUCCESS") {
            // Update payment with transaction ID
            await prisma.payment.update({
                where: { orderId: data.orderId },
                data: {
                    transactionId,
                    status: "INITIATED",
                },
            });
        }

        return response.data;
    } catch (error: any) {
        console.error("SSLCommerz init error:", error);
        throw new Error("Failed to initialize payment");
    }
}

export async function validatePayment(validationId: string): Promise<boolean> {
    try {
        const response = await axios.get(
            `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php`,
            {
                params: {
                    val_id: validationId,
                    store_id: SSLCOMMERZ_STORE_ID,
                    store_passwd: SSLCOMMERZ_STORE_PASSWORD,
                    format: "json",
                },
            }
        );

        return response.data.status === "VALID" || response.data.status === "VALIDATED";
    } catch (error: any) {
        console.error("SSLCommerz validation error:", error);
        return false;
    }
}

export async function handlePaymentSuccess(data: any) {
    const { val_id, tran_id, value_a: orderId, amount, card_type, bank_tran_id } = data;

    // Validate the payment
    const isValid = await validatePayment(val_id);

    if (!isValid) {
        throw new Error("Payment validation failed");
    }

    // Update payment status
    const payment = await prisma.payment.update({
        where: { orderId: parseInt(orderId) },
        data: {
            transactionId: tran_id,
            status: "COMPLETED",
        },
    });

    // Update order status to CONFIRMED
    await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: "CONFIRMED" },
    });

    return { orderId: parseInt(orderId), payment };
}

export async function handlePaymentFail(data: any) {
    const { value_a: orderId, tran_id, error } = data;

    // Update payment status
    await prisma.payment.update({
        where: { orderId: parseInt(orderId) },
        data: {
            transactionId: tran_id,
            status: "FAILED",
        },
    });

    // Update order status
    await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: "CANCELLED" },
    });

    return { orderId: parseInt(orderId), error };
}

export async function handlePaymentCancel(data: any) {
    const { value_a: orderId, tran_id } = data;

    // Update payment status
    await prisma.payment.update({
        where: { orderId: parseInt(orderId) },
        data: {
            transactionId: tran_id,
            status: "CANCELLED",
        },
    });

    // Keep order as PENDING so user can retry
    return { orderId: parseInt(orderId) };
}

export async function handleIPN(data: any) {
    // Instant Payment Notification - called by SSLCommerz server
    const { val_id, tran_id, value_a: orderId, status } = data;

    if (status === "VALID" || status === "VALIDATED") {
        const isValid = await validatePayment(val_id);
        if (isValid) {
            await prisma.payment.update({
                where: { orderId: parseInt(orderId) },
                data: {
                    transactionId: tran_id,
                    status: "COMPLETED",
                },
            });

            await prisma.order.update({
                where: { id: parseInt(orderId) },
                data: { status: "CONFIRMED" },
            });
        }
    }

    return { received: true };
}

export async function refundPayment(orderId: number, refundAmount?: number) {
    const payment = await prisma.payment.findUnique({
        where: { orderId },
        include: { order: true },
    });

    if (!payment || payment.status !== "COMPLETED") {
        throw new Error("Payment not found or not completed");
    }

    const refundAmountCents = refundAmount || payment.amountCents;

    try {
        const response = await axios.post(
            `${SSLCOMMERZ_BASE_URL}/validator/api/merchantTransIDvalidationAPI.php`,
            new URLSearchParams({
                store_id: SSLCOMMERZ_STORE_ID,
                store_passwd: SSLCOMMERZ_STORE_PASSWORD,
                tran_id: payment.transactionId!,
                format: "json",
            } as any).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (response.data.element && response.data.element.length > 0) {
            const bankTranId = response.data.element[0].bank_tran_id;

            // Initiate refund
            const refundResponse = await axios.post(
                `${SSLCOMMERZ_BASE_URL}/validator/api/merchantTransIDvalidationAPI.php`,
                new URLSearchParams({
                    bank_tran_id: bankTranId,
                    refund_amount: (refundAmountCents / 100).toString(),
                    refund_remarks: "Order cancelled",
                    store_id: SSLCOMMERZ_STORE_ID,
                    store_passwd: SSLCOMMERZ_STORE_PASSWORD,
                    format: "json",
                } as any).toString(),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            if (refundResponse.data.status === "success") {
                await prisma.payment.update({
                    where: { orderId },
                    data: { status: "REFUNDED" },
                });

                return { success: true, refundId: refundResponse.data.refund_ref_id };
            }
        }

        throw new Error("Refund failed");
    } catch (error: any) {
        console.error("Refund error:", error);
        throw new Error("Failed to process refund");
    }
}
