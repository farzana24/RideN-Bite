import { useState } from "react";
import { Camera, Mail, Phone, MapPin, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";

export function CustomerProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+880 1712-345678",
        address: "123 Mirpur Road, Dhaka 1216",
        avatar: "",
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-slate-500">
                    Manage your account information and preferences
                </p>
            </div>

            {/* Profile Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-600 text-3xl font-bold text-white">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    profile.name[0]?.toUpperCase()
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-slate-50">
                                <Camera className="h-4 w-4 text-slate-600" />
                            </button>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                            <p className="text-slate-500">{profile.email}</p>
                            <div className="mt-2 flex gap-2">
                                <Badge className="bg-orange-500">Premium Member</Badge>
                                <Badge variant="outline">Verified</Badge>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50"
                                />
                            </div>
                        </div>
                        {isEditing && (
                            <button className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                                Save Changes
                            </button>
                        )}
                    </CardContent>
                </Card>

                {/* Delivery Address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Address</CardTitle>
                        <CardDescription>Manage your default delivery location</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Address</label>
                            <div className="mt-1 flex items-start gap-2">
                                <MapPin className="mt-2 h-4 w-4 text-slate-400 shrink-0" />
                                <textarea
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    disabled={!isEditing}
                                    rows={3}
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-slate-50"
                                />
                            </div>
                        </div>
                        <div className="rounded-md bg-slate-50 p-4">
                            <p className="text-sm text-slate-600">
                                <strong>Note:</strong> This will be used as your default delivery address for all orders.
                            </p>
                        </div>
                        {isEditing && (
                            <button className="w-full rounded-md border border-orange-600 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50">
                                Add New Address
                            </button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Current Password</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">New Password</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                    <button className="mt-4 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
                        Update Password
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
