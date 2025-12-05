import { User, Phone, Mail, MapPin, CreditCard, Upload, Bike } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { useState } from "react";

export function RiderProfile() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Rider Profile</h1>
                <p className="text-slate-500">Manage your profile and documents</p>
            </div>

            {/* Profile Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-600 text-3xl font-bold text-white">
                                    K
                                </div>
                                <label
                                    htmlFor="profile-upload"
                                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white border-2 border-green-600 text-green-600 shadow-lg hover:bg-green-50"
                                >
                                    <Upload className="h-4 w-4" />
                                    <input id="profile-upload" type="file" accept="image/*" className="hidden" />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Kamal Rider</h2>
                                <p className="text-slate-500">kamal.rider@example.com</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge className="bg-green-500">Active</Badge>
                                    <Badge className="bg-blue-500">Verified</Badge>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Personal Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    defaultValue="Kamal Rider"
                                    disabled={!isEditing}
                                    className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="tel"
                                    defaultValue="+880 1712-345678"
                                    disabled={!isEditing}
                                    className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    defaultValue="kamal.rider@example.com"
                                    disabled={!isEditing}
                                    className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">NID / Passport</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    defaultValue="1234567890123"
                                    disabled={!isEditing}
                                    className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <textarea
                                rows={3}
                                defaultValue="House 25, Road 7, Dhanmondi, Dhaka 1205"
                                disabled={!isEditing}
                                className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <button className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                            Save Changes
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bike className="h-5 w-5 text-green-600" />
                        Vehicle Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-sm font-medium text-slate-500">Vehicle Type</p>
                            <p className="mt-1 font-semibold">Motorcycle</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 p-4">
                            <p className="text-sm font-medium text-slate-500">Registration Number</p>
                            <p className="mt-1 font-semibold">DHK-1234</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-slate-200 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">Driving License</p>
                                <Badge className="bg-green-500">Verified</Badge>
                            </div>
                            <img
                                src="https://via.placeholder.com/400x200?text=Driving+License"
                                alt="Driving License"
                                className="w-full rounded-md border"
                            />
                            <button className="mt-2 w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                                Re-upload Document
                            </button>
                        </div>

                        <div className="rounded-lg border border-slate-200 p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-medium">Vehicle Registration</p>
                                <Badge className="bg-green-500">Verified</Badge>
                            </div>
                            <img
                                src="https://via.placeholder.com/400x200?text=Vehicle+Registration"
                                alt="Vehicle Registration"
                                className="w-full rounded-md border"
                            />
                            <button className="mt-2 w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
                                Re-upload Document
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
