import { MapPin, Phone, CheckCircle2, Package, Navigation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

const delivery = {
    id: "DEL-001",
    orderId: "ORD-12345",
    restaurant: {
        name: "Dhaka Spice House",
        phone: "+880 1712-345678",
        address: "House 42, Road 12, Dhanmondi, Dhaka",
    },
    customer: {
        name: "Kamal Ahmed",
        phone: "+880 1812-345678",
        address: "House 15, Road 5, Mohammadpur, Dhaka 1207",
    },
    status: "picked_up",
    earning: 80,
    distance: "3.2 km",
    estimatedTime: "15 min",
    items: [
        { name: "Beef Biryani", quantity: 2 },
        { name: "Chicken Tikka", quantity: 1 },
        { name: "Naan Bread", quantity: 3 },
    ],
};

const timeline = [
    { label: "Order Accepted", time: "12:30 PM", status: "completed" },
    { label: "Arrived at Restaurant", time: "12:40 PM", status: "completed" },
    { label: "Picked Up", time: "12:55 PM", status: "current" },
    { label: "On The Way", time: "", status: "pending" },
    { label: "Delivered", time: "", status: "pending" },
];

export function CurrentDelivery() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Current Delivery</h1>
                    <p className="text-slate-500">Order #{delivery.orderId}</p>
                </div>
                <Badge className="bg-green-600 px-4 py-2 text-lg">Earning: ৳{delivery.earning}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - 2 columns */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Delivery Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Progress</CardTitle>
                            <CardDescription>Track your delivery status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                {timeline.map((step, index) => {
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
                                                              ? "bg-blue-600 ring-4 ring-blue-100"
                                                              : "bg-slate-200"
                                                    }`}
                                                >
                                                    <CheckCircle2
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
                                                            isCurrent
                                                                ? "text-blue-600"
                                                                : isPending
                                                                  ? "text-slate-400"
                                                                  : ""
                                                        }`}
                                                    >
                                                        {step.label}
                                                    </h3>
                                                    {step.time && <span className="text-sm text-slate-500">{step.time}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex gap-3">
                                <button className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700">
                                    Mark as Delivered
                                </button>
                                <button className="rounded-md border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">
                                    Report Issue
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-600" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {delivery.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Restaurant Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                Pickup Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">{delivery.restaurant.name}</p>
                                <p className="text-sm text-slate-500">{delivery.restaurant.address}</p>
                            </div>
                            <a
                                href={`tel:${delivery.restaurant.phone}`}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                            >
                                <Phone className="h-4 w-4" />
                                {delivery.restaurant.phone}
                            </a>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-red-600" />
                                Delivery Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="font-semibold">{delivery.customer.name}</p>
                                <p className="text-sm text-slate-500">{delivery.customer.address}</p>
                            </div>
                            <a
                                href={`tel:${delivery.customer.phone}`}
                                className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                            >
                                <Phone className="h-4 w-4" />
                                Call Customer
                            </a>
                        </CardContent>
                    </Card>

                    {/* Navigation */}
                    <Card>
                        <CardContent className="p-4">
                            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700">
                                <Navigation className="h-5 w-5" />
                                Open in Maps
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
