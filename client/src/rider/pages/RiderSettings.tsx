import { Bell, Mail, MessageSquare, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { useState } from "react";

export function RiderSettings() {
    const [notifications, setNotifications] = useState({
        newOrders: true,
        emailAlerts: false,
        smsAlerts: true,
        soundAlerts: true,
    });

    const [availability, setAvailability] = useState(true);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-slate-500">Manage your preferences and notifications</p>
            </div>

            {/* Availability Toggle */}
            <Card>
                <CardHeader>
                    <CardTitle>Availability Status</CardTitle>
                    <CardDescription>Set your availability for receiving new delivery requests</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                        <div>
                            <p className="font-semibold">Available for Deliveries</p>
                            <p className="text-sm text-slate-500">
                                {availability ? "You will receive new delivery requests" : "You won't receive new delivery requests"}
                            </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={availability}
                                onChange={(e) => setAvailability(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="peer h-7 w-14 rounded-full bg-slate-200 after:absolute after:left-[4px] after:top-[4px] after:h-6 after:w-6 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-green-600" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">New Order Notifications</p>
                                <p className="text-sm text-slate-500">Get notified when new orders are available</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.newOrders}
                                onChange={(e) => setNotifications({ ...notifications, newOrders: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">Email Alerts</p>
                                <p className="text-sm text-slate-500">Receive updates via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.emailAlerts}
                                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <MessageSquare className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">SMS Alerts</p>
                                <p className="text-sm text-slate-500">Get text messages for important updates</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.smsAlerts}
                                onChange={(e) => setNotifications({ ...notifications, smsAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Volume2 className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="font-medium">Sound Alerts</p>
                                <p className="text-sm text-slate-500">Play sound for new delivery requests</p>
                            </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                            <input
                                type="checkbox"
                                checked={notifications.soundAlerts}
                                onChange={(e) => setNotifications({ ...notifications, soundAlerts: e.target.checked })}
                                className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Payout Settings</CardTitle>
                    <CardDescription>Manage your payout preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Payment Method</label>
                            <select className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option>Bank Transfer</option>
                                <option>Mobile Banking</option>
                                <option>Cash</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Payout Frequency</label>
                            <select className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500">
                                <option>Weekly</option>
                                <option>Bi-weekly</option>
                                <option>Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Bank Account / Mobile Number</label>
                        <input
                            type="text"
                            placeholder="Enter account details"
                            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <button className="rounded-md border border-slate-200 px-6 py-2 text-sm font-medium hover:bg-slate-50">
                    Cancel
                </button>
                <button className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
