import { useState } from "react";
import { Card } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { useAuth } from "../../context/AuthContext";
import { client } from "../../api/client";
import { toast } from "../../admin/components/ui/use-toast";
import { Lock, Trash2, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../admin/components/ui/dialog";

export function SettingsPage() {
    const { logout } = useAuth();
    
    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Delete account state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        setPasswordLoading(true);
        try {
            await client.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            toast({
                title: "Password updated",
                description: "Your password has been changed successfully.",
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setPasswordError(error.response?.data?.error || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") return;

        setDeleteLoading(true);
        try {
            await client.delete("/restaurant/account");
            toast({
                title: "Account deleted",
                description: "Your restaurant profile has been permanently deleted.",
            });
            logout();
        } catch (error: any) {
            toast({
                title: "Deletion failed",
                description: error.response?.data?.error || "Failed to delete account",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-500">Account</p>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-500">Manage your password and account.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Change Password */}
                <Card className="rounded-3xl border border-slate-100 p-6 dark:border-slate-900">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-amber-500" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
                    </div>
                    <form className="mt-4 space-y-4" onSubmit={handlePasswordChange}>
                        <div>
                            <label className="text-sm text-slate-500">Current password</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">New password</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500">Confirm new password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        {passwordError && <p className="text-sm text-rose-500">{passwordError}</p>}
                        <Button type="submit" disabled={passwordLoading}>
                            {passwordLoading ? "Updating..." : "Update password"}
                        </Button>
                    </form>
                </Card>

                {/* Delete Account */}
                <Card className="rounded-3xl border border-rose-100 p-6 dark:border-rose-900/30">
                    <div className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-rose-500" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Delete Restaurant</p>
                    </div>
                    <div className="mt-4 rounded-2xl bg-rose-50 p-4 dark:bg-rose-900/10">
                        <p className="text-sm font-medium text-rose-700 dark:text-rose-400">Delete Restaurant Profile</p>
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">
                            This action is permanent and cannot be undone. All your menu items, orders history, and earnings data will be permanently deleted.
                        </p>
                        <Button
                            variant="destructive"
                            className="mt-4"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete my restaurant
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Restaurant Profile
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your restaurant profile, menu items, order history, and all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            To confirm, type <span className="font-mono font-bold text-rose-600">DELETE</span> below:
                        </p>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                        >
                            {deleteLoading ? "Deleting..." : "Delete permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
