import { useState, useEffect } from "react";
import { Search, Filter, UserX, UserCheck, Bike, Car, PersonStanding } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getRiders, suspendRider } from "../services/riderApi";
import type { RiderProfile } from "../services/riderApi";

const vehicleTypeIcons: Record<string, any> = {
    BIKE: Bike,
    CAR: Car,
    SCOOTER: Bike,
    BICYCLE: Bike,
    ON_FOOT: PersonStanding,
};

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-500",
    ACTIVE: "bg-green-500",
    SUSPENDED: "bg-red-500",
    REJECTED: "bg-slate-500",
};

export function RidersTracking() {
    const [riders, setRiders] = useState<RiderProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedRider, setSelectedRider] = useState<RiderProfile | null>(null);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadRiders();
    }, [statusFilter]);

    const loadRiders = async () => {
        try {
            setLoading(true);
            const params: any = { limit: 100 };
            if (statusFilter !== "all") {
                params.status = statusFilter;
            }
            const response = await getRiders(params);
            setRiders(response.data.data);
        } catch (error) {
            console.error('Failed to load riders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendToggle = async (rider: RiderProfile) => {
        const isSuspending = rider.status === 'ACTIVE';
        const action = isSuspending ? 'suspend' : 'reactivate';
        
        let reason: string | null = null;
        if (isSuspending) {
            reason = prompt("Enter suspension reason:");
            if (reason === null) return; // User cancelled
        }

        try {
            setActionLoading(true);
            await suspendRider(rider.id, {
                suspended: isSuspending,
                reason: reason || undefined,
            });
            alert(`Rider ${action}d successfully!`);
            setShowSuspendModal(false);
            loadRiders();
        } catch (error) {
            console.error(`Failed to ${action} rider:`, error);
            alert(`Failed to ${action} rider. Please try again.`);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredRiders = riders.filter((rider) => {
        const matchesSearch = 
            rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rider.phone?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Riders Management</h1>
                <p className="text-slate-500">View and manage all riders in the system</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Riders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '-' : riders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {loading ? '-' : riders.filter(r => r.status === 'ACTIVE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {loading ? '-' : riders.filter(r => r.status === 'PENDING').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Suspended</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {loading ? '-' : riders.filter(r => r.status === 'SUSPENDED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-md border border-slate-200 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Riders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Riders</CardTitle>
                    <CardDescription>Manage rider accounts and status</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-8 text-center text-slate-500">Loading riders...</div>
                    ) : filteredRiders.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">No riders found</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rider</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Vehicle Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRiders.map((rider) => {
                                    const Icon = vehicleTypeIcons[rider.vehicleType];
                                    return (
                                        <TableRow key={rider.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={rider.documents.profilePhoto?.url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(rider.name) + "&background=10b981&color=fff&size=150"}
                                                        alt={rider.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-medium">{rider.name}</p>
                                                        <p className="text-sm text-slate-500">{rider.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{rider.phone || 'N/A'}</p>
                                                    <p className="text-slate-500">ID: {rider.userId}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-slate-600" />
                                                    <span className="text-sm">{rider.vehicleType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusColors[rider.status]}>
                                                    {rider.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {new Date(rider.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {rider.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRider(rider);
                                                            setShowSuspendModal(true);
                                                        }}
                                                        className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                        Suspend
                                                    </button>
                                                )}
                                                {rider.status === 'SUSPENDED' && (
                                                    <button
                                                        onClick={() => handleSuspendToggle(rider)}
                                                        className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                                                    >
                                                        <UserCheck className="h-4 w-4" />
                                                        Reactivate
                                                    </button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Suspend Confirmation Modal */}
            {selectedRider && (
                <Dialog open={showSuspendModal} onOpenChange={setShowSuspendModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Suspend Rider</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to suspend this rider? They will not be able to accept deliveries until reactivated.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                                <img
                                    src={selectedRider.documents.profilePhoto?.url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedRider.name) + "&background=10b981&color=fff&size=150"}
                                    alt={selectedRider.name}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium">{selectedRider.name}</p>
                                    <p className="text-sm text-slate-500">{selectedRider.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSuspendModal(false)}
                                    disabled={actionLoading}
                                    className="flex-1 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleSuspendToggle(selectedRider)}
                                    disabled={actionLoading}
                                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading ? 'Suspending...' : 'Suspend Rider'}
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
