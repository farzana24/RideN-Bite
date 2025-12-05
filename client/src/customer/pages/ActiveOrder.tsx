import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin,
    Phone,
    CheckCircle2,
    Package,
    Truck,
    Home,
    ArrowLeft,
    Loader2,
    XCircle,
    ChefHat,
    Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Button } from "../../admin/components/ui/button";
import { customerApi, type Order } from "../services/customerApi";
import { toast } from "../../admin/components/ui/use-toast";

interface TimelineStep {
    label: string;
    time: string;
    status: "completed" | "current" | "pending";
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

const getOrderTimeline = (order: Order): TimelineStep[] => {
    const steps: TimelineStep[] = [];
    const createdAt = new Date(order.createdAt);
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Order Placed - always completed
    steps.push({
        label: "Order Placed",
        time: formatTime(createdAt),
        status: "completed",
        icon: Package,
    });

    // Determine current status
    const statusOrder = ["PENDING", "CONFIRMED", "PREPARING", "READY", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const isCancelled = order.status === "CANCELLED";

    if (isCancelled) {
        steps.push({
            label: "Order Cancelled",
            time: formatTime(new Date(order.updatedAt)),
            status: "current",
            icon: XCircle,
            description: "This order has been cancelled",
        });
        return steps;
    }

    // Confirmed/Preparing
    steps.push({
        label: "Preparing Food",
        time: currentStatusIndex >= 2 ? formatTime(new Date(createdAt.getTime() + 5 * 60000)) : "",
        status: currentStatusIndex >= 2 ? "completed" : currentStatusIndex === 1 ? "current" : "pending",
        icon: ChefHat,
        description: currentStatusIndex === 1 ? "Restaurant is preparing your order" : undefined,
    });

    // Ready
    steps.push({
        label: "Food Ready",
        time: currentStatusIndex >= 3 ? formatTime(new Date(createdAt.getTime() + 20 * 60000)) : "",
        status: currentStatusIndex >= 3 ? "completed" : currentStatusIndex === 2 ? "current" : "pending",
        icon: CheckCircle2,
        description: currentStatusIndex === 2 ? "Your food is being prepared" : undefined,
    });

    // Picked Up / In Transit
    steps.push({
        label: "On The Way",
        time: currentStatusIndex >= 5 ? formatTime(new Date(createdAt.getTime() + 25 * 60000)) : "",
        status: currentStatusIndex >= 5 ? "completed" : currentStatusIndex === 3 || currentStatusIndex === 4 ? "current" : "pending",
        icon: Truck,
        description: currentStatusIndex === 4 || currentStatusIndex === 5 ? "Your rider is on the way" : undefined,
    });

    // Delivered
    steps.push({
        label: "Delivered",
        time: currentStatusIndex >= 6 ? formatTime(new Date(order.updatedAt)) : "Est. 30 mins",
        status: currentStatusIndex >= 6 ? "completed" : "pending",
        icon: Home,
    });

    return steps;
};

const getEstimatedTime = (status: string): string => {
    switch (status) {
        case "PENDING":
        case "CONFIRMED":
            return "30-40 mins";
        case "PREPARING":
            return "20-30 mins";
        case "READY":
            return "15-20 mins";
        case "PICKED_UP":
        case "IN_TRANSIT":
            return "10-15 mins";
        case "DELIVERED":
            return "Delivered";
        case "CANCELLED":
            return "Cancelled";
        default:
            return "Calculating...";
    }
};

export function ActiveOrder() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const data = await customerApi.getOrderById(orderId);
                setOrder(data);
            } catch (error) {
                console.error("Error fetching order:", error);
                toast({
                    title: "Error",
                    description: "Failed to load order details",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Poll for updates every 10 seconds for active orders
        const interval = setInterval(() => {
            if (order && !["DELIVERED", "CANCELLED"].includes(order.status)) {
                fetchOrder();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [orderId]);

    const handleCancelOrder = async () => {
        if (!order) return;

        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        setCancelling(true);
        try {
            const updatedOrder = await customerApi.cancelOrder(order.id);
            setOrder(updatedOrder);
            toast({
                title: "Order Cancelled",
                description: "Your order has been cancelled successfully",
            });
        } catch (error) {
            console.error("Error cancelling order:", error);
            toast({
                title: "Error",
                description: "Failed to cancel order. It may be too late to cancel.",
                variant: "destructive",
            });
        } finally {
            setCancelling(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!order || !order.restaurant) return;

        setSubmittingReview(true);
        try {
            await customerApi.submitReview({
                orderId: order.id,
                restaurantId: order.restaurant.id,
                rating: reviewRating,
                comment: reviewComment || undefined,
            });
            toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
            });
            setShowReviewModal(false);
        } catch (error) {
            console.error("Error submitting review:", error);
            toast({
                title: "Error",
                description: "Failed to submit review",
                variant: "destructive",
            });
        } finally {
            setSubmittingReview(false);
        }
    };

    const formatPrice = (cents: number) => {
        return `৳${(cents / 100).toFixed(0)}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-slate-500">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Package className="h-12 w-12 text-slate-300" />
                <h2 className="mt-4 text-2xl font-semibold">Order not found</h2>
                <Button onClick={() => navigate("/customer/orders")} className="mt-4">
                    View All Orders
                </Button>
            </div>
        );
    }

    const timeline = getOrderTimeline(order);
    const estimatedTime = getEstimatedTime(order.status);
    const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
    const canReview = order.status === "DELIVERED";

    // Calculate totals
    const subtotal = order.items?.reduce((sum: number, item: { priceCents: number; quantity: number }) => sum + item.priceCents * item.quantity, 0) || 0;
    const deliveryFee = 5000; // 50 taka in cents
    const total = order.totalCents || subtotal + deliveryFee;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
                    <p className="text-slate-500">Order #{order.id.slice(0, 8)}...</p>
                </div>
                {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                    <Badge className="bg-orange-600 text-lg px-4 py-2">
                        {estimatedTime}
                    </Badge>
                )}
                {order.status === "DELIVERED" && (
                    <Badge className="bg-green-500 text-lg px-4 py-2">Delivered</Badge>
                )}
                {order.status === "CANCELLED" && (
                    <Badge className="bg-red-500 text-lg px-4 py-2">Cancelled</Badge>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status</CardTitle>
                            <CardDescription>Track your order in real-time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                {timeline.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = step.status === "completed";
                                    const isCurrent = step.status === "current";
                                    const isPending = step.status === "pending";

                                    return (
                                        <div key={index} className="flex gap-4 pb-8 last:pb-0">
                                            {/* Icon */}
                                            <div className="relative flex flex-col items-center">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                        isCompleted
                                                            ? "bg-green-500"
                                                            : isCurrent
                                                            ? "bg-orange-600 ring-4 ring-orange-100"
                                                            : "bg-slate-200"
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 ${
                                                            isCompleted || isCurrent
                                                                ? "text-white"
                                                                : "text-slate-400"
                                                        }`}
                                                    />
                                                </div>
                                                {index < timeline.length - 1 && (
                                                    <div
                                                        className={`mt-2 h-full w-0.5 ${
                                                            isCompleted ? "bg-green-500" : "bg-slate-200"
                                                        }`}
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center justify-between">
                                                    <h3
                                                        className={`font-semibold ${
                                                            isCurrent
                                                                ? "text-orange-600"
                                                                : isPending
                                                                ? "text-slate-400"
                                                                : ""
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </h3>
                                                    <span className="text-sm text-slate-500">{step.time}</span>
                                                </div>
                                                {step.description && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {step.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items?.map((item: { name?: string; quantity: number; priceCents: number }, index: number) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">
                                            {formatPrice(item.priceCents * item.quantity)}
                                        </p>
                                    </div>
                                ))}

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Delivery Fee</span>
                                        <span>{formatPrice(deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {(canCancel || canReview) && (
                        <div className="flex gap-4">
                            {canCancel && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="flex-1"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Order
                                        </>
                                    )}
                                </Button>
                            )}
                            {canReview && (
                                <Button
                                    onClick={() => setShowReviewModal(true)}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Leave Review
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Delivery Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Delivery Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600">
                                {order.deliveryAddress || "Address not available"}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Restaurant Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Restaurant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">
                                    {order.restaurant?.name || "Unknown Restaurant"}
                                </p>
                                {order.restaurant?.address && (
                                    <p className="text-sm text-slate-500">{order.restaurant.address}</p>
                                )}
                            </div>
                            {order.restaurant?.phone && (
                                <a
                                    href={`tel:${order.restaurant.phone}`}
                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                >
                                    <Phone className="h-4 w-4" />
                                    {order.restaurant.phone}
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rider Info (when assigned) */}
                    {order.rider && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Delivery Rider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                        <span className="text-lg font-bold text-orange-600">
                                            {order.rider.name?.charAt(0) || "R"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{order.rider.name || "Rider"}</p>
                                        <p className="text-sm text-slate-500">Delivery Partner</p>
                                    </div>
                                </div>
                                {order.rider.phone && (
                                    <a
                                        href={`tel:${order.rider.phone}`}
                                        className="flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Call Rider
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Status</span>
                                <Badge
                                    className={
                                        order.paymentStatus === "PAID"
                                            ? "bg-green-500"
                                            : order.paymentStatus === "FAILED"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                    }
                                >
                                    {order.paymentStatus || "PENDING"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Rate Your Experience</CardTitle>
                            <CardDescription>
                                How was your order from {order.restaurant?.name}?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Star Rating */}
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-10 w-10 ${
                                                star <= reviewRating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-slate-300"
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Comment */}
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience (optional)"
                                className="w-full rounded-md border border-slate-200 p-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                rows={4}
                            />

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                >
                                    {submittingReview ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Review"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
