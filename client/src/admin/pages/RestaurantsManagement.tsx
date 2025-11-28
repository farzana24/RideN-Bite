import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { mockApi } from "../services/mockData";
import { formatDateTime } from "../utils/helpers";
import type { RestaurantData } from "../types";
import { Search, Check, X, Eye } from "lucide-react";
import { useToast } from "../components/ui/use-toast";

export function RestaurantsManagement() {
    const [restaurants, setRestaurants] = useState<RestaurantData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "active">("all");
    const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantData | null>(null);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState("");
    const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
    const { toast } = useToast();

    useEffect(() => {
        loadRestaurants();
    }, [statusFilter]);

    async function loadRestaurants() {
        setLoading(true);
        try {
            const params = {
                status: statusFilter === "all" ? undefined : statusFilter,
            };
            const response = await mockApi.getRestaurants(params);
            setRestaurants(response.data);
        } catch (error) {
            console.error("Failed to load restaurants:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredRestaurants = restaurants.filter((restaurant) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            restaurant.name.toLowerCase().includes(query) ||
            restaurant.ownerName.toLowerCase().includes(query) ||
            restaurant.ownerEmail.toLowerCase().includes(query)
        );
    });

    const handleApproval = async () => {
        if (!selectedRestaurant) return;

        try {
            const approved = approvalAction === "approve";
            await mockApi.approveRestaurant(selectedRestaurant.id, approved, approvalNotes);

            toast({
                title: approved ? "Restaurant Approved" : "Restaurant Rejected",
                description: `${selectedRestaurant.name} has been ${approved ? "approved" : "rejected"}.`,
            });

            setApprovalDialogOpen(false);
            setApprovalNotes("");
            loadRestaurants();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update restaurant status.",
                variant: "destructive",
            });
        }
    };

    const openApprovalDialog = (restaurant: RestaurantData, action: "approve" | "reject") => {
        setSelectedRestaurant(restaurant);
        setApprovalAction(action);
        setApprovalDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Restaurants</h1>
                <p className="text-slate-500">
                    Manage restaurant partners and approval requests
                </p>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Restaurants</CardTitle>
                            <CardDescription>
                                {filteredRestaurants.length} total restaurants
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search restaurants..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                        </TabsList>

                        <TabsContent value={statusFilter} className="mt-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <p className="text-slate-500">Loading...</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Menu Items</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRestaurants.map((restaurant) => (
                                            <TableRow key={restaurant.id}>
                                                <TableCell className="font-medium">
                                                    {restaurant.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{restaurant.ownerName}</div>
                                                        <div className="text-sm text-slate-500">
                                                            {restaurant.ownerEmail}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {restaurant.address}
                                                </TableCell>
                                                <TableCell>
                                                    {restaurant.suspended ? (
                                                        <Badge variant="destructive">Suspended</Badge>
                                                    ) : restaurant.approved ? (
                                                        <Badge variant="success">Active</Badge>
                                                    ) : (
                                                        <Badge variant="warning">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{restaurant.menuItemsCount || 0}</TableCell>
                                                <TableCell>{restaurant.ordersCount || 0}</TableCell>
                                                <TableCell className="text-slate-500">
                                                    {formatDateTime(restaurant.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {!restaurant.approved && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => openApprovalDialog(restaurant, "approve")}
                                                                >
                                                                    <Check className="mr-1 h-4 w-4" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => openApprovalDialog(restaurant, "reject")}
                                                                >
                                                                    <X className="mr-1 h-4 w-4" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {restaurant.approved && !restaurant.suspended && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={async () => {
                                                                    try {
                                                                        await mockApi.suspendRestaurant(restaurant.id, true);
                                                                        toast({
                                                                            title: "Restaurant Suspended",
                                                                            description: `${restaurant.name} has been suspended.`,
                                                                        });
                                                                        loadRestaurants();
                                                                    } catch (error) {
                                                                        toast({
                                                                            title: "Error",
                                                                            description: "Failed to suspend restaurant.",
                                                                            variant: "destructive",
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <X className="mr-1 h-4 w-4" />
                                                                Suspend
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="ghost">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Approval Dialog */}
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {approvalAction === "approve" ? "Approve" : "Reject"} Restaurant
                        </DialogTitle>
                        <DialogDescription>
                            {approvalAction === "approve"
                                ? `Approve ${selectedRestaurant?.name} to start accepting orders on the platform.`
                                : `Reject ${selectedRestaurant?.name}'s application. Please provide a reason.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">
                                {approvalAction === "approve" ? "Notes (optional)" : "Reason for rejection"}
                            </label>
                            <textarea
                                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm dark:border-slate-800"
                                rows={4}
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                placeholder={
                                    approvalAction === "approve"
                                        ? "Add any notes for the record..."
                                        : "Explain why this restaurant is being rejected..."
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={approvalAction === "approve" ? "default" : "destructive"}
                            onClick={handleApproval}
                        >
                            {approvalAction === "approve" ? "Approve" : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
