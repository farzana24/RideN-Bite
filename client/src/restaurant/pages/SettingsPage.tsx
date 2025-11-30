import { useState, useEffect } from "react";
import { Card } from "../../admin/components/ui/card";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { useRestaurantStore } from "../store/restaurantStore";
import { generalSettingsSchema, type GeneralSettingsValues, securitySettingsSchema, type SecuritySettingsValues } from "../types/schemas";
import { restaurantApi } from "../services/restaurantApi";

const defaultGeneral: GeneralSettingsValues = {
    notification: {
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
    },
    autoAcceptOrders: true,
    maxCookingLoad: 10,
};

const defaultSecurity: SecuritySettingsValues = {
    hasTwoFactorAuth: false,
};

const activeSessions = [
    { id: "1", device: "iPhone 15", location: "Dhaka", lastActive: "2 mins ago" },
    { id: "2", device: "Chrome on Windows", location: "Remote", lastActive: "1 hour ago" },
];

export function SettingsPage() {
    const updateGeneralSettings = useRestaurantStore((state) => state.updateGeneralSettings);
    const [generalValues, setGeneralValues] = useState<GeneralSettingsValues>(defaultGeneral);
    const [securityValues, setSecurityValues] = useState<SecuritySettingsValues>(defaultSecurity);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await restaurantApi.getGeneralSettings();
                setGeneralValues(settings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const handleGeneralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsed = generalSettingsSchema.parse(generalValues);
            await updateGeneralSettings(parsed);
        } catch (err) {
            setGeneralError(err instanceof Error ? err.message : "Invalid data");
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            securitySettingsSchema.parse(securityValues);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-500">Control</p>
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
                <p className="text-sm text-slate-500">Automation, notifications, and security guardrails.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-3xl border border-slate-100 p-6 dark:border-slate-900">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">General</p>
                    <form className="mt-4 space-y-4" onSubmit={handleGeneralSubmit}>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                            <label className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                Email alerts
                                <input
                                    type="checkbox"
                                    checked={generalValues.notification.emailAlerts}
                                    onChange={(e) =>
                                        setGeneralValues((prev) => ({
                                            ...prev,
                                            notification: { ...prev.notification, emailAlerts: e.target.checked },
                                        }))
                                    }
                                />
                            </label>
                            <label className="mt-2 flex items-center justify-between text-sm text-slate-600">
                                SMS alerts
                                <input
                                    type="checkbox"
                                    checked={generalValues.notification.smsAlerts}
                                    onChange={(e) =>
                                        setGeneralValues((prev) => ({
                                            ...prev,
                                            notification: { ...prev.notification, smsAlerts: e.target.checked },
                                        }))
                                    }
                                />
                            </label>
                            <label className="mt-2 flex items-center justify-between text-sm text-slate-600">
                                Push alerts
                                <input
                                    type="checkbox"
                                    checked={generalValues.notification.pushAlerts}
                                    onChange={(e) =>
                                        setGeneralValues((prev) => ({
                                            ...prev,
                                            notification: { ...prev.notification, pushAlerts: e.target.checked },
                                        }))
                                    }
                                />
                            </label>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                            <label className="flex items-center justify-between text-sm text-slate-600">
                                Auto accept orders
                                <input
                                    type="checkbox"
                                    checked={generalValues.autoAcceptOrders}
                                    onChange={(e) =>
                                        setGeneralValues((prev) => ({ ...prev, autoAcceptOrders: e.target.checked }))
                                    }
                                />
                            </label>
                            <div className="mt-4">
                                <label className="text-sm text-slate-500">Max cooking load</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={generalValues.maxCookingLoad}
                                    onChange={(e) =>
                                        setGeneralValues((prev) => ({ ...prev, maxCookingLoad: Number(e.target.value) }))
                                    }
                                />
                            </div>
                        </div>
                        {generalError && <p className="text-sm text-rose-500">{generalError}</p>}
                        <Button type="submit">Save general settings</Button>
                    </form>
                </Card>

                <Card className="rounded-3xl border border-slate-100 p-6 dark:border-slate-900">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Security</p>
                    <form className="mt-4 space-y-4" onSubmit={handleSecuritySubmit}>
                        <label className="flex items-center justify-between text-sm text-slate-600">
                            Two-factor authentication
                            <input
                                type="checkbox"
                                checked={securityValues.hasTwoFactorAuth}
                                onChange={(e) =>
                                    setSecurityValues((prev) => ({ ...prev, hasTwoFactorAuth: e.target.checked }))
                                }
                            />
                        </label>
                        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                            <p className="text-xs uppercase text-slate-400">Active sessions</p>
                            <div className="mt-3 space-y-2 text-sm">
                                {activeSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{session.device}</p>
                                            <p className="text-xs text-slate-500">{session.location} - {session.lastActive}</p>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            Revoke
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit">Save security settings</Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
