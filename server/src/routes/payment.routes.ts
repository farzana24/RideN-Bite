import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import * as paymentController from "../controllers/payment.controller";

const router = Router();

// Initialize payment (requires auth)
router.post("/initiate", authenticate, requireRole(["CUSTOMER"]), paymentController.initiatePayment);

// SSLCommerz callbacks (no auth - called by SSLCommerz servers)
router.post("/success", paymentController.handleSuccess);
router.post("/fail", paymentController.handleFail);
router.post("/cancel", paymentController.handleCancel);
router.post("/ipn", paymentController.handleIPN);

// Admin refund endpoint
router.post("/refund", authenticate, requireRole(["ADMIN"]), paymentController.refundPayment);

export default router;
