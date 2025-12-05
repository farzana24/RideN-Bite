import { useState, useEffect } from "react";
import {
    Moon,
    Sun,
    User,
    Lock,
    Trash2,
    Save,
    Camera,
    MapPin,
    Plus,
    Edit2,
    Loader2,
    Star,
    Check,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { Badge } from "../../admin/components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { client } from "../../api/client";
import { customerApi, type Address } from "../services/customerApi";
import { toast } from "../../admin/components/ui/use-toast";

export function CustomerSettings() {
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        avatar: "",
    });

    // Addresses state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [savingAddress, setSavingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        street: "",
        city: "",
        area: "",
        isDefault: false,
    });

    // Password state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Fetch addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const data = await customerApi.getAddresses();
                setAddresses(data);
            } catch (error) {
                console.error("Error fetching addresses:", error);
            } finally {
                setLoadingAddresses(false);
            }
        };

        fetchAddresses();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await customerApi.updateProfile({
                name: profile.name,
                phone: profile.phone,
            });
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully",
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        setSavingAddress(true);
        try {
            if (editingAddress) {
                // Update existing address
                const updated = await customerApi.updateAddress(editingAddress.id, newAddress);
                setAddresses((prev) =>
                    prev.map((a) => (a.id === editingAddress.id ? updated : a))
                );
                toast({
                    title: "Address Updated",
                    description: "Your address has been updated successfully",
                });
            } else {
                // Create new address
                const created = await customerApi.createAddress(newAddress);
                setAddresses((prev) => [...prev, created]);
                toast({
                    title: "Address Added",
                    description: "New address has been added successfully",
                });
            }
            resetAddressForm();
        } catch (error) {
            console.error("Failed to save address:", error);
            toast({
                title: "Error",
                description: "Failed to save address",
                variant: "destructive",
            });
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        try {
            await customerApi.deleteAddress(addressId);
            setAddresses((prev) => prev.filter((a) => a.id !== addressId));
            toast({
                title: "Address Deleted",
                description: "Address has been removed successfully",
            });
        } catch (error) {
            console.error("Failed to delete address:", error);
            toast({
                title: "Error",
                description: "Failed to delete address",
                variant: "destructive",
            });
        }
    };

    const handleSetDefaultAddress = async (address: Address) => {
        try {
            await customerApi.updateAddress(address.id, { isDefault: true });
            setAddresses((prev) =>
                prev.map((a) => ({
                    ...a,
                    isDefault: a.id === address.id,
                }))
            );
            toast({
                title: "Default Address Updated",
                description: `${address.label} is now your default address`,
            });
        } catch (error) {
            console.error("Failed to set default address:", error);
            toast({
                title: "Error",
                description: "Failed to update default address",
                variant: "destructive",
            });
        }
    };

    const resetAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setNewAddress({
            label: "Home",
            street: "",
            city: "",
            area: "",
            isDefault: false,
        });
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setNewAddress({
            label: address.label,
            street: address.street,
            city: address.city,
            area: address.area || "",
            isDefault: address.isDefault,
        });
        setShowAddressForm(true);
    };

    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return;
        }

        setIsChangingPassword(true);
        try {
            await client.post("/auth/change-password", {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswordSuccess("Password changed successfully!");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordSection(false);
        } catch (error: any) {
            setPasswordError(error.response?.data?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== "DELETE") return;

        setIsDeleting(true);
        try {
            await client.delete("/auth/account");
            logout();
        } catch (error) {
            console.error("Failed to delete account:", error);
            toast({
                title: "Error",
                description: "Failed to delete account",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-slate-500">Manage your profile and account preferences</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-orange-600" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </div>
                        <Button
                            variant={isEditing ? "outline" : "default"}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt="Avatar"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    profile.name?.charAt(0)?.toUpperCase() || "U"
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 rounded-full bg-orange-600 p-1.5 text-white shadow-lg hover:bg-orange-700">
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-lg">{profile.name || "User"}</p>
                            <p className="text-sm text-slate-500">{profile.email}</p>
                        </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <Input
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <Input
                                type="email"
                                value={profile.email}
                                disabled
                                className="mt-1 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Phone Number</label>
                            <Input
                                type="tel"
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                disabled={!isEditing}
                                placeholder="+880 1XXX-XXXXXX"
                                className="mt-1"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end">
                            <Button onClick={handleSaveProfile} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Saved Addresses Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-orange-600" />
                                Saved Addresses
                            </CardTitle>
                            <CardDescription>Manage your delivery addresses</CardDescription>
                        </div>
                        <Button
                            onClick={() => {
                                resetAddressForm();
                                setShowAddressForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Address
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingAddresses ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                        </div>
                    ) : addresses.length === 0 && !showAddressForm ? (
                        <div className="text-center py-8">
                            <MapPin className="h-12 w-12 mx-auto text-slate-300" />
                            <p className="mt-2 text-slate-500">No saved addresses yet</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setShowAddressForm(true)}
                            >
                                Add Your First Address
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Address List */}
                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`flex items-start justify-between p-4 rounded-lg border ${
                                        address.isDefault ? "border-orange-500 bg-orange-50" : "border-slate-200"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{address.label}</span>
                                            {address.isDefault && (
                                                <Badge className="bg-orange-600">Default</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">
                                            {address.street}
                                            {address.area && `, ${address.area}`}
                                        </p>
                                        <p className="text-sm text-slate-500">{address.city}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefaultAddress(address)}
                                                title="Set as default"
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditAddress(address)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {/* Address Form */}
                            {showAddressForm && (
                                <div className="border rounded-lg p-4 bg-slate-50 space-y-4">
                                    <h4 className="font-medium">
                                        {editingAddress ? "Edit Address" : "Add New Address"}
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">
                                                Label
                                            </label>
                                            <select
                                                value={newAddress.label}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, label: e.target.value })
                                                }
                                                className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            >
                                                <option value="Home">Home</option>
                                                <option value="Work">Work</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">
                                                Area
                                            </label>
                                            <Input
                                                value={newAddress.area}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, area: e.target.value })
                                                }
                                                placeholder="e.g., Dhanmondi"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-slate-700">
                                                Street Address
                                            </label>
                                            <Input
                                                value={newAddress.street}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, street: e.target.value })
                                                }
                                                placeholder="House #, Road #, Block"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700">
                                                City
                                            </label>
                                            <Input
                                                value={newAddress.city}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, city: e.target.value })
                                                }
                                                placeholder="Dhaka"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-6">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={(e) =>
                                                    setNewAddress({
                                                        ...newAddress,
                                                        isDefault: e.target.checked,
                                                    })
                                                }
                                                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                            />
                                            <label htmlFor="isDefault" className="text-sm text-slate-700">
                                                Set as default address
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={resetAddressForm}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSaveAddress}
                                            disabled={
                                                savingAddress || !newAddress.street || !newAddress.city
                                            }
                                        >
                                            {savingAddress ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    {editingAddress ? "Update" : "Save"} Address
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {darkMode ? (
                            <Moon className="h-5 w-5 text-orange-600" />
                        ) : (
                            <Sun className="h-5 w-5 text-orange-600" />
                        )}
                        Appearance
                    </CardTitle>
                    <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-slate-500">
                                Switch between light and dark theme
                            </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Password Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-orange-600" />
                                Password & Security
                            </CardTitle>
                            <CardDescription>Update your password</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordSection(!showPasswordSection)}
                        >
                            {showPasswordSection ? "Cancel" : "Change Password"}
                        </Button>
                    </div>
                </CardHeader>
                {showPasswordSection && (
                    <CardContent className="space-y-4">
                        {passwordError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                                {passwordSuccess}
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Current Password
                            </label>
                            <Input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, currentPassword: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">New Password</label>
                            <Input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, newPassword: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">
                                Confirm New Password
                            </label>
                            <Input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    setPasswords({ ...passwords, confirmPassword: e.target.value })
                                }
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                                {isChangingPassword ? "Changing..." : "Update Password"}
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Delete Account Section */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-5 w-5" />
                        Delete Account
                    </CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                        Once you delete your account, there is no going back. All your orders,
                        preferences, and personal data will be permanently removed.
                    </p>
                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                        Delete My Account
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Account Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h2 className="text-xl font-bold text-red-600 mb-2">Delete Account</h2>
                        <p className="text-slate-600 mb-4">
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                        </p>
                        <p className="text-sm font-medium text-slate-700 mb-2">
                            Type{" "}
                            <span className="font-mono bg-slate-100 px-1 rounded">DELETE</span> to
                            confirm:
                        </p>
                        <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Type DELETE"
                            className="mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteDialog(false);
                                    setDeleteConfirmation("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== "DELETE" || isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
