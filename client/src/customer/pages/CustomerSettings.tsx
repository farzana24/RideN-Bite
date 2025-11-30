import { Bell, Mail, MessageSquare, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { useState } from "react";

export function CustomerSettings() {
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
        orderUpdates: true,
        promotions: false,
    });

    const [darkMode, setDarkMode] = useState(false);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-slate-500">
                    Manage your account preferences and notifications
                </p>
            </div>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-600" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">Email Alerts</p>
                                <p className="text-sm text-slate-500">Receive order updates via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.emailAlerts}
                                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">SMS Alerts</p>
                                <p className="text-sm text-slate-500">Get text messages for order status</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.smsAlerts}
                                onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">Push Notifications</p>
                                <p className="text-sm text-slate-500">Receive in-app notifications</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.pushAlerts}
                                onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Order Updates</p>
                            <p className="text-sm text-slate-500">Get notified about order status changes</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.orderUpdates}
                                onChange={(e) => setNotifications({ ...notifications, orderUpdates: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Promotions & Offers</p>
                            <p className="text-sm text-slate-500">Receive special deals and discounts</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.promotions}
                                onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {darkMode ? <Moon className="h-5 w-5 text-orange-600" /> : <Sun className="h-5 w-5 text-orange-600" />}
                        Appearance
                    </CardTitle>
                    <CardDescription>Customize how the app looks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-slate-500">Use dark theme across the app</p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-orange-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <button className="rounded-md border border-slate-200 px-6 py-2 text-sm font-medium hover:bg-slate-50">
                    Cancel
                </button>
                <button className="rounded-md bg-orange-600 px-6 py-2 text-sm font-medium text-white hover:bg-orange-700">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
