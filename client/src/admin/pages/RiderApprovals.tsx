import { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, CreditCard, Bike, Car, PersonStanding, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { getRiders, getRiderStats, approveRider, rejectRider } from "../services/riderApi";
import type { RiderProfile, RiderStats } from "../services/riderApi";

const vehicleTypeIcons: Record<string, any> = {
    BIKE: Bike,
    CAR: Car,
    SCOOTER: Bike,
    BICYCLE: Bike,
    ON_FOOT: PersonStanding,
};

export function RiderApprovals() {
    const [riders, setRiders] = useState<RiderProfile[]>([]);
    const [stats, setStats] = useState<RiderStats | null>(null);
    const [selectedRider, setSelectedRider] = useState<RiderProfile | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ridersResponse, statsResponse] = await Promise.all([
                getRiders({ status: 'pending', limit: 100 }),
                getRiderStats()
            ]);
            setRiders(ridersResponse.data.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Failed to load riders:', error);
            alert('Failed to load riders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const requiresDocuments = (vehicleType: string) => {
        return ["BIKE", "CAR", "SCOOTER"].includes(vehicleType);
    };

    const handleViewDetails = (rider: RiderProfile) => {
        setSelectedRider(rider);
        setShowDetailsModal(true);
    };

    const handleApprove = async (riderId: number) => {
        try {
            setActionLoading(true);
            await approveRider(riderId);
            alert("Rider approved successfully! Status changed to ACTIVE.");
            setShowDetailsModal(false);
            loadData(); // Refresh the list
        } catch (error) {
            console.error('Failed to approve rider:', error);
            alert('Failed to approve rider. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (riderId: number) => {
        const reason = prompt("Enter rejection reason (optional):");
        if (reason === null) return; // User cancelled
        
        try {
            setActionLoading(true);
            await rejectRider(riderId, { reason });
            alert("Rider rejected successfully.");
            setShowDetailsModal(false);
            loadData(); // Refresh the list
        } catch (error) {
            console.error('Failed to reject rider:', error);
            alert('Failed to reject rider. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const VehicleIcon = selectedRider ? vehicleTypeIcons[selectedRider.vehicleType] : Bike;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rider Approvals</h1>
                <p className="text-slate-500">Review and approve rider registration applications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '-' : stats?.pending || 0}</div>
                        <p className="text-xs text-slate-500">Awaiting review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Approved Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{loading ? '-' : stats?.approvedToday || 0}</div>
                        <p className="text-xs text-slate-500">Active riders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Rejected Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{loading ? '-' : stats?.rejectedToday || 0}</div>
                        <p className="text-xs text-slate-500">Applications declined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Riders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Applications</CardTitle>
                    <CardDescription>Review rider registration details and documents</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : riders.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            No pending applications
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rider</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Vehicle Type</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {riders.map((rider) => {
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
                                                    <p className="text-slate-500">User ID: {rider.userId}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-slate-600" />
                                                    <span className="text-sm">{rider.vehicleType}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {new Date(rider.submittedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-amber-500">Pending</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(rider)}
                                                        className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(rider.id)}
                                                    className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(rider.id)}
                                                    className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Details Modal */}
            {selectedRider && (
                <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Rider Application Details</DialogTitle>
                            <DialogDescription>Review all information and documents before approval</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Profile Section */}
                            <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                                <img
                                    src={selectedRider.documents.profilePhoto?.url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(selectedRider.name) + "&background=10b981&color=fff&size=200"}
                                    alt={selectedRider.name}
                                    className="h-20 w-20 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{selectedRider.name}</h3>
                                    <p className="text-sm text-slate-500">{selectedRider.email}</p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge className="bg-amber-500">Pending Review</Badge>
                                        <Badge className="bg-slate-500">
                                            <VehicleIcon className="mr-1 h-3 w-3" />
                                            {selectedRider.vehicleType}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex items-start gap-3">
                                            <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Phone Number</p>
                                                <p className="font-medium">{selectedRider.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Email</p>
                                                <p className="font-medium">{selectedRider.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="mt-0.5 h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Vehicle Number</p>
                                                <p className="font-medium">{selectedRider.vehicleNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <VehicleIcon className="mt-0.5 h-4 w-4 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">Vehicle Type</p>
                                                <p className="font-medium">{selectedRider.vehicleType}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Available Regions</p>
                                            <p className="font-medium">{selectedRider.availableRegions.join(', ') || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Section (if applicable) */}
                            {requiresDocuments(selectedRider.vehicleType) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Documents</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* Driving License */}
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-slate-700">Driving License</p>
                                                {selectedRider.documents.drivingLicense?.url ? (
                                                    <img
                                                        src={selectedRider.documents.drivingLicense.url}
                                                        alt="Driving License"
                                                        className="w-full rounded-lg border-2 border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                                                        <p className="text-sm text-slate-500">No document uploaded</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Vehicle Registration */}
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-slate-700">
                                                    Vehicle Registration
                                                </p>
                                                {selectedRider.documents.vehicleRegistration?.url ? (
                                                    <img
                                                        src={selectedRider.documents.vehicleRegistration.url}
                                                        alt="Vehicle Registration"
                                                        className="w-full rounded-lg border-2 border-slate-200"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                                                        <p className="text-sm text-slate-500">No document uploaded</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(selectedRider.id)}
                                    disabled={actionLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                    Approve Rider
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRider.id)}
                                    disabled={actionLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                    Reject Application
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
