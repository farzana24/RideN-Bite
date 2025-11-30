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
import { restaurantApi } from "../services/restaurantApi";
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
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [restaurantDetails, setRestaurantDetails] = useState<RestaurantData | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadRestaurants();
    }, [statusFilter]);

    async function loadRestaurants() {
        setLoading(true);
        const params = {
            status: statusFilter === "all" ? undefined : statusFilter,
        };
        try {
            const response = await restaurantApi.getRestaurants(params);
            setRestaurants(response.data);
        } catch (error) {
            console.error("Failed to load restaurants:", error);
            const status = (error as any)?.response?.status;
            toast({
                title: status === 401 ? "Unauthorized" : "Error",
                description:
                    status === 401
                        ? "Please log in with an admin account to view restaurants."
                        : "Failed to load restaurants",
                variant: "destructive",
            });
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
            await restaurantApi.approveRestaurant(selectedRestaurant.id, approved, approvalNotes);

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

    const openDetailsDialog = async (restaurant: RestaurantData) => {
        setDetailsDialogOpen(true);
        setDetailsLoading(true);
        try {
            const detailed = await restaurantApi.getRestaurant(restaurant.id);
            setRestaurantDetails(detailed ?? restaurant);
        } catch (error) {
            console.error("Failed to fetch restaurant details", error);
            toast({
                title: "Unable to load details",
                description: "Showing the data we already have for this restaurant.",
            });
            setRestaurantDetails(restaurant);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetailsDialog = () => {
        setDetailsDialogOpen(false);
        setRestaurantDetails(null);
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
                                                                        await restaurantApi.suspendRestaurant(restaurant.id, true);
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
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => openDetailsDialog(restaurant)}
                                                            aria-label="View restaurant submission"
                                                        >
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

            {/* Restaurant detail preview dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={(open) => (open ? setDetailsDialogOpen(true) : closeDetailsDialog())}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{restaurantDetails?.name ?? "Restaurant details"}</DialogTitle>
                        <DialogDescription>
                            Submitted by {restaurantDetails?.ownerName ?? "owner"} · {restaurantDetails?.ownerEmail}
                        </DialogDescription>
                    </DialogHeader>
                    {detailsLoading ? (
                        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                            Fetching latest information...
                        </div>
                    ) : restaurantDetails ? (
                        <div className="space-y-6">
                            {restaurantDetails.storefrontImage ? (
                                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <img
                                        src={restaurantDetails.storefrontImage}
                                        alt={`${restaurantDetails.name} storefront`}
                                        className="h-56 w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">No image provided</p>
                                </div>
                            )}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Business name</p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {restaurantDetails.businessName ?? restaurantDetails.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Contact</p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {restaurantDetails.phone ?? "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Owner</p>
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {restaurantDetails.ownerName}
                                    </p>
                                    <p className="text-sm text-slate-500">{restaurantDetails.ownerEmail}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                                    {restaurantDetails.suspended ? (
                                        <Badge variant="destructive">Suspended</Badge>
                                    ) : restaurantDetails.approved ? (
                                        <Badge variant="success">Active</Badge>
                                    ) : (
                                        <Badge variant="warning">Pending</Badge>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{restaurantDetails.address}</p>
                                {(restaurantDetails.lat || restaurantDetails.lng) && (
                                    <p className="text-xs text-slate-400">
                                        Lat: {restaurantDetails.lat?.toFixed(4)} · Lng: {restaurantDetails.lng?.toFixed(4)}
                                    </p>
                                )}
                            </div>

                            {restaurantDetails.description && (
                                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                                    {restaurantDetails.description}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-slate-800">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Menu items</p>
                                    <p className="text-2xl font-semibold">{restaurantDetails.menuItemsCount ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-slate-800">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Orders</p>
                                    <p className="text-2xl font-semibold">{restaurantDetails.ordersCount ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-200 p-3 text-center dark:border-slate-800">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Rating</p>
                                    <p className="text-2xl font-semibold">{restaurantDetails.rating?.toFixed(1) ?? "–"}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Cuisines</p>
                                {restaurantDetails.cuisines?.length ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {restaurantDetails.cuisines.map((cuisine) => (
                                            <Badge key={cuisine} variant="outline" className="text-xs">
                                                {cuisine}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No cuisines specified.</p>
                                )}
                            </div>

                            <div>
                                <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Uploaded documents</p>
                                {restaurantDetails.documents?.length ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {restaurantDetails.documents.map((document) => (
                                            <a
                                                key={`${document.type}-${document.name}`}
                                                href={document.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-2xl border border-slate-200 p-3 transition hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
                                            >
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{document.name}</p>
                                                <p className="text-xs text-slate-500">{document.type}</p>
                                                {document.verified !== undefined && (
                                                    <Badge className="mt-2" variant={document.verified ? "success" : "secondary"}>
                                                        {document.verified ? "Verified" : "Uploaded"}
                                                    </Badge>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500">No documents provided.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No additional data available for this restaurant.</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
