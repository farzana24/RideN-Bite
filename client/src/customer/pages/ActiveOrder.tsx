import { MapPin, Phone, Clock, CheckCircle2, Package, Truck, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

const orderDetails = {
    id: "ORD-12345",
    restaurant: {
        name: "Dhaka Spice House",
        phone: "+880 1712-345678",
        address: "House 42, Road 12, Dhanmondi, Dhaka",
    },
    rider: {
        name: "Kamal Ahmed",
        phone: "+880 1812-345678",
        vehicle: "Motorcycle - DHK 1234",
    },
    status: "on_the_way",
    estimatedTime: "15 mins",
    items: [
        { name: "Beef Biryani", quantity: 2, price: 350 },
        { name: "Chicken Tikka", quantity: 1, price: 280 },
        { name: "Naan Bread", quantity: 3, price: 30 },
    ],
    subtotal: 980,
    deliveryFee: 50,
    total: 1030,
    deliveryAddress: "House 15, Road 5, Mohammadpur, Dhaka 1207",
};

const timeline = [
    { label: "Order Placed", time: "12:30 PM", status: "completed", icon: Package },
    { label: "Preparing Food", time: "12:35 PM", status: "completed", icon: Clock },
    { label: "Food Ready", time: "12:55 PM", status: "completed", icon: CheckCircle2 },
    { label: "On The Way", time: "1:05 PM", status: "current", icon: Truck },
    { label: "Delivered", time: "Est. 1:20 PM", status: "pending", icon: Home },
];

export function ActiveOrder() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Tracking</h1>
                    <p className="text-slate-500">Order #{orderDetails.id}</p>
                </div>
                <Badge className="bg-orange-600 text-lg px-4 py-2">
                    Arriving in {orderDetails.estimatedTime}
                </Badge>
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
                                                            isCompleted || isCurrent ? "text-white" : "text-slate-400"
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
                                                            isCurrent ? "text-orange-600" : isPending ? "text-slate-400" : ""
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </h3>
                                                    <span className="text-sm text-slate-500">{step.time}</span>
                                                </div>
                                                {isCurrent && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Your rider is on the way to your location
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
                                {orderDetails.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold">৳{item.price * item.quantity}</p>
                                    </div>
                                ))}

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span>৳{orderDetails.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Delivery Fee</span>
                                        <span>৳{orderDetails.deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>৳{orderDetails.total}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
                            <p className="text-sm text-slate-600">{orderDetails.deliveryAddress}</p>
                        </CardContent>
                    </Card>

                    {/* Restaurant Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Restaurant</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">{orderDetails.restaurant.name}</p>
                                <p className="text-sm text-slate-500">{orderDetails.restaurant.address}</p>
                            </div>
                            <button className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                                <Phone className="h-4 w-4" />
                                {orderDetails.restaurant.phone}
                            </button>
                        </CardContent>
                    </Card>

                    {/* Rider Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Rider</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                    <span className="text-lg font-bold text-orange-600">
                                        {orderDetails.rider.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold">{orderDetails.rider.name}</p>
                                    <p className="text-sm text-slate-500">{orderDetails.rider.vehicle}</p>
                                </div>
                            </div>
                            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                                <Phone className="h-4 w-4" />
                                Call Rider
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
