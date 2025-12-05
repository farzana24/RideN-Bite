import { MapPin, Phone, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Link } from "react-router-dom";

const activeDeliveries = [
    {
        id: "DEL-001",
        orderId: "ORD-12345",
        restaurant: "Dhaka Spice House",
        customer: "Kamal Ahmed",
        customerPhone: "+880 1712-345678",
        pickupAddress: "House 42, Road 12, Dhanmondi, Dhaka",
        deliveryAddress: "House 15, Road 5, Mohammadpur, Dhaka 1207",
        status: "picked_up",
        earning: 80,
        distance: "3.2 km",
        estimatedTime: "15 min",
    },
];

export function ActiveDeliveries() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "picked_up":
                return <Badge className="bg-blue-500">Picked Up</Badge>;
            case "on_the_way":
                return <Badge className="bg-orange-500">On The Way</Badge>;
            case "delivered":
                return <Badge className="bg-green-500">Delivered</Badge>;
            default:
                return <Badge className="bg-slate-500">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Active Deliveries</h1>
                <p className="text-slate-500">Deliveries currently in progress</p>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
                {activeDeliveries.map((delivery) => (
                    <Card key={delivery.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3">
                                    <span>{delivery.orderId}</span>
                                    {getStatusBadge(delivery.status)}
                                </CardTitle>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-500">Earning</p>
                                    <p className="text-xl font-bold text-green-600">৳{delivery.earning}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Pickup */}
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-semibold text-green-900">Pickup Location</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">{delivery.restaurant}</p>
                                        <p className="text-sm text-slate-600">{delivery.pickupAddress}</p>
                                    </div>

                                    {/* Delivery */}
                                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-red-600" />
                                            <span className="text-sm font-semibold text-red-900">Delivery Location</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">{delivery.customer}</p>
                                        <p className="text-sm text-slate-600">{delivery.deliveryAddress}</p>
                                    </div>
                                </div>

                                {/* Info & Actions */}
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <span>Distance: {delivery.distance}</span>
                                        <span>•</span>
                                        <span>ETA: {delivery.estimatedTime}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={`tel:${delivery.customerPhone}`}
                                            className="flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Call Customer
                                        </a>
                                        <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                            <Navigation className="h-4 w-4" />
                                            Navigate
                                        </button>
                                        <Link
                                            to={`/rider/deliveries/${delivery.id}`}
                                            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {activeDeliveries.length === 0 && (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <MapPin className="mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-lg font-medium text-slate-600">No active deliveries</p>
                            <p className="text-sm text-slate-500">Accept delivery requests to get started</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
