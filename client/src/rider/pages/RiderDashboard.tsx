import { Package, DollarSign, TrendingUp, Clock, MapPin, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

const stats = [
    {
        label: "Today's Deliveries",
        value: "8",
        change: "+2 from yesterday",
        icon: Package,
        color: "text-green-600",
        bgColor: "bg-green-100",
    },
    {
        label: "Today's Earnings",
        value: "৳640",
        change: "+12% from yesterday",
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
    },
    {
        label: "This Week",
        value: "৳4,250",
        change: "42 deliveries",
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
    },
    {
        label: "Avg. Delivery Time",
        value: "28 min",
        change: "-3 min improvement",
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
    },
];

const activeRequests = [
    {
        id: "ORD-12345",
        restaurant: "Dhaka Spice House",
        customer: "Kamal Ahmed",
        pickupAddress: "House 42, Road 12, Dhanmondi",
        deliveryAddress: "House 15, Road 5, Mohammadpur",
        earning: 80,
        distance: "3.2 km",
        time: "2 min ago",
    },
    {
        id: "ORD-12346",
        restaurant: "Burger Junction",
        customer: "Fatima Rahman",
        pickupAddress: "Shop 8, Mirpur Road",
        deliveryAddress: "Flat 5B, Shyamoli",
        earning: 60,
        distance: "2.1 km",
        time: "5 min ago",
    },
];

export function RiderDashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rider Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's your delivery overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{stat.label}</CardTitle>
                                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-slate-500">{stat.change}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Active Delivery Requests */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Active Delivery Requests
                    </CardTitle>
                    <CardDescription>New orders available for pickup</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeRequests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-lg border border-slate-200 p-4 transition-all hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-green-600">{request.id}</Badge>
                                            <span className="font-semibold text-slate-900">{request.restaurant}</span>
                                            <span className="text-sm text-slate-500">{request.time}</span>
                                        </div>

                                        <div className="grid gap-2 md:grid-cols-2">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 text-green-600 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">Pickup</p>
                                                    <p className="text-sm text-slate-900">{request.pickupAddress}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500">Delivery</p>
                                                    <p className="text-sm text-slate-900">{request.deliveryAddress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                <span>{request.customer}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="font-medium text-green-600">৳{request.earning}</span>
                                            <span>•</span>
                                            <span>{request.distance}</span>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col gap-2">
                                        <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                                            Accept
                                        </button>
                                        <button className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {activeRequests.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="mb-4 h-12 w-12 text-slate-300" />
                            <p className="text-lg font-medium text-slate-600">No active requests</p>
                            <p className="text-sm text-slate-500">New delivery requests will appear here</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="cursor-pointer transition-all hover:shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-3 rounded-full bg-green-100 p-3">
                            <Package className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">View All Deliveries</h3>
                        <p className="text-sm text-slate-500">See active and pending orders</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-3 rounded-full bg-blue-100 p-3">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">View Earnings</h3>
                        <p className="text-sm text-slate-500">Track your income</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="mb-3 rounded-full bg-purple-100 p-3">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900">Delivery History</h3>
                        <p className="text-sm text-slate-500">View past deliveries</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
