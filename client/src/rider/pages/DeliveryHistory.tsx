import { Search, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../admin/components/ui/table";
import { Badge } from "../../admin/components/ui/badge";
import { useState } from "react";

const deliveries = [
    {
        id: "DEL-045",
        orderId: "ORD-12345",
        restaurant: "Dhaka Spice House",
        customer: "Kamal Ahmed",
        date: "2025-11-28",
        earning: 80,
        distance: "3.2 km",
        status: "delivered",
    },
    {
        id: "DEL-044",
        orderId: "ORD-12344",
        restaurant: "Burger Junction",
        customer: "Fatima Rahman",
        date: "2025-11-28",
        earning: 60,
        distance: "2.1 km",
        status: "delivered",
    },
    {
        id: "DEL-043",
        orderId: "ORD-12343",
        restaurant: "Pizza Paradise",
        customer: "Rahim Khan",
        date: "2025-11-27",
        earning: 70,
        distance: "4.5 km",
        status: "delivered",
    },
    {
        id: "DEL-042",
        orderId: "ORD-12342",
        restaurant: "Grill Masters",
        customer: "Nasrin Akter",
        date: "2025-11-27",
        earning: 90,
        distance: "5.2 km",
        status: "delivered",
    },
];

export function DeliveryHistory() {
    const [searchTerm, setSearchTerm] = useState("");

    const totalEarnings = deliveries.reduce((sum, d) => sum + d.earning, 0);
    const totalDistance = deliveries.reduce((sum, d) => sum + parseFloat(d.distance), 0).toFixed(1);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Delivery History</h1>
                <p className="text-slate-500">View your past deliveries and earnings</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{deliveries.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">৳{totalEarnings}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Distance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalDistance} km</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search deliveries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                            <Calendar className="h-4 w-4" />
                            Filter by Date
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Deliveries Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Deliveries</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Delivery ID</TableHead>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Restaurant</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Distance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Earning</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deliveries.map((delivery) => (
                                <TableRow key={delivery.id}>
                                    <TableCell className="font-medium">{delivery.id}</TableCell>
                                    <TableCell>{delivery.orderId}</TableCell>
                                    <TableCell>{delivery.restaurant}</TableCell>
                                    <TableCell>{delivery.customer}</TableCell>
                                    <TableCell>{delivery.distance}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500">Delivered</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-green-600">৳{delivery.earning}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(delivery.date).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
