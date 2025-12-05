import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

const earningsData = {
    today: { amount: 640, deliveries: 8 },
    week: { amount: 4250, deliveries: 42 },
    month: { amount: 18500, deliveries: 185 },
};

const recentEarnings = [
    { date: "2025-11-28", deliveries: 8, amount: 640, status: "paid" },
    { date: "2025-11-27", deliveries: 11, amount: 880, status: "paid" },
    { date: "2025-11-26", deliveries: 9, amount: 720, status: "paid" },
    { date: "2025-11-25", deliveries: 7, amount: 560, status: "paid" },
    { date: "2025-11-24", deliveries: 7, amount: 560, status: "pending" },
];

export function Earnings() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
                    <p className="text-slate-500">Track your delivery earnings</p>
                </div>
                <button className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                    <Download className="h-4 w-4" />
                    Download Report
                </button>
            </div>

            {/* Earnings Summary */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Today</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">৳{earningsData.today.amount}</div>
                        <p className="text-xs text-slate-500">{earningsData.today.deliveries} deliveries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">This Week</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">৳{earningsData.week.amount}</div>
                        <p className="text-xs text-slate-500">{earningsData.week.deliveries} deliveries</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">৳{earningsData.month.amount}</div>
                        <p className="text-xs text-slate-500">{earningsData.month.deliveries} deliveries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentEarnings.map((earning, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <DollarSign className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{new Date(earning.date).toLocaleDateString()}</p>
                                        <p className="text-sm text-slate-500">{earning.deliveries} deliveries</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-green-600">৳{earning.amount}</p>
                                        <Badge
                                            className={earning.status === "paid" ? "bg-green-500" : "bg-amber-500"}
                                        >
                                            {earning.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Payout Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Payout Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-blue-900">Next Payout</p>
                                    <p className="text-sm text-blue-700">December 5, 2025</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">৳4,250</p>
                                    <p className="text-sm text-blue-700">42 deliveries</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm font-medium text-slate-500">Payment Method</p>
                                <p className="mt-1 font-semibold">Bank Transfer</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm font-medium text-slate-500">Payout Frequency</p>
                                <p className="mt-1 font-semibold">Weekly</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
