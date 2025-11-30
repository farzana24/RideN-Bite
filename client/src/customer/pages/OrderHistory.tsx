import { useState } from "react";
import { Package, Search, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../admin/components/ui/table";
import { Badge } from "../../admin/components/ui/badge";

const orders = [
    {
        id: "ORD-12345",
        restaurant: "Dhaka Spice House",
        items: 3,
        total: 850,
        status: "delivered",
        date: "2025-11-28",
    },
    {
        id: "ORD-12344",
        restaurant: "Burger Junction",
        items: 2,
        total: 680,
        status: "delivered",
        date: "2025-11-25",
    },
    {
        id: "ORD-12343",
        restaurant: "Grill Masters",
        items: 4,
        total: 1250,
        status: "cancelled",
        date: "2025-11-22",
    },
    {
        id: "ORD-12342",
        restaurant: "Chinese Express",
        items: 2,
        total: 560,
        status: "delivered",
        date: "2025-11-20",
    },
];

export function OrderHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-500";
            case "cancelled":
                return "bg-red-500";
            case "cooking":
                return "bg-orange-500";
            default:
                return "bg-slate-500";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <p className="text-slate-500">
                    View and track all your previous orders
                </p>
            </div>

            {/* Filters Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            >
                                <option value="all">All Status</option>
                                <option value="delivered">Delivered</option>
                                <option value="cooking">Cooking</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                                <Calendar className="h-4 w-4" />
                                Date Range
                            </button>
                            <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                                <Filter className="h-4 w-4" />
                                More Filters
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-600" />
                        Your Orders ({orders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Restaurant</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.restaurant}</TableCell>
                                    <TableCell>{order.items} items</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusBadgeClass(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">৳{order.total}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(order.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button className="text-sm text-orange-600 hover:underline">
                                                View Details
                                            </button>
                                            {order.status === "delivered" && (
                                                <button className="text-sm text-orange-600 hover:underline">
                                                    Reorder
                                                </button>
                                            )}
                                        </div>
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
