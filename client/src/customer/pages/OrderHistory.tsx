import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Calendar, Loader2, ChevronRight, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../admin/components/ui/table";
import { Badge } from "../../admin/components/ui/badge";
import { Button } from "../../admin/components/ui/button";
import { customerApi, type Order, getOrderStatusLabel } from "../services/customerApi";
import { useCartStore } from "../store/cartStore";
import { toast } from "../../admin/components/ui/use-toast";

export function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const { addItem } = useCartStore();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await customerApi.getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast({
                    title: "Error",
                    description: "Failed to load orders",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-500";
            case "CANCELLED":
                return "bg-red-500";
            case "COOKING":
            case "PREPARING":
                return "bg-orange-500";
            case "PICKED_UP":
            case "IN_TRANSIT":
                return "bg-blue-500";
            case "PENDING":
                return "bg-yellow-500";
            default:
                return "bg-slate-500";
        }
    };

    const formatPrice = (cents: number) => {
        return `৳${(cents / 100).toFixed(0)}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleReorder = async (order: Order) => {
        // Add items to cart
        if (!order.items || order.items.length === 0) {
            toast({
                title: "Cannot reorder",
                description: "Order items not available",
                variant: "destructive",
            });
            return;
        }

        order.items.forEach((item: { menuItemId: string; name?: string; priceCents: number; quantity: number; menuItem?: { name?: string; image?: string; category?: string } }) => {
            addItem(
                {
                    id: item.menuItemId,
                    name: item.name || item.menuItem?.name || "Item",
                    price: item.priceCents / 100,
                    quantity: item.quantity,
                    image: item.menuItem?.image,
                    category: item.menuItem?.category || "",
                },
                {
                    id: order.restaurant?.id || order.restaurantId,
                    name: order.restaurant?.name || "Restaurant",
                    image: order.restaurant?.storefrontImage || "",
                    deliveryFee: 50,
                    distance: "N/A",
                }
            );
        });

        toast({
            title: "Items added to cart",
            description: "Your order items have been added to the cart",
        });
        navigate("/customer/cart");
    };

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            searchTerm === "" ||
            String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.restaurant?.name || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                <p className="mt-4 text-slate-500">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
                <p className="text-slate-500">View and track all your previous orders</p>
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
                                <option value="pending">Pending</option>
                                <option value="cooking">Cooking</option>
                                <option value="in_transit">In Transit</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50">
                                <Calendar className="h-4 w-4" />
                                Date Range
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
                        Your Orders ({filteredOrders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-slate-300" />
                            <h3 className="mt-4 text-lg font-medium text-slate-900">No orders found</h3>
                            <p className="mt-2 text-slate-500">
                                {orders.length === 0
                                    ? "You haven't placed any orders yet."
                                    : "No orders match your search criteria."}
                            </p>
                            {orders.length === 0 && (
                                <Button
                                    onClick={() => navigate("/customer/restaurants")}
                                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                                >
                                    Browse Restaurants
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
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
                                        {filteredOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">
                                                    {order.id.slice(0, 8)}...
                                                </TableCell>
                                                <TableCell>
                                                    {order.restaurant?.name || "Unknown Restaurant"}
                                                </TableCell>
                                                <TableCell>
                                                    {order.items?.length || 0} items
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeClass(order.status)}>
                                                        {getOrderStatusLabel(order.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatPrice(order.totalCents)}
                                                </TableCell>
                                                <TableCell className="text-slate-500">
                                                    {formatDate(order.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                navigate(`/customer/orders/${order.id}`)
                                                            }
                                                            className="text-orange-600 hover:text-orange-700"
                                                        >
                                                            View Details
                                                            <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                        {order.status === "DELIVERED" && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReorder(order)}
                                                            >
                                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                                Reorder
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {filteredOrders.map((order) => (
                                    <Card key={order.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-sm text-slate-500">
                                                        {String(order.id).slice(0, 8)}...
                                                    </p>
                                                    <h3 className="font-semibold">
                                                        {order.restaurant?.name || "Unknown Restaurant"}
                                                    </h3>
                                                </div>
                                                <Badge className={getStatusBadgeClass(order.status)}>
                                                    {getOrderStatusLabel(order.status)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                                                <span>{order.items?.length || 0} items</span>
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-lg">
                                                    {formatPrice(order.totalCents)}
                                                </span>
                                                <div className="flex gap-2">
                                                    {order.status === "DELIVERED" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReorder(order)}
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(`/customer/orders/${order.id}`)
                                                        }
                                                        className="bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        Details
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
