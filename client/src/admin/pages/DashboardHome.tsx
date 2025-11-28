import { useEffect, useState } from "react";
import { KPICard } from "../components/KPICard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { mockApi } from "../services/mockData";
import { formatCurrency, getRelativeTime } from "../utils/helpers";
import type { KPIMetrics, OrderData } from "../types";
import { Banknote, ShoppingCart, Truck, Clock, Store } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DashboardHome() {
    const [kpis, setKpis] = useState<KPIMetrics | null>(null);
    const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [kpiData, ordersData] = await Promise.all([
                    mockApi.getKPIs(),
                    mockApi.getOrders({ limit: 5 }),
                ]);
                setKpis(kpiData);
                setRecentOrders(ordersData.data);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading || !kpis) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-lg text-slate-500">Loading dashboard...</div>
            </div>
        );
    }

    // Mock data for charts
    const ordersData = Array.from({ length: 30 }, (_, i) => ({
        date: `${i + 1}`,
        orders: Math.floor(Math.random() * 100) + 50,
    }));

    const orderSourcesData = [
        { name: "Mobile App", value: 1234 },
        { name: "Website", value: 876 },
        { name: "Phone", value: 234 },
    ];

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case "DELIVERED":
                return "success";
            case "CANCELLED":
                return "destructive";
            case "PENDING":
                return "warning";
            default:
                return "default";
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-slate-500">
                    Welcome back! Here's what's happening today.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KPICard
                    title="Total Orders (24h)"
                    value={kpis.totalOrders24h}
                    change={kpis.totalOrdersChange}
                    icon={<ShoppingCart />}
                    description="from yesterday"
                />
                <KPICard
                    title="Revenue (24h)"
                    value={formatCurrency(kpis.revenue24h)}
                    change={kpis.revenueChange}
                    icon={<Banknote />}
                    description="from yesterday"
                />
                <KPICard
                    title="Active Deliveries"
                    value={kpis.activeDeliveries}
                    change={kpis.activeDeliveriesChange}
                    icon={<Truck />}
                    description="in progress"
                />
                <KPICard
                    title="Avg Delivery Time"
                    value={`${kpis.avgDeliveryTime}m`}
                    change={kpis.avgDeliveryTimeChange}
                    trend={kpis.avgDeliveryTimeChange < 0 ? "up" : "down"}
                    icon={<Clock />}
                    description="minutes"
                />
                <KPICard
                    title="Pending Restaurants"
                    value={kpis.pendingRestaurants}
                    icon={<Store />}
                    description="awaiting approval"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Orders Over Time */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Orders Overview</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={ordersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Order Sources */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Order Sources</CardTitle>
                        <CardDescription>Distribution by platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={orderSourcesData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderSourcesData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders from all restaurants</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Restaurant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.userName}</TableCell>
                                    <TableCell>{order.restaurantName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(order.status) as any}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatCurrency(order.totalCents, order.currency)}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {getRelativeTime(order.createdAt)}
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
